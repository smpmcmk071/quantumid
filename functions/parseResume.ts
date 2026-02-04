import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { file_url } = await req.json();
    
    if (!file_url) {
      return Response.json({ error: 'File URL required' }, { status: 400 });
    }

    // Use AI to extract structured data from resume
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `You are parsing a professional resume. Extract information EXACTLY as presented in the document.

Resume is attached as a file.

EXTRACT THESE FIELDS:
- full_name: The person's actual name from the top of the resume
- email: Email address
- phone: Phone number if present
- education: Array of education entries with degree, school, year
- years_experience: Total years (extract from summary or calculate from dates)
- skills: Array of all skills mentioned (technical and soft skills)
- job_history: Array of all jobs with ACCURATE details:
  * position: The exact job title
  * employer: The exact company/organization name
  * start_date: Start date in YYYY-MM-DD format (estimate if only year given, e.g., "2005" → "2005-01-01")
  * end_date: End date in YYYY-MM-DD format (use current date if "Present", e.g., "2025-02-04")
  * responsibilities: ALL bullet points/descriptions for this job as one string, preserving the original text
  * skills: Array of specific skills used in this role

CRITICAL RULES:
1. For dates: If only a year is given (e.g., "2005"), use "2005-01-01"
2. For "Present" or current roles: Use "2025-02-04" as end_date
3. For responsibilities: Include ALL bullet points exactly as written in the resume
4. For job_history: Return one entry per job, in chronological order (most recent first)
5. Do NOT combine or summarize responsibilities - preserve the original text

Return format:
{
  "full_name": "string",
  "email": "string",
  "phone": "string",
  "education": [{"degree": "string", "school": "string", "year": "YYYY"}],
  "years_experience": number,
  "skills": ["skill1", "skill2"],
  "job_history": [
    {
      "position": "string",
      "employer": "string",
      "start_date": "YYYY-MM-DD",
      "end_date": "YYYY-MM-DD",
      "responsibilities": "string with all bullet points",
      "skills": ["skill1", "skill2"]
    }
  ]
}`,
      file_urls: [file_url],
      response_json_schema: {
        type: 'object',
        properties: {
          full_name: { type: 'string' },
          email: { type: 'string' },
          phone: { type: 'string' },
          education: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                degree: { type: 'string' },
                school: { type: 'string' },
                year: { type: 'string' }
              }
            }
          },
          years_experience: { type: 'number' },
          skills: { type: 'array', items: { type: 'string' } },
          job_history: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                position: { type: 'string' },
                employer: { type: 'string' },
                start_date: { type: 'string' },
                end_date: { type: 'string' },
                responsibilities: { type: 'string' },
                skills: { type: 'array', items: { type: 'string' } }
              }
            }
          }
        }
      }
    });

    // Process and structure the extracted data
    const extractedData = {
      full_name: response.full_name || null,
      email: response.email || null,
      phone: response.phone || null,
      years_experience: response.years_experience || 0,
      skills: response.skills || [],
      education: response.education || [],
      job_history: response.job_history || []
    };

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