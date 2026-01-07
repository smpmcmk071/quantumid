import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { clientId, teamSize, numberOfTeams, task } = await req.json();
    
    if (!clientId || !teamSize || !numberOfTeams) {
      return Response.json({ error: 'Client ID, team size, and number of teams required' }, { status: 400 });
    }

    // Get all team members for this client
    const teams = await base44.entities.Team.filter({ client_id: clientId });
    const allMembers = await Promise.all(
      teams.map(t => base44.entities.TeamMember.filter({ team_id: t.id }))
    );
    const members = allMembers.flat();

    if (members.length < teamSize * numberOfTeams) {
      return Response.json({ 
        error: `Not enough members. Need ${teamSize * numberOfTeams}, have ${members.length}` 
      }, { status: 400 });
    }

    // Classify archetypes for all members
    const membersWithArchetype = members.map(m => {
      let archetype = 'harmonizer'; // default
      const lp = m.life_path_western;
      
      if ([1, 8, 11, 22].includes(lp)) archetype = 'visionary';
      else if ([4, 7].includes(lp)) archetype = 'strategist';
      else if ([3, 5, 33].includes(lp)) archetype = 'creator';
      else if ([2, 6, 9].includes(lp)) archetype = 'harmonizer';
      
      return {
        ...m,
        archetype,
        hasMaster: m.master_numbers ? m.master_numbers.split(',').length > 0 : false
      };
    });

    // Build prompt for AI team builder
    const prompt = `You are a PhD-level team building expert. Build ${numberOfTeams} optimal teams of EXACTLY ${teamSize} people each.

CRITICAL: Each team must have EXACTLY ${teamSize} members, no more, no less.

Available people:
${membersWithArchetype.map((m, i) => 
  `${i + 1}. ${m.full_name} - Life Path ${m.life_path_western}, Archetype: ${m.archetype}, Master Numbers: ${m.master_numbers || 'None'}, Role: ${m.role || 'N/A'}${m.work_style_challenges ? `, Challenges: ${m.work_style_challenges}` : ''}`
).join('\n')}

${task ? `Task for teams: ${task}` : 'General purpose teams'}

Rules:
1. CRITICAL: Each team must have EXACTLY ${teamSize} members total
2. Each team should have a balanced mix of archetypes when possible
3. Prioritize people with Master Numbers (11, 22, 33) as they have higher potential
4. Distribute Master Number holders across teams
5. Consider work style challenges - if someone prefers solo work, give them analytical/independent roles
6. Assign specific roles within each team based on the archetype and life path
7. Explain why each person fits their role based on their numerology AND how their challenges are accommodated

Return as JSON with this structure:
{
  "teams": [
    {
      "teamNumber": 1,
      "members": [
        {
          "memberId": "id_here",
          "name": "name",
          "assignedRole": "Team Leader",
          "archetype": "visionary",
          "lifePath": 1,
          "reasoning": "Life Path 1 brings natural leadership..."
        }
      ],
      "teamSummary": "Balanced team with strong leadership...",
      "archetypeBalance": {"visionary": 1, "strategist": 1, "creator": 1, "harmonizer": 2}
    }
  ],
  "overallAnalysis": "Teams are balanced across..."
}`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          teams: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                teamNumber: { type: 'integer' },
                members: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      memberId: { type: 'string' },
                      name: { type: 'string' },
                      assignedRole: { type: 'string' },
                      archetype: { type: 'string' },
                      lifePath: { type: 'integer' },
                      reasoning: { type: 'string' }
                    }
                  }
                },
                teamSummary: { type: 'string' },
                archetypeBalance: { type: 'object' }
              }
            }
          },
          overallAnalysis: { type: 'string' }
        }
      }
    });

    return Response.json({
      success: true,
      data: response
    });

  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});