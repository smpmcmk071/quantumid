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

    // Chinese Zodiac Clash Detection
    const chineseClashes = {
      'Rat': 'Horse', 'Horse': 'Rat',
      'Ox': 'Goat', 'Goat': 'Ox',
      'Tiger': 'Monkey', 'Monkey': 'Tiger',
      'Rabbit': 'Rooster', 'Rooster': 'Rabbit',
      'Dragon': 'Dog', 'Dog': 'Dragon',
      'Snake': 'Pig', 'Pig': 'Snake'
    };

    // Prepare comprehensive member data
    const membersWithFullData = members.map(m => {
      let archetype = m.archetype_primary || 'harmonizer';
      
      return {
        ...m,
        archetype,
        hasMaster: m.master_numbers ? m.master_numbers.split(',').length > 0 : false,
        chineseClash: m.chinese_animal ? chineseClashes[m.chinese_animal] : null
      };
    });

    // Build prompt for AI team builder with comprehensive data
    const prompt = `You are a PhD-level team building expert specializing in numerology, astrology, and behavioral science. Build ${numberOfTeams} optimal teams of EXACTLY ${teamSize} people each.

CRITICAL: Each team must have EXACTLY ${teamSize} members, no more, no less.

Available people with COMPREHENSIVE profiles:
${membersWithFullData.map((m, i) => 
  `Person ${i + 1}:
  Name: ${m.full_name}
  Birth Date: ${m.birth_date}
  
  NUMEROLOGY:
  - Life Path (Western): ${m.life_path_western || 'N/A'}
  - Life Path (Chaldean): ${m.life_path_chaldean || 'N/A'}
  - Expression: ${m.expression_western || 'N/A'}
  - Soul Urge: ${m.soul_urge_western || 'N/A'}
  - Personality: ${m.personality_western || 'N/A'}
  - Birthday Number: ${m.birthday_number || 'N/A'}
  - Master Numbers: ${m.master_numbers || 'None'}
  - Karmic Debt: ${m.karmic_debt || 'None'}
  - Karmic Lessons: ${m.karmic_lessons || 'None'}
  
  ASTROLOGY:
  - Sun Sign: ${m.sun_sign || 'N/A'}
  - Moon Sign: ${m.moon_sign || 'N/A'}
  - Ascendant: ${m.ascendant || 'N/A'}
  - Western Element: ${m.element || 'N/A'}
  - Dominant Element: ${m.dominant_element || 'N/A'}
  - Chinese Zodiac: ${m.chinese_zodiac || 'N/A'} (${m.chinese_animal || 'N/A'} ${m.chinese_element || 'N/A'})
  - Chinese Clash With: ${m.chineseClash || 'None'}
  
  ARCHETYPE:
  - Primary: ${m.archetype_primary || m.archetype || 'N/A'}
  - Secondary: ${m.archetype_secondary || 'N/A'}
  
  PROFESSIONAL:
  - Role: ${m.role || 'N/A'}
  - Seniority: ${m.seniority || 'N/A'}
  - Skills: ${m.skills || 'N/A'}
  - Work Style Challenges: ${m.work_style_challenges || 'None'}
  ${m.numerology_analysis ? `\n  DETAILED ANALYSIS: ${m.numerology_analysis.substring(0, 300)}...\n` : ''}
`).join('\n---\n')}

${task ? `TASK FOR TEAMS: ${task}` : 'General purpose teams'}

RULES FOR TEAM BUILDING:
1. CRITICAL: Each team must have EXACTLY ${teamSize} members total - DO NOT ADD EXTRA PEOPLE
2. Balance archetypes (Visionary, Strategist, Creator, Harmonizer) across teams
3. Prioritize distributing people with Master Numbers (11, 22, 33) - they have amplified potential
4. AVOID Chinese Zodiac clashes on the same team (e.g., Rat + Horse, Dragon + Dog, etc.) unless other factors strongly override
5. Balance elements (Fire, Earth, Air, Water) - diverse elements create synergy
6. Consider work style challenges - accommodate them with appropriate role assignments
7. Balance Life Path numbers - complementary paths work better together
8. Pay attention to Karmic Debt and Karmic Lessons - these indicate growth areas
9. Assign specific roles within each team:
   - Team Leader (visionary/high life path)
   - Analyst/Planner (strategist)
   - Creative Lead (creator)
   - Support/Coordinator (harmonizer)
   - Adjust based on actual team size
10. Explain each assignment referencing their comprehensive numerology, astrology, and archetype data

Return as JSON:
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
          "reasoning": "Life Path 1 brings natural leadership. Sun in Aries amplifies initiative. No Chinese Zodiac clashes with team members..."
        }
      ],
      "teamSummary": "Balanced team with strong leadership and diverse elements...",
      "archetypeBalance": {"visionary": 1, "strategist": 1, "creator": 1, "harmonizer": 2},
      "elementBalance": {"Fire": 1, "Earth": 2, "Air": 1, "Water": 1},
      "potentialChallenges": "Note any Chinese Zodiac clashes, element imbalances, or work style conflicts and how they're mitigated"
    }
  ],
  "overallAnalysis": "Teams are scientifically balanced across numerology, astrology, and archetypes..."
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
                archetypeBalance: { type: 'object' },
                elementBalance: { type: 'object' },
                potentialChallenges: { type: 'string' }
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