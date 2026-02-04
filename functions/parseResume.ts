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
      prompt: `You are parsing a resume. Extract ONLY the information that is explicitly present. DO NOT MAKE UP OR GUESS ANY DATA.

Resume is attached as a file.

Extract ONLY if explicitly found:
- full_name: A person's actual name (e.g., "Sarah Johnson", "Michael Chen"). 
  ❌ WRONG: "An enthusiastic designer", "Senior Developer", "Designer", "Anonymous Designer"
  ✅ CORRECT: Only extract if you see "Name: John Smith" or similar clear name indicators
  If NO PERSON NAME is found, return null.

- email: An email address (e.g., "john@example.com"). If none found, return null.

- skills: Array of technical/soft skills mentioned (e.g., ["design", "communication", "project management"])

- years_experience: Extract the NUMBER ONLY from phrases like "4+ years", "over 4 years" → 4
  If it says "4+" return 4. If "10+ years" return 10.

- education: Highest degree and institution if mentioned

- previous_roles: Job titles and companies if mentioned

STRICT RULES:
1. If resume says "An enthusiastic designer..." - that's a DESCRIPTION, NOT a name. Return null for full_name.
2. Only extract full_name if you see format like "Name: [First Last]" or at the top like a heading.
3. If uncertain about any field, return null/empty rather than guessing.

Return format:
{
  "full_name": null,
  "email": null,
  "skills": [],
  "years_experience": 0,
  "education": null,
  "previous_roles": []
}`,
      file_urls: [file_url],
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