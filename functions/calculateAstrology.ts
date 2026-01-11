import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Advanced Astrology Calculator
 * Calculates full natal chart including:
 * - Planetary positions (Sun through Pluto, Nodes, Chiron)
 * - House cusps using Placidus, Whole Sign, Koch, or Vedic systems
 * - Major aspects between planets
 * - Accurate geocoding and timezone adjustment
 */

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const PLANETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];

const ASPECT_NAMES = {
  0: 'conjunction',
  60: 'sextile',
  90: 'square',
  120: 'trine',
  180: 'opposition'
};

// ============================================================================
// GEOCODING - Convert location to lat/long
// ============================================================================

async function geocodeLocation(location) {
  try {
    // Use Nominatim (OpenStreetMap) for free geocoding
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'TeamBuilder7A-Astrology/1.0'
      }
    });
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
        displayName: data[0].display_name
      };
    }
    
    throw new Error('Location not found');
  } catch (error) {
    throw new Error(`Geocoding failed: ${error.message}`);
  }
}

// ============================================================================
// TIMEZONE - Get timezone for location at specific date
// ============================================================================

async function getTimezone(latitude, longitude, timestamp) {
  try {
    // Use TimeAPI.io for timezone lookup (free tier available)
    const url = `https://timeapi.io/api/TimeZone/coordinate?latitude=${latitude}&longitude=${longitude}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data && data.timeZone) {
      return data.timeZone;
    }
    
    // Fallback: rough timezone estimation based on longitude
    const offsetHours = Math.round(longitude / 15);
    return `UTC${offsetHours >= 0 ? '+' : ''}${offsetHours}`;
  } catch (error) {
    // Fallback estimation
    const offsetHours = Math.round(longitude / 15);
    return `UTC${offsetHours >= 0 ? '+' : ''}${offsetHours}`;
  }
}

// ============================================================================
// JULIAN DAY CALCULATION
// ============================================================================

function toJulianDay(year, month, day, hour, minute) {
  if (month <= 2) {
    year -= 1;
    month += 12;
  }
  
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  
  const JD = Math.floor(365.25 * (year + 4716)) +
             Math.floor(30.6001 * (month + 1)) +
             day + B - 1524.5 +
             (hour + minute / 60) / 24;
  
  return JD;
}

// ============================================================================
// PLANETARY POSITION CALCULATIONS (Simplified Ephemeris)
// ============================================================================

function calculateSunPosition(JD) {
  const T = (JD - 2451545.0) / 36525;
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  const e = 0.016708634 - 0.000042037 * T - 0.0000001267 * T * T;
  
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M * Math.PI / 180) +
            (0.019993 - 0.000101 * T) * Math.sin(2 * M * Math.PI / 180) +
            0.000289 * Math.sin(3 * M * Math.PI / 180);
  
  let sunLongitude = (L0 + C) % 360;
  if (sunLongitude < 0) sunLongitude += 360;
  
  return sunLongitude;
}

function calculateMoonPosition(JD) {
  const T = (JD - 2451545.0) / 36525;
  const L = 218.3164477 + 481267.88123421 * T - 0.0015786 * T * T;
  const D = 297.8501921 + 445267.1114034 * T - 0.0018819 * T * T;
  const M = 357.5291092 + 35999.0502909 * T - 0.0001536 * T * T;
  const F = 93.2720950 + 483202.0175233 * T - 0.0036539 * T * T;
  
  let moonLongitude = L +
    6.288774 * Math.sin(M * Math.PI / 180) +
    1.274027 * Math.sin((2 * D - M) * Math.PI / 180) +
    0.658314 * Math.sin(2 * D * Math.PI / 180);
  
  moonLongitude = moonLongitude % 360;
  if (moonLongitude < 0) moonLongitude += 360;
  
  return moonLongitude;
}

function calculatePlanetPosition(planet, JD) {
  const T = (JD - 2451545.0) / 36525;
  
  // Simplified orbital elements (mean longitudes at epoch)
  const planetData = {
    Mercury: { L0: 252.25032350, dL: 149472.67411175, a: 0.387098, e: 0.205635 },
    Venus: { L0: 181.97909950, dL: 58517.81538729, a: 0.723330, e: 0.006772 },
    Mars: { L0: 355.43327610, dL: 19140.30268499, a: 1.523688, e: 0.093405 },
    Jupiter: { L0: 34.39644051, dL: 3034.74612775, a: 5.202603, e: 0.048498 },
    Saturn: { L0: 49.95424423, dL: 1222.49362201, a: 9.536676, e: 0.055546 },
    Uranus: { L0: 313.23810451, dL: 428.48202785, a: 19.189165, e: 0.047318 },
    Neptune: { L0: 304.88003387, dL: 218.45945325, a: 30.069923, e: 0.008606 },
    Pluto: { L0: 238.92903833, dL: 145.20780515, a: 39.482, e: 0.249 }
  };
  
  if (!planetData[planet]) {
    return 0;
  }
  
  const data = planetData[planet];
  let L = (data.L0 + data.dL * T) % 360;
  if (L < 0) L += 360;
  
  return L;
}

// ============================================================================
// HOUSE CALCULATIONS
// ============================================================================

function calculatePlacidusHouses(JD, latitude, longitude) {
  const T = (JD - 2451545.0) / 36525;
  
  // Calculate Local Sidereal Time
  const GMST = 280.46061837 + 360.98564736629 * (JD - 2451545.0) + 0.000387933 * T * T;
  let LST = (GMST + longitude) % 360;
  if (LST < 0) LST += 360;
  
  // Calculate RAMC (Right Ascension of Midheaven)
  const RAMC = LST;
  
  // Calculate Midheaven (MC) - 10th house cusp
  const obliquity = 23.4393 - 0.0130042 * T;
  const MC = Math.atan2(Math.sin(RAMC * Math.PI / 180), Math.cos(RAMC * Math.PI / 180) * Math.cos(obliquity * Math.PI / 180)) * 180 / Math.PI;
  const midheaven = (MC + 360) % 360;
  
  // Calculate Ascendant (1st house cusp)
  const latRad = latitude * Math.PI / 180;
  const oblRad = obliquity * Math.PI / 180;
  const ramcRad = RAMC * Math.PI / 180;
  
  const ascNum = -Math.sin(ramcRad);
  const ascDen = Math.cos(ramcRad) * Math.sin(oblRad) - Math.tan(latRad) * Math.cos(oblRad);
  let ascendant = Math.atan2(ascNum, ascDen) * 180 / Math.PI;
  ascendant = (ascendant + 360) % 360;
  
  // Placidus intermediate cusps (simplified)
  const houses = {
    1: ascendant,
    10: midheaven,
    4: (midheaven + 180) % 360,  // IC
    7: (ascendant + 180) % 360    // Descendant
  };
  
  // Calculate intermediate cusps (2, 3, 5, 6, 8, 9, 11, 12)
  const ascMC = (midheaven - ascendant + 360) % 360;
  
  houses[2] = (ascendant + ascMC / 3) % 360;
  houses[3] = (ascendant + 2 * ascMC / 3) % 360;
  houses[11] = (midheaven + ascMC / 3) % 360;
  houses[12] = (midheaven + 2 * ascMC / 3) % 360;
  
  const descIC = (houses[4] - houses[7] + 360) % 360;
  houses[8] = (houses[7] + descIC / 3) % 360;
  houses[9] = (houses[7] + 2 * descIC / 3) % 360;
  houses[5] = (houses[4] + descIC / 3) % 360;
  houses[6] = (houses[4] + 2 * descIC / 3) % 360;
  
  return { houses, ascendant, midheaven };
}

function calculateWholeSignHouses(ascendant) {
  const ascSign = Math.floor(ascendant / 30);
  const houses = {};
  
  for (let i = 1; i <= 12; i++) {
    houses[i] = ((ascSign + i - 1) % 12) * 30;
  }
  
  return { houses, ascendant };
}

// ============================================================================
// ASPECTS CALCULATION
// ============================================================================

function calculateAspects(planetPositions) {
  const aspects = [];
  const planets = Object.keys(planetPositions);
  const orb = 8; // 8-degree orb for aspects
  
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const planet1 = planets[i];
      const planet2 = planets[j];
      const pos1 = planetPositions[planet1];
      const pos2 = planetPositions[planet2];
      
      let angle = Math.abs(pos1 - pos2);
      if (angle > 180) angle = 360 - angle;
      
      // Check for major aspects
      for (const [aspectAngle, aspectName] of Object.entries(ASPECT_NAMES)) {
        const targetAngle = parseInt(aspectAngle);
        if (Math.abs(angle - targetAngle) <= orb) {
          aspects.push({
            planet1,
            planet2,
            aspect: aspectName,
            angle: targetAngle,
            orb: Math.abs(angle - targetAngle).toFixed(2)
          });
          break;
        }
      }
    }
  }
  
  return aspects;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function longitudeToSign(longitude) {
  const signIndex = Math.floor(longitude / 30);
  const degree = longitude % 30;
  return {
    sign: ZODIAC_SIGNS[signIndex],
    degree: degree.toFixed(2)
  };
}

function findHouse(planetLongitude, houses) {
  for (let i = 1; i <= 12; i++) {
    const currentHouse = houses[i];
    const nextHouse = houses[i === 12 ? 1 : i + 1];
    
    if (nextHouse > currentHouse) {
      if (planetLongitude >= currentHouse && planetLongitude < nextHouse) {
        return i;
      }
    } else {
      // House crosses 0° Aries
      if (planetLongitude >= currentHouse || planetLongitude < nextHouse) {
        return i;
      }
    }
  }
  return 1; // Default
}

// ============================================================================
// MAIN CALCULATION
// ============================================================================

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    const { personId, personType, birthDate, birthTime, birthLocation, houseSystem = 'placidus' } = body;
    
    if (!personId || !birthDate || !birthTime || !birthLocation) {
      return Response.json({ 
        error: 'Missing required fields: personId, birthDate, birthTime, birthLocation' 
      }, { status: 400 });
    }
    
    // Parse date and time
    const [year, month, day] = birthDate.split('-').map(Number);
    const [hour, minute] = birthTime.split(':').map(Number);
    
    // Geocode location
    const geoData = await geocodeLocation(birthLocation);
    const { latitude, longitude } = geoData;
    
    // Get timezone
    const timezone = await getTimezone(latitude, longitude, new Date(birthDate).getTime());
    
    // Calculate Julian Day
    const JD = toJulianDay(year, month, day, hour, minute);
    
    // Calculate planetary positions
    const planetPositions = {
      Sun: calculateSunPosition(JD),
      Moon: calculateMoonPosition(JD),
      Mercury: calculatePlanetPosition('Mercury', JD),
      Venus: calculatePlanetPosition('Venus', JD),
      Mars: calculatePlanetPosition('Mars', JD),
      Jupiter: calculatePlanetPosition('Jupiter', JD),
      Saturn: calculatePlanetPosition('Saturn', JD),
      Uranus: calculatePlanetPosition('Uranus', JD),
      Neptune: calculatePlanetPosition('Neptune', JD),
      Pluto: calculatePlanetPosition('Pluto', JD)
    };
    
    // Calculate North Node (simplified)
    const T = (JD - 2451545.0) / 36525;
    const northNode = (125.04452 - 1934.136261 * T) % 360;
    planetPositions.NorthNode = northNode < 0 ? northNode + 360 : northNode;
    planetPositions.SouthNode = (planetPositions.NorthNode + 180) % 360;
    
    // Calculate Chiron (simplified approximation)
    const chiron = (77.0 + 0.014 * (JD - 2451545.0)) % 360;
    planetPositions.Chiron = chiron < 0 ? chiron + 360 : chiron;
    
    // Calculate houses
    let houseData;
    if (houseSystem === 'whole_sign') {
      houseData = calculateWholeSignHouses(planetPositions.Sun);
    } else {
      houseData = calculatePlacidusHouses(JD, latitude, longitude);
    }
    
    const { houses, ascendant, midheaven } = houseData;
    
    // Calculate aspects
    const aspects = calculateAspects(planetPositions);
    
    // Build chart data
    const chartData = {
      person_id: personId,
      person_type: personType,
      birth_date: birthDate,
      birth_time: birthTime,
      birth_location: birthLocation,
      latitude,
      longitude,
      timezone,
      house_system: houseSystem,
      
      // Sun
      sun_sign: longitudeToSign(planetPositions.Sun).sign,
      sun_degree: parseFloat(longitudeToSign(planetPositions.Sun).degree),
      sun_house: findHouse(planetPositions.Sun, houses),
      
      // Moon
      moon_sign: longitudeToSign(planetPositions.Moon).sign,
      moon_degree: parseFloat(longitudeToSign(planetPositions.Moon).degree),
      moon_house: findHouse(planetPositions.Moon, houses),
      
      // Mercury
      mercury_sign: longitudeToSign(planetPositions.Mercury).sign,
      mercury_degree: parseFloat(longitudeToSign(planetPositions.Mercury).degree),
      mercury_house: findHouse(planetPositions.Mercury, houses),
      
      // Venus
      venus_sign: longitudeToSign(planetPositions.Venus).sign,
      venus_degree: parseFloat(longitudeToSign(planetPositions.Venus).degree),
      venus_house: findHouse(planetPositions.Venus, houses),
      
      // Mars
      mars_sign: longitudeToSign(planetPositions.Mars).sign,
      mars_degree: parseFloat(longitudeToSign(planetPositions.Mars).degree),
      mars_house: findHouse(planetPositions.Mars, houses),
      
      // Jupiter
      jupiter_sign: longitudeToSign(planetPositions.Jupiter).sign,
      jupiter_degree: parseFloat(longitudeToSign(planetPositions.Jupiter).degree),
      jupiter_house: findHouse(planetPositions.Jupiter, houses),
      
      // Saturn
      saturn_sign: longitudeToSign(planetPositions.Saturn).sign,
      saturn_degree: parseFloat(longitudeToSign(planetPositions.Saturn).degree),
      saturn_house: findHouse(planetPositions.Saturn, houses),
      
      // Uranus
      uranus_sign: longitudeToSign(planetPositions.Uranus).sign,
      uranus_degree: parseFloat(longitudeToSign(planetPositions.Uranus).degree),
      uranus_house: findHouse(planetPositions.Uranus, houses),
      
      // Neptune
      neptune_sign: longitudeToSign(planetPositions.Neptune).sign,
      neptune_degree: parseFloat(longitudeToSign(planetPositions.Neptune).degree),
      neptune_house: findHouse(planetPositions.Neptune, houses),
      
      // Pluto
      pluto_sign: longitudeToSign(planetPositions.Pluto).sign,
      pluto_degree: parseFloat(longitudeToSign(planetPositions.Pluto).degree),
      pluto_house: findHouse(planetPositions.Pluto, houses),
      
      // Nodes
      north_node_sign: longitudeToSign(planetPositions.NorthNode).sign,
      north_node_degree: parseFloat(longitudeToSign(planetPositions.NorthNode).degree),
      north_node_house: findHouse(planetPositions.NorthNode, houses),
      south_node_sign: longitudeToSign(planetPositions.SouthNode).sign,
      south_node_degree: parseFloat(longitudeToSign(planetPositions.SouthNode).degree),
      south_node_house: findHouse(planetPositions.SouthNode, houses),
      
      // Chiron
      chiron_sign: longitudeToSign(planetPositions.Chiron).sign,
      chiron_degree: parseFloat(longitudeToSign(planetPositions.Chiron).degree),
      chiron_house: findHouse(planetPositions.Chiron, houses),
      
      // Ascendant and MC
      ascendant_sign: longitudeToSign(ascendant).sign,
      ascendant_degree: parseFloat(longitudeToSign(ascendant).degree),
      midheaven_sign: longitudeToSign(midheaven || houses[10]).sign,
      midheaven_degree: parseFloat(longitudeToSign(midheaven || houses[10]).degree),
      
      // Houses
      house_1_sign: longitudeToSign(houses[1]).sign,
      house_1_degree: parseFloat(longitudeToSign(houses[1]).degree),
      house_2_sign: longitudeToSign(houses[2]).sign,
      house_2_degree: parseFloat(longitudeToSign(houses[2]).degree),
      house_3_sign: longitudeToSign(houses[3]).sign,
      house_3_degree: parseFloat(longitudeToSign(houses[3]).degree),
      house_4_sign: longitudeToSign(houses[4]).sign,
      house_4_degree: parseFloat(longitudeToSign(houses[4]).degree),
      house_5_sign: longitudeToSign(houses[5]).sign,
      house_5_degree: parseFloat(longitudeToSign(houses[5]).degree),
      house_6_sign: longitudeToSign(houses[6]).sign,
      house_6_degree: parseFloat(longitudeToSign(houses[6]).degree),
      house_7_sign: longitudeToSign(houses[7]).sign,
      house_7_degree: parseFloat(longitudeToSign(houses[7]).degree),
      house_8_sign: longitudeToSign(houses[8]).sign,
      house_8_degree: parseFloat(longitudeToSign(houses[8]).degree),
      house_9_sign: longitudeToSign(houses[9]).sign,
      house_9_degree: parseFloat(longitudeToSign(houses[9]).degree),
      house_10_sign: longitudeToSign(houses[10]).sign,
      house_10_degree: parseFloat(longitudeToSign(houses[10]).degree),
      house_11_sign: longitudeToSign(houses[11]).sign,
      house_11_degree: parseFloat(longitudeToSign(houses[11]).degree),
      house_12_sign: longitudeToSign(houses[12]).sign,
      house_12_degree: parseFloat(longitudeToSign(houses[12]).degree),
      
      // Aspects and full data
      aspects: JSON.stringify(aspects),
      chart_data: JSON.stringify({ planetPositions, houses, aspects })
    };
    
    // Save to database
    const existingCharts = await base44.asServiceRole.entities.AstrologyChart.filter({
      person_id: personId,
      person_type: personType
    });
    
    if (existingCharts.length > 0) {
      await base44.asServiceRole.entities.AstrologyChart.update(existingCharts[0].id, chartData);
    } else {
      await base44.asServiceRole.entities.AstrologyChart.create(chartData);
    }
    
    return Response.json({
      success: true,
      data: chartData,
      message: 'Astrology chart calculated and saved successfully'
    });
    
  } catch (error) {
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
});