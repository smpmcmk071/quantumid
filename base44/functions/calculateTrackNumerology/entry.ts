import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Pythagorean numerology system
const PYTHAGOREAN = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
  J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9,
  S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8
};

const MASTER_NUMBERS = [11, 22, 33];

// Key to zodiac mapping
const KEY_TO_ZODIAC = {
  0: 'Aries',      // C
  1: 'Taurus',     // C#
  2: 'Gemini',     // D
  3: 'Cancer',     // D#
  4: 'Leo',        // E
  5: 'Virgo',      // F
  6: 'Libra',      // F#
  7: 'Scorpio',    // G
  8: 'Sagittarius',// G#
  9: 'Capricorn',  // A
  10: 'Aquarius',  // A#
  11: 'Pisces'     // B
};

// Tempo to planet mapping
const TEMPO_TO_PLANET = [
  { min: 0, max: 60, planet: 'Saturn', quality: 'slow, contemplative' },
  { min: 60, max: 76, planet: 'Moon', quality: 'gentle, flowing' },
  { min: 76, max: 108, planet: 'Venus', quality: 'moderate, pleasant' },
  { min: 108, max: 120, planet: 'Mercury', quality: 'upbeat, communicative' },
  { min: 120, max: 140, planet: 'Sun', quality: 'energetic, vital' },
  { min: 140, max: 180, planet: 'Mars', quality: 'intense, driving' },
  { min: 180, max: 999, planet: 'Uranus', quality: 'explosive, chaotic' }
];

function reduceToDigit(n) {
  if (n < 0) n = Math.abs(n);
  if (MASTER_NUMBERS.includes(n)) return n;
  
  while (n > 9) {
    n = String(n).split('').reduce((sum, d) => sum + parseInt(d), 0);
    if (MASTER_NUMBERS.includes(n)) return n;
  }
  
  return n;
}

function calculateTextNumerology(text) {
  if (!text) return 0;
  const cleaned = text.toUpperCase().replace(/[^A-Z]/g, '');
  const sum = cleaned.split('').reduce((total, char) => {
    return total + (PYTHAGOREAN[char] || 0);
  }, 0);
  return reduceToDigit(sum);
}

function calculateYearNumerology(year) {
  if (!year) return 0;
  const sum = String(year).split('').reduce((total, digit) => total + parseInt(digit), 0);
  return reduceToDigit(sum);
}

function calculateDateNumerology(dateString) {
  if (!dateString) return 0;
  const digits = dateString.replace(/[^0-9]/g, '');
  const sum = digits.split('').reduce((total, digit) => total + parseInt(digit), 0);
  return reduceToDigit(sum);
}

function mapToHouse(energy, valence) {
  const energyLevel = Math.floor((energy || 0.5) * 4);
  const valenceLevel = Math.floor((valence || 0.5) * 3);
  
  const houseMatrix = [
    [12, 8, 4],
    [6, 2, 10],
    [3, 7, 11],
    [1, 5, 9]
  ];
  
  return houseMatrix[Math.min(energyLevel, 3)][Math.min(valenceLevel, 2)];
}

function getTempoPlanetalInfluence(tempo) {
  return TEMPO_TO_PLANET.find(range => tempo >= range.min && tempo <= range.max) || TEMPO_TO_PLANET[0];
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const trackData = await req.json();
    
    const {
      artist_name,
      album_name,
      name: track_name,
      release_date,
      release_year,
      key,
      tempo,
      energy,
      valence
    } = trackData;
    
    // Calculate numerology
    const artistNum = calculateTextNumerology(artist_name);
    const albumNum = calculateTextNumerology(album_name || '');
    const trackNum = calculateTextNumerology(track_name);
    const dateNum = calculateDateNumerology(release_date);
    const yearNum = calculateYearNumerology(release_year);
    
    const combined = artistNum + albumNum + trackNum + dateNum;
    const masterNum = reduceToDigit(combined);
    
    // Astrological mapping
    const zodiacAffinity = KEY_TO_ZODIAC[key] || 'Unknown';
    const planetInfluence = getTempoPlanetalInfluence(tempo || 120);
    const housePlacement = mapToHouse(energy, valence);
    
    const result = {
      numerology_artist: artistNum,
      numerology_album: albumNum,
      numerology_track: trackNum,
      numerology_release_date: dateNum,
      numerology_release_year: yearNum,
      master_number: masterNum,
      is_master_number: MASTER_NUMBERS.includes(masterNum),
      astrology_zodiac_affinity: zodiacAffinity,
      astrology_planetary_influence: planetInfluence.planet,
      astrology_house_placement: housePlacement
    };
    
    return Response.json({ success: true, data: result });
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});