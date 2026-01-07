import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { candidateId, interviewResponses } = await req.json();
    
    if (!candidateId || !interviewResponses) {
      return Response.json({ error: 'Candidate ID and interview responses required' }, { status: 400 });
    }

    const candidate = await base44.entities.Candidate.get(candidateId);
    const jobPosting = candidate.job_posting_id 
      ? await base44.entities.JobPosting.get(candidate.job_posting_id) 
      : null;

    // Assess interview responses with AI
    const assessment = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert HR interviewer. Assess this candidate's interview responses.

Candidate: ${candidate.full_name}
Applied for: ${jobPosting?.job_title || 'General Position'}
Required Skills: ${jobPosting?.required_skills || 'Not specified'}
Current Skills: ${candidate.extracted_skills || 'Not specified'}

Interview Responses:
${interviewResponses}

Provide:
1. Overall assessment score (0-100)
2. Key strengths demonstrated
3. Areas of concern
4. Communication quality rating (1-5)
5. Technical competency rating (1-5)
6. Cultural fit rating (1-5)
7. Recommendation (strongly_recommend, recommend, consider, not_recommended)
8. Brief summary (2-3 sentences)
9. Next steps recommendation`,
      response_json_schema: {
        type: 'object',
        properties: {
          overall_score: { type: 'number' },
          strengths: { type: 'string' },
          concerns: { type: 'string' },
          communication_rating: { type: 'number' },
          technical_rating: { type: 'number' },
          cultural_fit_rating: { type: 'number' },
          recommendation: { type: 'string' },
          summary: { type: 'string' },
          next_steps: { type: 'string' }
        }
      }
    });

    // Update candidate with interview data
    await base44.entities.Candidate.update(candidateId, {
      interview_responses: interviewResponses,
      interview_assessment: JSON.stringify(assessment),
      interview_score: assessment.overall_score,
      interview_summary: assessment.summary
    });

    return Response.json({
      success: true,
      data: assessment
    });

  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});