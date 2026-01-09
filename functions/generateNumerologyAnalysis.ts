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
        lifePathTotal: person.life_path_western,
        expressionReduced: person.expression_western,
        expressionTotal: person.pythagorean_total,
        soulUrgeReduced: person.soul_urge_western,
        personalityReduced: person.personality_western
      },
      chaldean: {
        lifePathTotal: person.life_path_chaldean,
        lifePath2: person.life_path_chaldean2,
        expressionReduced: person.expression_chaldean,
        expression2: person.expression_chaldean2,
        expressionTotal: person.chaldean_total,
        soulUrgeReduced: person.soul_urge_chaldean,
        soulUrge2: person.soul_urge_chaldean2,
        personalityReduced: person.personality_chaldean,
        personality2: person.personality_chaldean2
      },
      lifePath: {
        western: person.life_path_western,
        chaldean: person.life_path_chaldean,
        chaldean2: person.life_path_chaldean2
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
        chineseAnimal: person.chinese_animal,
        chineseElement: person.chinese_element,
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
    const prompt = `You are a PhD-level expert numerologist and astrologist with deep knowledge of Pythagorean, Chaldean, and Kabbalistic systems. Generate a comprehensive, detailed numerology analysis for this person.

**Person Data:**
${JSON.stringify(numerologyData, null, 2)}

**CRITICAL INSTRUCTIONS - READ CAREFULLY:**

1. **Overview & Energy Pattern**: Start with their unique numerology vibes and overall energetic signature

2. **Pythagorean Analysis (Western)**:
   - Life Path ${person.life_path_western}: Core life purpose and journey
   - Expression ${person.expression_western} (from total ${person.pythagorean_total}): Analyze BOTH the compound number meaning AND the reduced number
   - Soul Urge ${person.soul_urge_western}: Inner desires and motivations
   - Personality ${person.personality_western}: Outer persona and first impressions
   - Birthday ${person.birthday_number}: Special gifts from birth day

3. **Chaldean Analysis** (MORE MYSTICAL - emphasize sound vibrations and deeper spiritual layers):
   - Life Path Chaldean: ${person.life_path_chaldean} and ${person.life_path_chaldean2}
   - Expression Chaldean: ${person.expression_chaldean}, ${person.expression_chaldean2} (from total ${person.chaldean_total})
   - Soul Urge Chaldean: ${person.soul_urge_chaldean}, ${person.soul_urge_chaldean2} - emphasize intuitive/mystical connections
   - Personality Chaldean: ${person.personality_chaldean}, ${person.personality_chaldean2} - reveal metaphysical interaction patterns
   - Explain how Chaldean reveals DEEPER layers than Pythagorean

4. **KARMIC PATTERNS - CRITICAL SECTION**:
   - Karmic Debt Numbers: ${person.karmic_debt || 'None'} - If present (13, 14, 16, 19), explain the SPECIFIC karmic lesson and challenge in detail
   - **SPECIAL ATTENTION to 16/7 (The Tower)**: If present, this is a powerful spiritual awakening number involving ego dissolution and rebuilding
   - Karmic Lessons: ${person.karmic_lessons || 'None'} - Missing numbers indicating growth areas
   - Master Numbers: ${person.master_numbers || 'None'} - Explain amplified potential and higher spiritual calling

5. **Astrological Integration**:
   - Sun ${person.sun_sign}, Moon ${person.moon_sign}, Ascendant ${person.ascendant}
   - Chinese: ${person.chinese_zodiac} (${person.chinese_animal} ${person.chinese_element})
   - Element: ${person.element}, Dominant: ${person.dominant_element}
   - **HOW Chinese Zodiac differentiates them** from typical ${person.sun_sign} with Life Path ${person.life_path_western}

6. **Gematria Insights**: 
   - Simple: ${person.gematria_simple}, Reverse: ${person.gematria_reverse}
   - Hidden numerical patterns and sacred geometry

7. **Team Archetype Context**: 
   - Primary: ${person.archetype_primary}, Secondary: ${person.archetype_secondary}
   - How numerology supports their archetype role

8. **Work Style & Practical Applications**: Strengths, challenges, ideal roles, team dynamics

**CRITICAL REQUIREMENTS**:
- NEVER skip or gloss over karmic debt numbers (especially 16/7 Tower, 13/4, 14/5, 19/1)
- ALWAYS analyze compound numbers before reduction (e.g., 74/11, 47/11, 25/7, 34/7, 16/7)
- Emphasize how Chaldean provides DEEPER mystical insights than Pythagorean
- Be thorough: 1800-2500 words minimum
- Use clear section headers with markdown formatting
- Write in professional yet accessible tone

Generate the complete, detailed analysis now:`;

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