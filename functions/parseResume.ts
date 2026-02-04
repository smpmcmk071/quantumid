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

    // Validate and filter extracted data - only include what's actually found
    const extractedData = {};
    
    // Validate full_name - reject job titles/descriptions
    const invalidNames = ['designer', 'developer', 'engineer', 'manager', 'enthusiastic', 'anonymous', 'candidate'];
    const nameText = response.full_name?.toLowerCase() || '';
    const isValidName = response.full_name?.trim() && 
                        !invalidNames.some(invalid => nameText.includes(invalid)) &&
                        response.full_name.split(' ').length >= 2 && // At least first and last name
                        response.full_name.split(' ').length <= 4;   // Not a long description
    
    if (isValidName) {
      extractedData.full_name = response.full_name.trim();
    }
    
    // Email must be valid format
    if (response.email?.trim() && response.email.includes('@')) {
      extractedData.email = response.email.trim();
    }
    
    if (response.skills && response.skills.length > 0) {
      extractedData.extracted_skills = response.skills.join(', ');
    }
    
    if (response.years_experience && response.years_experience > 0) {
      extractedData.years_experience = response.years_experience;
    }
    
    if (response.education?.trim()) {
      extractedData.education = response.education.trim();
    }
    
    if (response.previous_roles && response.previous_roles.length > 0) {
      extractedData.previous_roles = response.previous_roles
        .map(r => `${r.title} at ${r.company} (${r.duration})`)
        .join('; ');
    }

    // Generate resume summary
    const summaryParts = [];
    if (extractedData.years_experience >= 0) {
      summaryParts.push(`${extractedData.years_experience} years of experience`);
    }
    if (extractedData.extracted_skills) {
      summaryParts.push(`Skills: ${extractedData.extracted_skills}`);
    }
    if (extractedData.education) {
      summaryParts.push(`Education: ${extractedData.education}`);
    }
    if (extractedData.previous_roles) {
      summaryParts.push(`Previous roles: ${extractedData.previous_roles}`);
    }
    
    if (summaryParts.length > 0) {
      extractedData.parsed_resume_summary = summaryParts.join(' | ');
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