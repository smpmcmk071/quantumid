import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
          return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { resume_text } = await req.json();

        if (!resume_text) {
          return Response.json({ error: 'Resume text required' }, { status: 400 });
        }

        // Use AI to extract structured data from resume
        const response = await base44.integrations.Core.InvokeLLM({
          prompt: `You are an advanced resume parser. Extract and normalize the following resume into a rich structured format.

        RESUME TEXT:
        ${resume_text}

        PARSING INSTRUCTIONS:
        1. Personal Info: Extract name, email, phone, LinkedIn URL, location if present
        2. Professional Summary: Create a 2-3 sentence summary of their experience, expertise, and key strengths based on the entire resume
        3. Experience: For each job:
        - Extract company, title, start/end dates (keep original format like "2024-02", "2005", "Present")
        - Calculate approximate duration in years
        - Determine if role is current (end_date is "Present" or similar)
        - Extract highlights/accomplishments as bullet points (preserve action verbs)
        - List technologies/tools mentioned for that role
        4. Education: Extract degree, major, school, graduation year
        5. Skills: Categorize into leadership, technology, analytics, tools, and other
        6. Metadata: Calculate total years of experience, identify strongest keywords/domains

        CRITICAL RULES:
        - Keep dates in their original format from the resume (don't convert to standard format)
        - Preserve all accomplishments and responsibilities
        - Extract ALL technologies, tools, and skills mentioned
        - Create professional summary from the overall resume context
        - For current roles use "Present" or null for end_date

        Return this exact JSON structure:`,
      response_json_schema: {
        type: 'object',
        properties: {
          personal_info: {
            type: 'object',
            properties: {
              full_name: { type: 'string' },
              email: { type: 'string' },
              phone: { type: 'string' },
              linkedin: { type: 'string' },
              location: { type: 'string' }
            }
          },
          professional_summary: { type: 'string', description: '2-3 sentence summary of expertise' },
          experience: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                company: { type: 'string' },
                title: { type: 'string' },
                start_date: { type: 'string' },
                end_date: { type: 'string' },
                is_current: { type: 'boolean' },
                duration_years: { type: 'string' },
                highlights: { type: 'array', items: { type: 'string' } },
                technologies: { type: 'array', items: { type: 'string' } }
              }
            }
          },
          education: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                degree: { type: 'string' },
                major: { type: 'string' },
                school: { type: 'string' },
                graduation_year: { type: 'number' }
              }
            }
          },
          skills: {
            type: 'object',
            properties: {
              leadership: { type: 'array', items: { type: 'string' } },
              technology: { type: 'array', items: { type: 'string' } },
              analytics: { type: 'array', items: { type: 'string' } },
              tools: { type: 'array', items: { type: 'string' } },
              other: { type: 'array', items: { type: 'string' } }
            }
          },
          metadata: {
            type: 'object',
            properties: {
              total_experience_years: { type: 'string' },
              strongest_keywords: { type: 'array', items: { type: 'string' } },
              primary_domain: { type: 'string' }
            }
          }
        }
        }
        });

        // Process and structure the extracted data
        if (!response) {
          return Response.json({ success: false, error: 'No response from LLM' }, { status: 500 });
        }

        // Transform the LLM response into our job_history format for compatibility
        const job_history = (response.experience || []).map(exp => ({
          employer: exp.company || '',
          position: exp.title || '',
          start_date: exp.start_date || '',
          end_date: exp.end_date || '',
          responsibilities: (exp.highlights || []).join('\n• '),
          skills: exp.technologies || []
        }));

        const extractedData = {
          full_name: response.personal_info?.full_name || null,
          email: response.personal_info?.email || null,
          phone: response.personal_info?.phone || null,
          linkedin: response.personal_info?.linkedin || null,
          location: response.personal_info?.location || null,
          professional_summary: response.professional_summary || '',
          years_experience: parseInt(response.metadata?.total_experience_years) || 0,
          skills: response.metadata?.strongest_keywords || [],
          education: response.education || [],
          job_history: job_history,
          raw_parsed: response
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