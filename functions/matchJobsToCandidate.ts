import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { candidateId, clientId } = await req.json();
    
    if (!candidateId || !clientId) {
      return Response.json({ error: 'Candidate ID and Client ID required' }, { status: 400 });
    }

    const candidate = await base44.entities.Candidate.get(candidateId);
    const jobs = await base44.entities.JobPosting.filter({ client_id: clientId, status: 'open' });
    
    if (jobs.length === 0) {
      return Response.json({ success: true, data: [] });
    }

    const prompt = `Match this candidate to open job positions.

Candidate: ${candidate.full_name}
Life Path: ${candidate.life_path_western}
Archetype: ${candidate.archetype_primary || 'Unknown'}
Skills: ${candidate.extracted_skills || 'Not specified'}
Experience: ${candidate.years_experience || 0} years
Master Numbers: ${candidate.master_numbers || 'None'}
Education: ${candidate.education || 'Not provided'}

Open Jobs:
${jobs.map((j, i) => 
  `${i + 1}. ${j.job_title} (${j.seniority}) - Required: ${j.required_skills || 'Not specified'}`
).join('\n')}

Rank ALL jobs from best to worst fit. For each:
1. Skill match score (0-100)
2. Experience fit score (0-100)
3. Numerology alignment score (0-100)
4. Overall match: (skillMatch * 0.5) + (experienceFit * 0.3) + (numerologyFit * 0.2)
5. Brief reasoning

Return sorted by overall score descending:
[
  {
    "jobId": "id",
    "jobTitle": "title",
    "overallScore": 88,
    "skillScore": 90,
    "experienceScore": 85,
    "numerologyScore": 80,
    "reasoning": "Strong technical match..."
  }
]`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          matches: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                jobId: { type: 'string' },
                jobTitle: { type: 'string' },
                overallScore: { type: 'number' },
                skillScore: { type: 'number' },
                experienceScore: { type: 'number' },
                numerologyScore: { type: 'number' },
                reasoning: { type: 'string' }
              }
            }
          }
        }
      }
    });

    return Response.json({
      success: true,
      data: response.matches || []
    });

  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});