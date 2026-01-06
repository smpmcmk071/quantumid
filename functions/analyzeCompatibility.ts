import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { candidateId, teamId, jobPostingId } = await req.json();
    
    if (!candidateId) {
      return Response.json({ error: 'Candidate ID required' }, { status: 400 });
    }

    // Fetch data
    const candidate = await base44.entities.Candidate.get(candidateId);
    const team = teamId ? await base44.entities.Team.get(teamId) : null;
    const teamMembers = team ? await base44.entities.TeamMember.filter({ team_id: teamId }) : [];
    const jobPosting = jobPostingId ? await base44.entities.JobPosting.get(jobPostingId) : null;

    // Calculate team fit score (0-100)
    let teamFitScore = 50; // baseline
    let teamFitExplanation = '';
    
    if (team && teamMembers.length > 0) {
      const elementCounts = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
      const lifePathCounts = {};
      
      teamMembers.forEach(m => {
        if (m.element) elementCounts[m.element]++;
        if (m.life_path_western) lifePathCounts[m.life_path_western] = (lifePathCounts[m.life_path_western] || 0) + 1;
      });
      
      const candidateElement = candidate.element;
      const candidateLifePath = candidate.life_path_western;
      
      // Check if candidate adds balance or creates imbalance
      const totalMembers = teamMembers.length;
      const candidateElementCount = elementCounts[candidateElement] || 0;
      const elementBalance = candidateElementCount / totalMembers;
      
      if (elementBalance < 0.3) {
        teamFitScore += 20; // Adds needed diversity
        teamFitExplanation += `✓ Brings ${candidateElement} energy, which is underrepresented in the team (good balance). `;
      } else if (elementBalance > 0.5) {
        teamFitScore -= 10; // Too much of same element
        teamFitExplanation += `⚠ Team already has many ${candidateElement} members (may need more diversity). `;
      }
      
      // Check Life Path compatibility
      const compatiblePaths = {
        1: [3, 5, 7], 2: [4, 6, 8], 3: [1, 5, 9], 4: [2, 6, 8],
        5: [1, 3, 7], 6: [2, 4, 9], 7: [1, 5, 9], 8: [2, 4, 6], 9: [3, 6, 7]
      };
      
      const compatibleCount = teamMembers.filter(m => 
        compatiblePaths[candidateLifePath]?.includes(m.life_path_western)
      ).length;
      
      if (compatibleCount / totalMembers > 0.5) {
        teamFitScore += 15;
        teamFitExplanation += `✓ Strong numerological compatibility with over half the team. `;
      }
      
      teamFitScore = Math.min(100, Math.max(0, teamFitScore));
    }

    // Calculate job fit score (0-100)
    let jobFitScore = 50;
    let jobFitExplanation = '';
    
    if (jobPosting) {
      const requiredSkills = jobPosting.required_skills?.split(',').map(s => s.trim().toLowerCase()) || [];
      const candidateSkills = candidate.extracted_skills?.split(',').map(s => s.trim().toLowerCase()) || [];
      
      const matchedSkills = requiredSkills.filter(rs => 
        candidateSkills.some(cs => cs.includes(rs) || rs.includes(cs))
      );
      
      const skillMatchPercent = requiredSkills.length > 0 
        ? (matchedSkills.length / requiredSkills.length) * 100 
        : 50;
      
      jobFitScore = Math.round(skillMatchPercent);
      jobFitExplanation = `Matches ${matchedSkills.length}/${requiredSkills.length} required skills. `;
      
      if (candidate.years_experience >= 5 && jobPosting.seniority === 'senior') {
        jobFitScore = Math.min(100, jobFitScore + 10);
        jobFitExplanation += `✓ Experience level matches seniority. `;
      }
    }

    // Calculate numerology score (0-100)
    let numerologyScore = 60;
    let numerologyExplanation = '';
    
    const candidateLP = candidate.life_path_western;
    const leadershipNumbers = [1, 8, 11, 22];
    const creativeNumbers = [3, 5, 33];
    const analyticalNumbers = [4, 7];
    const empathicNumbers = [2, 6, 9];
    
    if (jobPosting?.job_title) {
      const title = jobPosting.job_title.toLowerCase();
      
      if ((title.includes('manager') || title.includes('lead')) && leadershipNumbers.includes(candidateLP)) {
        numerologyScore += 20;
        numerologyExplanation += `✓ Life Path ${candidateLP} aligns with leadership roles. `;
      }
      
      if ((title.includes('designer') || title.includes('creative')) && creativeNumbers.includes(candidateLP)) {
        numerologyScore += 20;
        numerologyExplanation += `✓ Life Path ${candidateLP} thrives in creative positions. `;
      }
      
      if ((title.includes('analyst') || title.includes('engineer')) && analyticalNumbers.includes(candidateLP)) {
        numerologyScore += 20;
        numerologyExplanation += `✓ Life Path ${candidateLP} excels in analytical work. `;
      }
      
      if ((title.includes('support') || title.includes('hr') || title.includes('counselor')) && empathicNumbers.includes(candidateLP)) {
        numerologyScore += 20;
        numerologyExplanation += `✓ Life Path ${candidateLP} is naturally empathetic and people-focused. `;
      }
    }
    
    if (candidate.master_numbers) {
      numerologyScore += 10;
      numerologyExplanation += `✓ Master numbers present (${candidate.master_numbers}) - higher potential. `;
    }
    
    numerologyScore = Math.min(100, numerologyScore);

    // Calculate overall score (weighted)
    const overallScore = Math.round(
      (teamFitScore * 0.4) + 
      (jobFitScore * 0.3) + 
      (numerologyScore * 0.3)
    );

    // Determine recommendation
    let recommendation = 'consider';
    if (overallScore >= 80) recommendation = 'strongly_recommend';
    else if (overallScore >= 65) recommendation = 'recommend';
    else if (overallScore < 50) recommendation = 'not_recommended';

    // Generate strengths and concerns using AI
    const aiAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Based on this compatibility analysis, provide a brief summary of strengths and concerns:

Candidate: ${candidate.full_name}
Life Path: ${candidate.life_path_western}
Skills: ${candidate.extracted_skills}
Experience: ${candidate.years_experience} years

Overall Score: ${overallScore}/100
Team Fit: ${teamFitScore}/100
Job Fit: ${jobFitScore}/100
Numerology: ${numerologyScore}/100

Job: ${jobPosting?.job_title || 'N/A'}
Team Size: ${teamMembers.length} members

Provide 2-3 bullet points for strengths and 1-2 for concerns. Be specific and actionable.`,
      response_json_schema: {
        type: 'object',
        properties: {
          strengths: { type: 'string' },
          concerns: { type: 'string' }
        }
      }
    });

    // Save analysis
    const analysis = await base44.entities.CompatibilityAnalysis.create({
      client_id: candidate.client_id,
      candidate_id: candidateId,
      team_id: teamId,
      job_posting_id: jobPostingId,
      overall_score: overallScore,
      team_fit_score: teamFitScore,
      job_fit_score: jobFitScore,
      numerology_score: numerologyScore,
      team_fit_explanation: teamFitExplanation,
      job_fit_explanation: jobFitExplanation,
      numerology_explanation: numerologyExplanation,
      recommendation: recommendation,
      strengths: aiAnalysis.strengths,
      concerns: aiAnalysis.concerns
    });

    return Response.json({
      success: true,
      data: analysis
    });

  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});