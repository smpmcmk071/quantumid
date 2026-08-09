import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { decrypt } from './encryptionUtils.js';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { candidateId } = await req.json();
    
    if (!candidateId) {
      return Response.json({ error: 'Candidate ID required' }, { status: 400 });
    }

    const candidate = await base44.entities.Candidate.get(candidateId);

    // Decrypt sensitive fields
    const decrypted = {
      ...candidate,
      resume_text: candidate.resume_text ? await decrypt(candidate.resume_text) : null,
      interview_responses: candidate.interview_responses ? await decrypt(candidate.interview_responses) : null,
      interview_assessment: candidate.interview_assessment ? await decrypt(candidate.interview_assessment) : null
    };

    return Response.json({
      success: true,
      data: decrypted
    });

  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});