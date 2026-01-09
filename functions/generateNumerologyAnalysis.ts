import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { personId, entityType } = await req.json();

    if (!personId || !entityType) {
      return Response.json({ error: 'Person ID and entity type required' }, { status: 400 });
    }

    // Fetch the person's data
    let person;
    if (entityType === 'TeamMember') {
      person = await base44.entities.TeamMember.list();
      person = person.find(m => m.id === personId);
    } else if (entityType === 'Candidate') {
      person = await base44.entities.Candidate.list();
      person = person.find(c => c.id === personId);
    }

    if (!person) {
      return Response.json({ error: 'Person not found' }, { status: 404 });
    }

    // Build the detailed numerology data structure for the prompt
    const numerologyData = {
      name: person.full_name,
      birthDate: person.birth_date,
      pythagorean: {
        expression: person.expression_western,
        expressionTotal: person.pythagorean_total,
        soulUrge: person.soul_urge_western,
        personality: person.personality_western
      },
      chaldean: {
        expression: person.expression_chaldean,
        expressionTotal: person.chaldean_total,
        soulUrge: person.soul_urge_chaldean,
        personality: person.personality_chaldean
      },
      lifePath: {
        western: person.life_path_western,
        chaldean: person.life_path_chaldean
      },
      birthday: {
        day: person.birthday_number,
        month: new Date(person.birth_date).getMonth() + 1
      },
      gematria: {
        simple: person.gematria_simple,
        reverse: person.gematria_reverse
      },
      karmic: {
        debt: person.karmic_debt || 'None',
        lessons: person.karmic_lessons || 'None'
      },
      masterNumbers: person.master_numbers || 'None',
      astrology: {
        sunSign: person.sun_sign,
        moonSign: person.moon_sign,
        ascendant: person.ascendant,
        chineseZodiac: person.chinese_zodiac,
        element: person.element,
        dominantElement: person.dominant_element,
        dominantModality: person.dominant_modality
      },
      archetype: {
        primary: person.archetype_primary,
        secondary: person.archetype_secondary
      }
    };

    // Generate the detailed analysis using LLM
    const prompt = `You are an expert numerologist and astrologist. Generate a comprehensive, detailed numerology analysis for this person.

**Person Data:**
${JSON.stringify(numerologyData, null, 2)}

**Instructions:**
1. Provide an overview of their numerology vibes and overall energy pattern
2. Analyze the Pythagorean system in depth, focusing on the COMPOUND NUMBERS (the totals before reduction) and what they reveal
3. Analyze the Chaldean system in depth, including compound number meanings
4. Explain their Life Path and Birthday influences
5. Discuss karmic debt and karmic lessons in detail
6. Integrate their astrological profile (Sun, Moon, Ascendant, Chinese Zodiac)
7. Explain how their Chinese Zodiac element/animal differentiates them from typical people with their Sun sign and Life Path
8. Provide insights into their work style, strengths, challenges, and ideal roles
9. Write in a professional yet accessible tone
10. Be thorough - aim for 1500-2000 words
11. Include specific numerological interpretations for compound numbers like 74/11, 20/2, 54/9, 70/7, 23/5, 47/11, 25/7, 34/7, etc.
12. Structure with clear headers for each section

Generate the complete analysis now:`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: prompt
    });

    if (!response) {
      return Response.json({ error: 'Failed to generate analysis' }, { status: 500 });
    }

    // Update the person's record with the analysis
    if (entityType === 'TeamMember') {
      await base44.entities.TeamMember.update(personId, {
        numerology_analysis: response
      });
    } else if (entityType === 'Candidate') {
      await base44.entities.Candidate.update(personId, {
        numerology_analysis: response
      });
    }

    return Response.json({
      success: true,
      data: {
        analysis: response
      }
    });

  } catch (error) {
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
});