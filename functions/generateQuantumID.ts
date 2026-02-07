import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Planet abbreviations mapping
const PLANET_CODES = {
  'Sun': 'Su', 'Moon': 'Mo', 'Mercury': 'Me', 'Venus': 'Ve',
  'Mars': 'Ma', 'Jupiter': 'Ju', 'Saturn': 'Sa', 'Uranus': 'Ur',
  'Neptune': 'Ne', 'Pluto': 'Pl'
};

const SIGN_CODES = {
  'Aries': 'Ar', 'Taurus': 'Ta', 'Gemini': 'Ge', 'Cancer': 'Cn',
  'Leo': 'Le', 'Virgo': 'Vi', 'Libra': 'Li', 'Scorpio': 'Sc',
  'Sagittarius': 'Sg', 'Capricorn': 'Cp', 'Aquarius': 'Aq', 'Pisces': 'Pi'
};

function generatePlanetaryCodes(planets) {
  const codes = {};
  for (const [planet, data] of Object.entries(planets)) {
    const planetCode = PLANET_CODES[planet] || planet.substring(0, 2).toUpperCase();
    const signCode = SIGN_CODES[data.sign] || data.sign.substring(0, 2).toUpperCase();
    const degree = Math.floor(data.degree || 0);
    const house = data.house || 0;
    
    codes[planet] = `${planetCode}-${signCode}${degree}-H${house}`;
  }
  return codes;
}

function generateProtectionHash() {
  const randomBytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

async function generateSHA256(data) {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { 
      userProfileId, 
      planets, 
      lifePathNumber,
      birthDate,
      fullName,
      ssn,
      country,
      is_foreign_national
    } = await req.json();
    
    if (!planets || !lifePathNumber) {
      return Response.json({ 
        error: 'Missing required data: planets and lifePathNumber' 
      }, { status: 400 });
    }
    
    // Generate planetary short codes
    const planetaryCodes = generatePlanetaryCodes(planets);
    
    // Generate auto-protection hash
    const protectionHash = generateProtectionHash();
    
    // Hash SSN for secure storage
    let hashedSsn = null;
    if (ssn) {
      hashedSsn = await generateSHA256(ssn.replace(/[^0-9]/g, ''));
    }
    
    // Build seed components
    const seedComponents = [
      `LP${lifePathNumber}`,
      ...Object.values(planetaryCodes),
      protectionHash.substring(0, 16) // Use first 16 chars of protection hash
    ];
    
    // Generate short code report for offline backup
    const shortCodeReport = seedComponents.join('|');
    
    // Add protected identity data to seed (hashed SSN, country, foreign national flag)
    if (hashedSsn) {
      seedComponents.push(`SSNH${hashedSsn.substring(0, 16)}`);
    }
    if (country) {
      seedComponents.push(`C${country.toUpperCase()}`);
    }
    if (is_foreign_national) {
      seedComponents.push('FN');
    }
    
    // Concatenate all components for final hash
    const seedString = seedComponents.join('') + fullName + birthDate;
    
    // Generate QuantumID using SHA-256
    const quantumID = await generateSHA256(seedString);
    
    // Prepare blockchain export structure (for future use)
    const exportData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      quantumID: quantumID.substring(0, 32), // Shortened for display
      publicMarkers: {
        lifePathNumber,
        planetarySignature: Object.keys(planetaryCodes).length
      },
      // Private data stays off-chain
      privateHash: await generateSHA256(protectionHash)
    };
    
    return Response.json({
      success: true,
      quantumID,
      planetaryCodes,
      protectionHash,
      shortCodeReport,
      exportData,
      hashedSsn,
      country,
      isForeignNational: is_foreign_national
    });
    
  } catch (error) {
    console.error('Error generating QuantumID:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});