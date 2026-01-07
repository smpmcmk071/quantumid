import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { teamId, startDate, endDate } = await req.json();

    // Get team members
    const members = await base44.entities.TeamMember.filter({ team_id: teamId });

    if (members.length === 0) {
      return Response.json({ error: 'No team members found' }, { status: 400 });
    }

    // Analyze each date in range
    const dates = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      
      // Calculate Universal Day Number and Personal Days for each member
      const calcs = await Promise.all(
        members.map(m => 
          base44.functions.invoke('calculateNumerology', {
            type: 'date',
            date: dateStr,
            birthDate: m.birth_date
          })
        )
      );

      // Extract Universal Day and Personal Days
      const firstCalc = calcs[0]?.data?.data;
      const universalDay = firstCalc?.dayNumbers?.universalDay || 0;
      const personalDays = calcs.map((c, i) => ({
        name: members[i].full_name,
        personalDay: c?.data?.data?.dayNumbers?.personalDay || 0,
        lifePath: members[i].life_path_western
      }));

      dates.push({
        date: dateStr,
        universalDay,
        personalDays
      });
    }

    // Use LLM to score and rank dates
    const prompt = `You are a numerology expert analyzing meeting dates for a team.

TEAM MEMBERS:
${members.map(m => `- ${m.full_name}: Life Path ${m.life_path_western}, Archetype: ${m.archetype_primary || 'Unknown'}`).join('\n')}

DATES TO ANALYZE:
${dates.map(d => `${d.date}: Universal Day ${d.universalDay}, Personal Days: ${d.personalDays.map(p => `${p.name}=${p.personalDay}`).join(', ')}`).join('\n')}

SCORING CRITERIA:
1. Universal Day Number should support collaboration (2, 6, 9 are great for meetings)
2. Team member Personal Day Numbers should be compatible (avoid too many 1s or 8s on same day - too competitive)
3. Look for dates where multiple members have harmonious Personal Days (2+6, 3+5, 4+6, etc.)
4. Avoid dates with conflicting energies (1+8, 4+5 clashes)

Rank the top 5 dates with scores (0-100) and explain why each is good or bad for a team meeting.`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          rankedDates: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                date: { type: 'string' },
                score: { type: 'number' },
                universalDay: { type: 'number' },
                reasoning: { type: 'string' },
                bestFor: { type: 'string' },
                avoid: { type: 'string' }
              }
            }
          }
        }
      }
    });

    return Response.json({ success: true, data: response });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});