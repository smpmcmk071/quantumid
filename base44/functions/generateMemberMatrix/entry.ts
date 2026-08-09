import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { clientId } = await req.json();
    
    const teams = await base44.entities.Team.filter({ client_id: clientId });
    
    let allMembers = [];
    for (const team of teams) {
      const members = await base44.entities.TeamMember.filter({ team_id: team.id });
      allMembers = [...allMembers, ...members];
    }

    // Calculate archetype breakdown
    const archetypes = {
      visionary: 0,
      strategist: 0,
      creator: 0,
      harmonizer: 0
    };

    allMembers.forEach(m => {
      const arch = m.archetype_primary?.toLowerCase();
      if (archetypes.hasOwnProperty(arch)) {
        archetypes[arch]++;
      }
    });

    const total = allMembers.length || 1;
    const breakdown = {
      visionary: archetypes.visionary,
      visionaryPercent: Math.round((archetypes.visionary / total) * 100),
      strategist: archetypes.strategist,
      strategistPercent: Math.round((archetypes.strategist / total) * 100),
      creator: archetypes.creator,
      creatorPercent: Math.round((archetypes.creator / total) * 100),
      harmonizer: archetypes.harmonizer,
      harmonizerPercent: Math.round((archetypes.harmonizer / total) * 100),
      balanceNote: 'Ideal balance: 25% each archetype for optimal team performance'
    };

    // Generate pairing recommendations
    const prompt = `For each team member, identify who they work best with based on numerology.

Members:
${allMembers.map((m, i) => 
  `${i + 1}. ${m.full_name} - Life Path ${m.life_path_western}, ${m.archetype_primary || 'Unknown'}, ${m.element}`
).join('\n')}

Return an array with best pairing suggestions (names only):`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          pairings: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                memberName: { type: 'string' },
                bestPairedWith: { type: 'string' }
              }
            }
          }
        }
      }
    });

    const matrix = allMembers.map(m => {
      const pairing = response.pairings?.find(p => p.memberName === m.full_name);
      return {
        name: m.full_name,
        lifePath: m.life_path_western,
        archetype: m.archetype_primary || 'Unknown',
        element: m.element || 'Unknown',
        potential: m.potential_level || 'Standard',
        bestPairedWith: pairing?.bestPairedWith || 'Analyzing...'
      };
    });

    return Response.json({
      success: true,
      data: matrix,
      archetypeBreakdown: breakdown
    });

  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});