import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { encrypt } from './encryptionUtils.js';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { resumeText, encrypt: shouldEncrypt = true } = await req.json();
    
    if (!resumeText) {
      return Response.json({ error: 'Resume text required' }, { status: 400 });
    }

    // Use AI to extract structured data from resume
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Extract the following information from this resume. Return as JSON.

Resume:
${resumeText}

Extract:
- full_name (string) - ONLY if a clear person's name is present (e.g., "John Smith", "Jane Doe"). Do NOT extract job titles, descriptions, or company names as names. If no clear name found, return empty string.
- email (string) - ONLY if an email address is found. If no email, return empty string.
- skills (array of strings - technical and soft skills mentioned)
- years_experience (number - IMPORTANT: if text says "4+" or "over 4 years" extract as number 4, if "10+ years" extract as 10, etc. Extract the base number only.)
- education (string - highest degree and institution)
- previous_roles (array of objects with: title, company, duration)

CRITICAL RULES:
1. For full_name: ONLY extract actual person names like "John Smith". Do NOT extract "An enthusiastic designer" or job titles.
2. For years_experience: Convert "4+", "over 4 years", "4 years of experience" to just the number 4.
3. If a field is not clearly found, return empty string/array, NOT a guess.

Return format:
{
  "full_name": "",
  "email": "",
  "skills": [],
  "years_experience": 0,
  "education": "",
  "previous_roles": [{"title": "", "company": "", "duration": ""}]
}`,
      response_json_schema: {
        type: 'object',
        properties: {
          full_name: { type: 'string' },
          email: { type: 'string' },
          skills: { type: 'array', items: { type: 'string' } },
          years_experience: { type: 'number' },
          education: { type: 'string' },
          previous_roles: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                company: { type: 'string' },
                duration: { type: 'string' }
              }
            }
          }
        }
      }
    });

    // Only include fields that were actually found (not empty)
    const extractedData = {};
    
    if (response.full_name?.trim()) extractedData.full_name = response.full_name.trim();
    if (response.email?.trim()) extractedData.email = response.email.trim();
    if (response.skills && response.skills.length > 0) {
      extractedData.extracted_skills = response.skills.join(', ');
    }
    if (response.years_experience && response.years_experience > 0) {
      extractedData.years_experience = response.years_experience;
    }
    if (response.education?.trim()) extractedData.education = response.education.trim();
    if (response.previous_roles && response.previous_roles.length > 0) {
      extractedData.previous_roles = response.previous_roles
        .map(r => `${r.title} at ${r.company} (${r.duration})`)
        .join('; ');
    }

    return Response.json({
      success: true,
      data: extractedData
    });

  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});