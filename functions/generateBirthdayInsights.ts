import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { memberId, locationZip } = await req.json();

    if (!memberId) {
      return Response.json({ error: 'Member ID required' }, { status: 400 });
    }

    // Fetch team member
    const member = await base44.asServiceRole.entities.TeamMember.filter({ id: memberId });
    if (!member || member.length === 0) {
      return Response.json({ error: 'Team member not found' }, { status: 404 });
    }

    const teamMember = member[0];

    // Generate insights using LLM
    const insightsResponse = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an organizational psychologist specializing in employee motivation and team dynamics.

Team Member Profile:
- Name: ${teamMember.full_name}
- Role: ${teamMember.role}
- Seniority: ${teamMember.seniority}
- Primary Archetype: ${teamMember.archetype_primary || 'Unknown'}
- Secondary Archetype: ${teamMember.archetype_secondary || 'N/A'}
- Life Path Number: ${teamMember.life_path_western || 'Unknown'}
- Expression Number: ${teamMember.expression_western || 'Unknown'}
- Master Numbers: ${teamMember.master_numbers || 'None'}
- Element: ${teamMember.element || 'Unknown'}
- Work Style Challenges: ${teamMember.work_style_challenges || 'None noted'}

Based on their archetype, numerology, and profile, answer:

1. What does this person TRULY want from their organization in their heart? (Be specific and authentic - not generic corporate speak)
2. What type of recognition matters most to them?
3. What motivates them deeply?

Keep it real, personal, and actionable for their manager.`,
      response_json_schema: {
        type: 'object',
        properties: {
          deep_desire: { type: 'string' },
          recognition_preference: { type: 'string' },
          core_motivation: { type: 'string' }
        }
      }
    });

    // Generate gift suggestions
    const giftResponse = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate personalized birthday gift suggestions for a team member.

Profile:
- Archetype: ${teamMember.archetype_primary} (secondary: ${teamMember.archetype_secondary || 'none'})
- Life Path: ${teamMember.life_path_western}
- Element: ${teamMember.element}
- Location Zip: ${locationZip || '80498'}

Budget: $150-200

Requirements:
- Solo gifts (not group activities)
- Mix of experiences and physical gifts
- Location-based recommendations for ${locationZip || '80498'} area
- Consider their archetype preferences (e.g., Visionaries like innovation/autonomy, Strategists like learning/systems, Creators like hands-on/practical, Harmonizers like wellness/connection)
- Include gift card options for experiences if they prefer experiences over physical items
- Examples: spa/sauna visits, online course gift cards, tech gadgets, books, hobby supplies

Provide 5 specific gift ideas ranked by fit.`,
      response_json_schema: {
        type: 'object',
        properties: {
          gifts: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                type: { type: 'string' },
                price_range: { type: 'string' },
                why_perfect: { type: 'string' },
                where_to_buy: { type: 'string' }
              }
            }
          }
        }
      }
    });

    return Response.json({
      success: true,
      data: {
        member: {
          name: teamMember.full_name,
          role: teamMember.role,
          archetype: teamMember.archetype_primary,
          birth_date: teamMember.birth_date
        },
        insights: insightsResponse,
        gifts: giftResponse.gifts
      }
    });

  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});