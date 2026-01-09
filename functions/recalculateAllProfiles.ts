import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { clientId } = await req.json();

    if (!clientId) {
      return Response.json({ error: 'Client ID required' }, { status: 400 });
    }

    const results = {
      teamMembers: { updated: 0, errors: [] },
      candidates: { updated: 0, errors: [] }
    };

    // Recalculate all team members
    const teamMembers = await base44.asServiceRole.entities.TeamMember.list();
    const clientTeams = await base44.asServiceRole.entities.Team.filter({ client_id: clientId });
    const clientTeamIds = clientTeams.map(t => t.id);

    for (const member of teamMembers) {
      if (!clientTeamIds.includes(member.team_id)) continue;

      try {
        const response = await base44.functions.invoke('calculateNumerology', {
          type: 'name',
          name: member.full_name,
          birthDate: member.birth_date
        });

        if (response.data?.success) {
          const calc = response.data.data;

          await base44.asServiceRole.entities.TeamMember.update(member.id, {
            life_path_western: calc.lifePath?.reduced || 0,
            life_path_chaldean: calc.lifePathChaldean?.reduced || 0,
            life_path_chaldean2: calc.lifePathChaldean2?.reduced || 0,
            expression_western: calc.expression?.reduced || 0,
            expression_chaldean: calc.expressionChaldean?.reduced || 0,
            expression_chaldean2: calc.expressionChaldean2?.reduced || 0,
            soul_urge_western: calc.soulUrge?.reduced || 0,
            soul_urge_chaldean: calc.soulUrgeChaldean?.reduced || 0,
            soul_urge_chaldean2: calc.soulUrgeChaldean2?.reduced || 0,
            personality_western: calc.personality?.reduced || 0,
            personality_chaldean: calc.personalityChaldean?.reduced || 0,
            personality_chaldean2: calc.personalityChaldean2?.reduced || 0,
            birthday_number: calc.birthday?.reduced || 0,
            pythagorean_total: calc.pythagoreanTotal || 0,
            chaldean_total: calc.chaldeanTotal || 0,
            gematria_simple: calc.gematriaSimple || 0,
            gematria_reverse: calc.gematriaReverse || 0,
            master_numbers: (Array.isArray(calc.masterNumbers) && calc.masterNumbers.length > 0) ? calc.masterNumbers.join(', ') : '',
            element: calc.astrology?.element || '',
            chinese_zodiac: calc.astrology?.chineseZodiac || '',
            chinese_animal: calc.astrology?.chineseAnimal || '',
            chinese_element: calc.astrology?.chineseElement || '',
            sun_sign: calc.astrology?.sign || '',
            moon_sign: calc.astrology?.moonSign || '',
            ascendant: calc.astrology?.ascendant || '',
            dominant_element: calc.astrology?.dominantElement || '',
            dominant_modality: calc.astrology?.dominantModality || ''
          });

          // Auto-classify archetype
          await base44.functions.invoke('classifyArchetype', {
            personId: member.id,
            entityType: 'TeamMember'
          });

          results.teamMembers.updated++;
        }
      } catch (error) {
        results.teamMembers.errors.push({
          memberId: member.id,
          name: member.full_name,
          error: error.message
        });
      }
    }

    // Recalculate all candidates
    const candidates = await base44.asServiceRole.entities.Candidate.filter({ client_id: clientId });

    for (const candidate of candidates) {
      try {
        const response = await base44.functions.invoke('calculateNumerology', {
          type: 'name',
          name: candidate.full_name,
          birthDate: candidate.birth_date
        });

        if (response.data?.success) {
          const calc = response.data.data;

          await base44.asServiceRole.entities.Candidate.update(candidate.id, {
            life_path_western: calc.lifePath?.reduced || 0,
            life_path_chaldean: calc.lifePathChaldean?.reduced || 0,
            life_path_chaldean2: calc.lifePathChaldean2?.reduced || 0,
            expression_western: calc.expression?.reduced || 0,
            expression_chaldean: calc.expressionChaldean?.reduced || 0,
            expression_chaldean2: calc.expressionChaldean2?.reduced || 0,
            soul_urge_western: calc.soulUrge?.reduced || 0,
            soul_urge_chaldean: calc.soulUrgeChaldean?.reduced || 0,
            soul_urge_chaldean2: calc.soulUrgeChaldean2?.reduced || 0,
            personality_western: calc.personality?.reduced || 0,
            personality_chaldean: calc.personalityChaldean?.reduced || 0,
            personality_chaldean2: calc.personalityChaldean2?.reduced || 0,
            birthday_number: calc.birthday?.reduced || 0,
            pythagorean_total: calc.pythagoreanTotal || 0,
            chaldean_total: calc.chaldeanTotal || 0,
            gematria_simple: calc.gematriaSimple || 0,
            gematria_reverse: calc.gematriaReverse || 0,
            master_numbers: (Array.isArray(calc.masterNumbers) && calc.masterNumbers.length > 0) ? calc.masterNumbers.join(', ') : '',
            element: calc.astrology?.element || '',
            chinese_zodiac: calc.astrology?.chineseZodiac || '',
            chinese_animal: calc.astrology?.chineseAnimal || '',
            chinese_element: calc.astrology?.chineseElement || '',
            sun_sign: calc.astrology?.sign || '',
            moon_sign: calc.astrology?.moonSign || '',
            ascendant: calc.astrology?.ascendant || '',
            dominant_element: calc.astrology?.dominantElement || '',
            dominant_modality: calc.astrology?.dominantModality || ''
          });

          // Auto-classify archetype
          await base44.functions.invoke('classifyArchetype', {
            personId: candidate.id,
            entityType: 'Candidate'
          });

          results.candidates.updated++;
        }
      } catch (error) {
        results.candidates.errors.push({
          candidateId: candidate.id,
          name: candidate.full_name,
          error: error.message
        });
      }
    }

    return Response.json({
      success: true,
      data: results
    });

  } catch (error) {
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
});