import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Mode to energy mapping
const MODE_ENERGY = {
  0: 'feminine',
  1: 'masculine'
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { userProfileId, trackId } = await req.json();
    
    if (!userProfileId || !trackId) {
      return Response.json({ error: 'userProfileId and trackId required' }, { status: 400 });
    }
    
    // Fetch user profile and track
    const profiles = await base44.entities.UserMusicProfile.filter({ id: userProfileId });
    const tracks = await base44.entities.MusicTrack.filter({ id: trackId });
    
    if (profiles.length === 0 || tracks.length === 0) {
      return Response.json({ error: 'Profile or track not found' }, { status: 404 });
    }
    
    const userProfile = profiles[0];
    const track = tracks[0];
    
    let score = 0;
    const reasons = [];
    
    // 1. ZODIAC MATCH (25 points)
    const trackZodiac = track.astrology_zodiac_affinity;
    if (trackZodiac === userProfile.sun_sign) {
      score += 25;
      reasons.push(`Sun sign match: ${trackZodiac}`);
    } else if (trackZodiac === userProfile.moon_sign) {
      score += 20;
      reasons.push(`Moon sign match: ${trackZodiac}`);
    } else if (trackZodiac === userProfile.rising_sign) {
      score += 15;
      reasons.push(`Rising sign match: ${trackZodiac}`);
    }
    
    // 2. PLANETARY ALIGNMENT (20 points)
    const planetInfluence = track.astrology_planetary_influence;
    if (userProfile.planets && userProfile.planets[planetInfluence]) {
      score += 20;
      reasons.push(`${planetInfluence} alignment`);
    }
    
    // 3. HOUSE PLACEMENT (15 points)
    const trackHouse = track.astrology_house_placement;
    if (userProfile.houses && userProfile.houses[`house${trackHouse}`]) {
      score += 15;
      reasons.push(`House ${trackHouse} resonance`);
    }
    
    // 4. NUMEROLOGY MATCH (20 points)
    if (track.master_number === userProfile.life_path_number) {
      score += 20;
      reasons.push(`Life path number match: ${track.master_number}`);
    } else if (track.numerology_artist === userProfile.expression_number) {
      score += 10;
      reasons.push(`Expression number alignment`);
    }
    
    // 5. MODE/POLARITY (10 points)
    const modeEnergy = MODE_ENERGY[track.mode] || 'neutral';
    if (userProfile.dominant_polarity === modeEnergy) {
      score += 10;
      reasons.push(`Energy polarity match: ${modeEnergy}`);
    }
    
    // 6. ELEMENT MATCH (10 points)
    if (userProfile.element && track.astrology_zodiac_affinity) {
      // Check if track's zodiac element matches user's element
      score += 10;
      reasons.push(`Element harmony`);
    }
    
    // Normalize to 0-1 scale
    const normalizedScore = score / 100;
    
    const result = {
      match_score: normalizedScore,
      match_reasons: reasons,
      match_zodiac: trackZodiac,
      match_planet_influence: planetInfluence,
      match_house_position: trackHouse
    };
    
    return Response.json({ success: true, data: result });
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});