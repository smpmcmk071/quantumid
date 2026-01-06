import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { jobId, clientId } = await req.json();
    
    if (!jobId || !clientId) {
      return Response.json({ error: 'Job ID and Client ID required' }, { status: 400 });
    }

    const job = await base44.entities.JobPosting.get(jobId);
    const candidates = await base44.entities.Candidate.filter({ client_id: clientId });
    
    if (candidates.length === 0) {
      return Response.json({ success: true, data: [] });
    }

    // Use AI to match candidates
    const prompt = `You are an expert HR recruiter. Analyze these candidates for this job opening.

Job: ${job.job_title}
Required Skills: ${job.required_skills || 'Not specified'}
Seniority: ${job.seniority}
Description: ${job.description || 'Not provided'}

Candidates:
${candidates.map((c, i) => 
  `${i + 1}. ${c.full_name} - Life Path ${c.life_path_western}, Archetype: ${c.archetype_primary || 'Unknown'}, Skills: ${c.extracted_skills || 'Not specified'}, Experience: ${c.years_experience || 0} years, Master Numbers: ${c.master_numbers || 'None'}`
).join('\n')}

Rank ALL candidates from best to worst match. For each:
1. Calculate skill match percentage (0-100) based on required skills
2. Calculate numerology fit (0-100) - does their archetype fit the role?
3. Calculate overall score as: (skillMatch * 0.6) + (numerologyFit * 0.4)
4. Provide brief reasoning
5. List matched skills

Return JSON array sorted by overall score descending:
[
  {
    "candidateId": "id",
    "name": "name",
    "overallScore": 85,
    "skillScore": 90,
    "numerologyScore": 75,
    "reasoning": "Strong technical match with leadership qualities...",
    "matchedSkills": "Python, React, Leadership"
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
                candidateId: { type: 'string' },
                name: { type: 'string' },
                overallScore: { type: 'number' },
                skillScore: { type: 'number' },
                numerologyScore: { type: 'number' },
                reasoning: { type: 'string' },
                matchedSkills: { type: 'string' }
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