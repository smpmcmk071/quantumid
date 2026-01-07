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
- full_name (string)
- email (string, if found)
- skills (array of strings - technical and soft skills)
- years_experience (number - total years of professional experience)
- education (string - highest degree and institution)
- previous_roles (array of objects with: title, company, duration)

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

    return Response.json({
      success: true,
      data: {
        full_name: response.full_name,
        email: response.email,
        extracted_skills: response.skills?.join(', ') || '',
        years_experience: response.years_experience || 0,
        education: response.education || '',
        previous_roles: response.previous_roles?.map(r => `${r.title} at ${r.company} (${r.duration})`).join('; ') || ''
      }
    });

  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});