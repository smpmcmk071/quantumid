import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { clientId } = await req.json();
    
    const client = await base44.entities.Client.get(clientId);
    const teams = await base44.entities.Team.filter({ client_id: clientId });
    
    let allMembers = [];
    for (const team of teams) {
      const members = await base44.entities.TeamMember.filter({ team_id: team.id });
      allMembers = [...allMembers, ...members];
    }

    const prompt = `Analyze this organization's numerological profile.

Organization: ${client.company_name}
Industry: ${client.industry || 'Not specified'}
Total Teams: ${teams.length}
Total Members: ${allMembers.length}

Member Profiles:
${allMembers.map(m => 
  `${m.full_name} - Life Path ${m.life_path_western}, ${m.archetype_primary || 'Unknown'} archetype, ${m.element} element, Master Numbers: ${m.master_numbers || 'None'}`
).join('\n')}

Provide:
1. Overview: 2-3 sentences describing the organization's numerological culture
2. Strengths: Key organizational strengths based on member profiles (3-4 bullet points)
3. Growth Areas: Areas where the org could improve balance/diversity (2-3 bullet points)
4. Recommendations: Strategic hiring or team composition advice (2-3 recommendations)`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          overview: { type: 'string' },
          strengths: { type: 'string' },
          growthAreas: { type: 'string' },
          recommendations: { type: 'string' }
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