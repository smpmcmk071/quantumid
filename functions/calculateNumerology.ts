/**
 * Universal Numerology Calculator
 * Handles both DATE and NAME numerology calculations
 * 
 * Supports:
 * - Date: Eastern (1+5+11+2+0+2+5), Western (sum all), Reverse methods
 * - Date: Hebrew calendar conversion and calculations
 * - Name: Pythagorean, Chaldean, Gematria (Simple & Reverse)
 * - Name: Vowel/Consonant analysis, Expression, Soul Urge, Personality
 * - Master number preservation (11, 22, 33, 44, 55, 66, 77, 88, 99)
 * 
 * Author: Maher Family Legacy
 * Version: 2.0
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

// ============================================================================
// PYTHAGOREAN MAPPING (A=1, B=2, ... cycles 1-9)
// ============================================================================
const PYTHAGOREAN = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
  J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9,
  S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8
};

// ============================================================================
// CHALDEAN MAPPING (No 9 - considered sacred)
// ============================================================================
const CHALDEAN = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 8, G: 3, H: 5, I: 1,
  J: 1, K: 2, L: 3, M: 4, N: 5, O: 7, P: 8, Q: 1, R: 2,
  S: 3, T: 4, U: 6, V: 6, W: 6, X: 5, Y: 1, Z: 7
};

const VOWELS = ['A', 'E', 'I', 'O', 'U'];
const MASTER_NUMBERS = [11, 22, 33, 44, 55, 66, 77, 88, 99];

// ============================================================================
// CORE REDUCTION FUNCTIONS
// ============================================================================

function reduceToDigit(n, keepMaster = true) {
  if (n < 0) n = Math.abs(n);
  
  // Check if already a master number
  if (keepMaster && MASTER_NUMBERS.includes(n)) {
    return n;
  }
  
  // Reduce by summing digits
  while (n > 9) {
    n = String(n).split('').reduce((sum, d) => sum + parseInt(d), 0);
    // Check if reduction creates a master number
    if (keepMaster && [11, 22, 33].includes(n)) {
      return n;
    }
  }
  
  return n;
}

// New function that returns both the final reduced value AND any master numbers found during reduction
function reduceWithMasters(n, keepMaster = true) {
  if (n < 0) n = Math.abs(n);
  const mastersFound = [];
  
  // Check if already a master number
  if (MASTER_NUMBERS.includes(n)) {
    mastersFound.push(n);
    if (keepMaster) {
      return { reduced: n, masters: mastersFound };
    }
  }
  
  // Reduce by summing digits, tracking any master numbers encountered
  while (n > 9) {
    n = String(n).split('').reduce((sum, d) => sum + parseInt(d), 0);
    // Check if reduction creates a master number
    if ([11, 22, 33].includes(n)) {
      mastersFound.push(n);
      if (keepMaster) {
        return { reduced: n, masters: mastersFound };
      }
    }
  }
  
  return { reduced: n, masters: mastersFound };
}

function formatWithReduction(total, keepMaster = true) {
  const reduced = reduceToDigit(total, keepMaster);
  if (total === reduced || total < 10) {
    return String(reduced);
  }
  
  // Calculate the first reduction (sum of digits)
  const firstReduction = String(total).split('').reduce((sum, d) => sum + parseInt(d), 0);
  
  // If first reduction is a master number, show total/master
  if (keepMaster && MASTER_NUMBERS.includes(firstReduction)) {
    return `${total}/${firstReduction}`;
  }
  
  // If first reduction equals reduced (single digit), show total/reduced
  if (firstReduction === reduced) {
    return `${total}/${reduced}`;
  }
  
  // Otherwise show total/firstReduction/reduced (e.g., 102/12/3, 76/13/4)
  if (firstReduction > 9) {
    return `${total}/${firstReduction}/${reduced}`;
  }
  
  return `${total}/${reduced}`;
}

// ============================================================================
// DATE NUMEROLOGY FUNCTIONS
// ============================================================================

function getDateVibes(day, month, year) {
  return {
    dayVibe: reduceToDigit(day),
    monthVibe: reduceToDigit(month),
    yearVibe: reduceToDigit(year)
  };
}

function calculateDateEastern(day, month, year) {
  // Eastern method: Add each component separately, then combine
  // Example: 1/5/2025 = 1 + 5 + (2+0+2+5=9) = 1+5+9 = 15/6
  const dayReduced = reduceToDigit(day);
  const monthReduced = reduceToDigit(month);
  const yearReduced = reduceToDigit(year);
  
  const total = dayReduced + monthReduced + yearReduced;
  return {
    calculation: `${dayReduced}+${monthReduced}+${yearReduced}`,
    total,
    reduced: reduceToDigit(total),
    formatted: formatWithReduction(total)
  };
}

function calculateDateWestern(day, month, year) {
  // Western method: Sum all digits together at once
  // Example: 1/5/2025 = 1+5+2+0+2+5 = 15/6
  const allDigits = `${day}${month}${year}`;
  const total = allDigits.split('').reduce((sum, d) => sum + parseInt(d), 0);
  return {
    calculation: allDigits.split('').join('+'),
    total,
    reduced: reduceToDigit(total),
    formatted: formatWithReduction(total)
  };
}

function calculateDateReverse(day, month, year) {
  // Reverse method: Year/Month/Day order (like ISO date)
  const allDigits = `${year}${month}${day}`;
  const total = allDigits.split('').reduce((sum, d) => sum + parseInt(d), 0);
  return {
    calculation: allDigits.split('').join('+'),
    total,
    reduced: reduceToDigit(total),
    formatted: formatWithReduction(total)
  };
}

function detectMasterNumbers(day, month, year) {
  const locations = [];
  const masters = new Set();
  
  // Check day
  if (MASTER_NUMBERS.includes(day)) {
    locations.push(`day:${day}`);
    masters.add(day);
  }
  
  // Check month (only 11 possible)
  if (month === 11) {
    locations.push('month:11');
    masters.add(11);
  }
  
  // Check year reduction
  const yearReduced = reduceToDigit(year);
  if ([11, 22, 33].includes(yearReduced)) {
    locations.push(`year:${yearReduced}`);
    masters.add(yearReduced);
  }
  
  // Check various calculation methods
  const eastern = calculateDateEastern(day, month, year);
  const western = calculateDateWestern(day, month, year);
  const reverse = calculateDateReverse(day, month, year);
  
  if ([11, 22, 33].includes(eastern.total) || [11, 22, 33].includes(eastern.reduced)) {
    const val = [11, 22, 33].includes(eastern.total) ? eastern.total : eastern.reduced;
    locations.push(`eastern:${val}`);
    masters.add(val);
  }
  
  if ([11, 22, 33].includes(western.total) || [11, 22, 33].includes(western.reduced)) {
    const val = [11, 22, 33].includes(western.total) ? western.total : western.reduced;
    locations.push(`western:${val}`);
    masters.add(val);
  }
  
  if ([11, 22, 33].includes(reverse.total) || [11, 22, 33].includes(reverse.reduced)) {
    const val = [11, 22, 33].includes(reverse.total) ? reverse.total : reverse.reduced;
    locations.push(`reverse:${val}`);
    masters.add(val);
  }
  
  return {
    hasMaster: masters.size > 0,
    masterNumbers: Array.from(masters).sort((a, b) => a - b).join(','),
    masterLocations: locations.join('; ')
  };
}

// ============================================================================
// HEBREW CALENDAR CONVERSION (Approximation)
// ============================================================================

function gregorianToHebrew(year, month, day) {
  // Simplified Hebrew calendar conversion
  // For accurate conversion, use a proper library in production
  
  const hebrewYear = year + 3760;
  
  // Hebrew months (simplified mapping based on Gregorian month)
  const hebrewMonths = [
    'Tevet', 'Shevat', 'Adar', 'Nisan', 'Iyar', 'Sivan',
    'Tammuz', 'Av', 'Elul', 'Tishrei', 'Cheshvan', 'Kislev'
  ];
  
  // Approximate Hebrew month (this is a simplification)
  const hebrewMonthIndex = (month + 9) % 12;
  const hebrewMonth = hebrewMonthIndex + 1;
  const hebrewMonthName = hebrewMonths[hebrewMonthIndex];
  
  // Hebrew day (approximate - actual depends on molad)
  const hebrewDay = ((day + 10) % 30) + 1;
  
  return {
    hebrewYear,
    hebrewMonth,
    hebrewDay,
    hebrewDate: `${hebrewDay} ${hebrewMonthName} ${hebrewYear}`,
    hebrewDayVibe: reduceToDigit(hebrewDay),
    hebrewMonthVibe: reduceToDigit(hebrewMonth),
    hebrewYearVibe: reduceToDigit(hebrewYear)
  };
}

function calculateShemitahPosition(hebrewYear) {
  // Shemitah cycle is every 7 years
  const position = ((hebrewYear - 1) % 7) + 1;
  const isShemitah = position === 7;
  
  return {
    position,
    isShemitah,
    alert: isShemitah ? 'SHEMITAH YEAR' : (position === 6 ? 'Pre-Shemitah' : null)
  };
}

// ============================================================================
// NAME NUMEROLOGY FUNCTIONS
// ============================================================================

function cleanName(name) {
  if (!name) return '';
  
  let cleaned = String(name).trim();
  
  // Remove common suffixes (for company names)
  const suffixPatterns = [
    /\s+(Inc|Corp|LLC|Ltd|Company|Co|Corporation|Incorporated)\.?\s*$/i,
    /\s+(Technologies|Technology|Systems|Solutions|Services|Group|Holdings?)\.?\s*$/i,
    /\s+(International|Global|Worldwide|Industries|Partners|Financial)\.?\s*$/i,
    /\s+(Common\s+Stock|Preferred\s+Stock|Class\s+[A-Z])\.?\s*$/i,
    /^The\s+/i
  ];
  
  for (const pattern of suffixPatterns) {
    cleaned = cleaned.replace(pattern, '');
  }
  
  return cleaned.trim();
}

function pythagoreanSum(text) {
  if (!text) return 0;
  let total = 0;
  for (const ch of text.toUpperCase()) {
    if (PYTHAGOREAN[ch]) {
      total += PYTHAGOREAN[ch];
    }
  }
  return total;
}

function chaldeanSum(text) {
  if (!text) return 0;
  let total = 0;
  for (const ch of text.toUpperCase()) {
    if (CHALDEAN[ch]) {
      total += CHALDEAN[ch];
    }
  }
  return total;
}

function gematriaSimple(text) {
  // A=1, B=2, ... Z=26
  if (!text) return 0;
  let total = 0;
  for (const ch of text.toUpperCase()) {
    if (ch >= 'A' && ch <= 'Z') {
      total += ch.charCodeAt(0) - 64;
    }
  }
  return total;
}

function gematriaReverse(text) {
  // Z=1, Y=2, ... A=26
  if (!text) return 0;
  let total = 0;
  for (const ch of text.toUpperCase()) {
    if (ch >= 'A' && ch <= 'Z') {
      total += 27 - (ch.charCodeAt(0) - 64);
    }
  }
  return total;
}

function vowelConsonantAnalysis(text) {
  if (!text) return { vowelSum: 0, consonantSum: 0, ratio: 0 };
  
  let vowelSum = 0;
  let consonantSum = 0;
  
  for (const ch of text.toUpperCase()) {
    if (PYTHAGOREAN[ch]) {
      if (VOWELS.includes(ch)) {
        vowelSum += PYTHAGOREAN[ch];
      } else {
        consonantSum += PYTHAGOREAN[ch];
      }
    }
  }
  
  const ratio = consonantSum > 0 ? Math.round((vowelSum / consonantSum) * 100) / 100 : 0;
  
  return { vowelSum, consonantSum, ratio };
}

function calculateLifePathWestern(birthDate) {
  // Western/Pythagorean method: Add full numbers together, then reduce
  // Example: 11/07/1969 = 11 + 7 + 1969 = 1987 → 25 → 7
  // Preserves master numbers (11, 22, 33)
  const date = new Date(birthDate);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  
  const sumTotal = month + day + year;
  // Reduce the sum (e.g., 1987 → 1+9+8+7 = 25)
  const firstReduction = String(sumTotal).split('').reduce((sum, d) => sum + parseInt(d), 0);
  const finalReduced = reduceToDigit(firstReduction);
  
  return {
    calculation: `${month}+${day}+${year}=${sumTotal}→${firstReduction}`,
    total: firstReduction, // Use the first reduction (25) not the raw sum (1987)
    reduced: finalReduced,
    formatted: formatWithReduction(firstReduction)
  };
}

function calculateLifePathChaldean(birthDate) {
  // Chaldean/Eastern method: Sum ALL individual digits
  // Example: 11/07/1969 = 1+1+0+7+1+9+6+9 = 34 → 3+4 = 7
  // Also preserves master numbers (11, 22, 33)
  const date = new Date(birthDate);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  
  const allDigits = `${month}${day}${year}`;
  const total = allDigits.split('').reduce((sum, d) => sum + parseInt(d), 0);
  
  return {
    calculation: allDigits.split('').join('+') + '=' + total,
    total,
    reduced: reduceToDigit(total),
    reducedSingleDigit: reduceToDigit(total, false), // Always single digit
    formatted: formatWithReduction(total)
  };
}

function calculateLifePathChaldean2(birthDate) {
  // Chaldean2: Same as Chaldean but ALWAYS reduces to single digit (no master numbers)
  const date = new Date(birthDate);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  
  const allDigits = `${month}${day}${year}`;
  const total = allDigits.split('').reduce((sum, d) => sum + parseInt(d), 0);
  
  return {
    calculation: allDigits.split('').join('+') + '=' + total,
    total,
    reduced: reduceToDigit(total, false), // ALWAYS single digit
    formatted: formatWithReduction(total)
  };
}

function calculateExpressionWestern(fullName) {
  // Western Expression = Full name Pythagorean sum, then reduce
  const sum = pythagoreanSum(fullName);
  return {
    sum,
    reduced: reduceToDigit(sum),
    formatted: formatWithReduction(sum)
  };
}

function calculateExpressionChaldean(fullName) {
  // Chaldean Expression = Full name Chaldean sum, then reduce
  const sum = chaldeanSum(fullName);
  return {
    sum,
    reduced: reduceToDigit(sum),
    reducedSingleDigit: reduceToDigit(sum, false), // Always single digit
    formatted: formatWithReduction(sum)
  };
}

function calculateExpressionChaldean2(fullName) {
  // Chaldean2 Expression = Full name Chaldean sum, ALWAYS reduced to single digit
  const sum = chaldeanSum(fullName);
  return {
    sum,
    reduced: reduceToDigit(sum, false), // ALWAYS single digit
    formatted: formatWithReduction(sum)
  };
}

function calculateSoulUrgeWestern(fullName) {
  // Soul Urge Western = Vowels only using Pythagorean
  if (!fullName) return { sum: 0, reduced: 0, formatted: '0' };
  
  let sum = 0;
  for (const ch of fullName.toUpperCase()) {
    if (VOWELS.includes(ch) && PYTHAGOREAN[ch]) {
      sum += PYTHAGOREAN[ch];
    }
  }
  
  return {
    sum,
    reduced: reduceToDigit(sum),
    formatted: formatWithReduction(sum)
  };
}

function calculateSoulUrgeChaldean(fullName) {
  // Soul Urge Chaldean = Vowels only using Chaldean
  if (!fullName) return { sum: 0, reduced: 0, reducedSingleDigit: 0, formatted: '0' };
  
  let sum = 0;
  for (const ch of fullName.toUpperCase()) {
    if (VOWELS.includes(ch) && CHALDEAN[ch]) {
      sum += CHALDEAN[ch];
    }
  }
  
  return {
    sum,
    reduced: reduceToDigit(sum),
    reducedSingleDigit: reduceToDigit(sum, false), // Always single digit
    formatted: formatWithReduction(sum)
  };
}

function calculateSoulUrgeChaldean2(fullName) {
  // Soul Urge Chaldean2 = Vowels only using Chaldean, ALWAYS single digit
  if (!fullName) return { sum: 0, reduced: 0, formatted: '0' };
  
  let sum = 0;
  for (const ch of fullName.toUpperCase()) {
    if (VOWELS.includes(ch) && CHALDEAN[ch]) {
      sum += CHALDEAN[ch];
    }
  }
  
  return {
    sum,
    reduced: reduceToDigit(sum, false), // ALWAYS single digit
    formatted: formatWithReduction(sum)
  };
}

function calculatePersonalityWestern(fullName) {
  // Personality Western = Consonants only using Pythagorean
  if (!fullName) return { sum: 0, reduced: 0, formatted: '0' };
  
  let sum = 0;
  for (const ch of fullName.toUpperCase()) {
    if (!VOWELS.includes(ch) && PYTHAGOREAN[ch]) {
      sum += PYTHAGOREAN[ch];
    }
  }
  
  return {
    sum,
    reduced: reduceToDigit(sum),
    formatted: formatWithReduction(sum)
  };
}

function calculatePersonalityChaldean(fullName) {
  // Personality Chaldean = Consonants only using Chaldean
  if (!fullName) return { sum: 0, reduced: 0, reducedSingleDigit: 0, formatted: '0' };
  
  let sum = 0;
  for (const ch of fullName.toUpperCase()) {
    if (!VOWELS.includes(ch) && CHALDEAN[ch]) {
      sum += CHALDEAN[ch];
    }
  }
  
  return {
    sum,
    reduced: reduceToDigit(sum),
    reducedSingleDigit: reduceToDigit(sum, false), // Always single digit
    formatted: formatWithReduction(sum)
  };
}

function calculatePersonalityChaldean2(fullName) {
  // Personality Chaldean2 = Consonants only using Chaldean, ALWAYS single digit
  if (!fullName) return { sum: 0, reduced: 0, formatted: '0' };
  
  let sum = 0;
  for (const ch of fullName.toUpperCase()) {
    if (!VOWELS.includes(ch) && CHALDEAN[ch]) {
      sum += CHALDEAN[ch];
    }
  }
  
  return {
    sum,
    reduced: reduceToDigit(sum, false), // ALWAYS single digit
    formatted: formatWithReduction(sum)
  };
}

function calculateBirthdayNumber(day) {
  return {
    day,
    reduced: reduceToDigit(day),
    formatted: formatWithReduction(day)
  };
}

// ============================================================================
// KARMIC LESSONS DETECTION (Missing numbers in name)
// ============================================================================

function detectKarmicLessons(fullName) {
  if (!fullName) return { lessons: [], presentNumbers: [] };
  
  const presentNumbers = new Set();
  
  // Check all letters in name using Pythagorean values
  for (const ch of fullName.toUpperCase()) {
    if (PYTHAGOREAN[ch]) {
      presentNumbers.add(PYTHAGOREAN[ch]);
    }
  }
  
  // Find missing numbers 1-9
  const allNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const lessons = allNumbers.filter(n => !presentNumbers.has(n));
  
  return {
    lessons,
    presentNumbers: Array.from(presentNumbers).sort((a, b) => a - b),
    lessonMeanings: lessons.map(n => ({
      number: n,
      meaning: getKarmicLessonMeaning(n)
    }))
  };
}

function getKarmicLessonMeaning(num) {
  const meanings = {
    1: 'Independence, self-confidence, leadership - learning to stand on your own',
    2: 'Cooperation, patience, diplomacy - learning to work with others',
    3: 'Self-expression, creativity, joy - learning to communicate freely',
    4: 'Discipline, hard work, stability - learning structure and persistence',
    5: 'Freedom, adaptability, change - learning to embrace life experiences',
    6: 'Responsibility, harmony, nurturing - learning family and domestic balance',
    7: 'Spirituality, introspection, wisdom - learning to trust inner knowing',
    8: 'Material mastery, power, abundance - learning to manage resources',
    9: 'Compassion, humanitarianism, completion - learning universal love'
  };
  return meanings[num] || '';
}

// ============================================================================
// KARMIC DEBT DETECTION (13, 14, 16, 19 in calculations)
// ============================================================================

const KARMIC_DEBT_NUMBERS = [10, 12, 13, 14, 15, 16, 19];

function detectKarmicDebt(birthDate, fullName) {
  const karmicNumbers = [];
  const locations = [];
  
  if (birthDate) {
    const date = new Date(birthDate);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    
    // Check birthday day
    if (KARMIC_DEBT_NUMBERS.includes(day)) {
      karmicNumbers.push(day);
      locations.push(`birthday:${day}`);
    }
    
    // Check life path calculation intermediates
    const sumTotal = month + day + year;
    const firstReduction = String(sumTotal).split('').reduce((sum, d) => sum + parseInt(d), 0);
    
    if (KARMIC_DEBT_NUMBERS.includes(firstReduction)) {
      karmicNumbers.push(firstReduction);
      locations.push(`lifePath:${firstReduction}`);
    }
  }
  
  if (fullName) {
    // Check expression number intermediate
    const expressionSum = pythagoreanSum(fullName);
    const expressionFirstReduction = String(expressionSum).split('').reduce((sum, d) => sum + parseInt(d), 0);
    
    if (KARMIC_DEBT_NUMBERS.includes(expressionFirstReduction)) {
      karmicNumbers.push(expressionFirstReduction);
      locations.push(`expression:${expressionFirstReduction}`);
    }
    
    // Check soul urge intermediate
    let soulSum = 0;
    for (const ch of fullName.toUpperCase()) {
      if (VOWELS.includes(ch) && PYTHAGOREAN[ch]) {
        soulSum += PYTHAGOREAN[ch];
      }
    }
    const soulFirstReduction = String(soulSum).split('').reduce((sum, d) => sum + parseInt(d), 0);
    
    if (KARMIC_DEBT_NUMBERS.includes(soulFirstReduction)) {
      karmicNumbers.push(soulFirstReduction);
      locations.push(`soulUrge:${soulFirstReduction}`);
    }
    
    // Check personality intermediate
    let personalitySum = 0;
    for (const ch of fullName.toUpperCase()) {
      if (!VOWELS.includes(ch) && PYTHAGOREAN[ch]) {
        personalitySum += PYTHAGOREAN[ch];
      }
    }
    const personalityFirstReduction = String(personalitySum).split('').reduce((sum, d) => sum + parseInt(d), 0);
    
    if (KARMIC_DEBT_NUMBERS.includes(personalityFirstReduction)) {
      karmicNumbers.push(personalityFirstReduction);
      locations.push(`personality:${personalityFirstReduction}`);
    }
  }
  
  return {
    hasKarmicDebt: karmicNumbers.length > 0,
    numbers: [...new Set(karmicNumbers)].sort((a, b) => a - b),
    locations: locations.join('; ')
  };
}

// ============================================================================
// BASIC ASTROLOGY CALCULATIONS
// ============================================================================

function calculateSunSign(birthDate) {
  const date = new Date(birthDate);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();
  
  // Chinese Zodiac
  const chineseAnimals = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'];
  const chineseElements = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'];
  const yearOffset = (year - 1924) % 12;
  const elementOffset = Math.floor((year - 1924) % 10 / 2);
  const chineseAnimal = chineseAnimals[yearOffset];
  const chineseElement = chineseElements[elementOffset];
  
  const signs = [
    { sign: 'Capricorn', element: 'Earth', modality: 'Cardinal', ruler: 'Saturn', start: [12, 22], end: [1, 19] },
    { sign: 'Aquarius', element: 'Air', modality: 'Fixed', ruler: 'Uranus', start: [1, 20], end: [2, 18] },
    { sign: 'Pisces', element: 'Water', modality: 'Mutable', ruler: 'Neptune', start: [2, 19], end: [3, 20] },
    { sign: 'Aries', element: 'Fire', modality: 'Cardinal', ruler: 'Mars', start: [3, 21], end: [4, 19] },
    { sign: 'Taurus', element: 'Earth', modality: 'Fixed', ruler: 'Venus', start: [4, 20], end: [5, 20] },
    { sign: 'Gemini', element: 'Air', modality: 'Mutable', ruler: 'Mercury', start: [5, 21], end: [6, 20] },
    { sign: 'Cancer', element: 'Water', modality: 'Cardinal', ruler: 'Moon', start: [6, 21], end: [7, 22] },
    { sign: 'Leo', element: 'Fire', modality: 'Fixed', ruler: 'Sun', start: [7, 23], end: [8, 22] },
    { sign: 'Virgo', element: 'Earth', modality: 'Mutable', ruler: 'Mercury', start: [8, 23], end: [9, 22] },
    { sign: 'Libra', element: 'Air', modality: 'Cardinal', ruler: 'Venus', start: [9, 23], end: [10, 22] },
    { sign: 'Scorpio', element: 'Water', modality: 'Fixed', ruler: 'Pluto', start: [10, 23], end: [11, 21] },
    { sign: 'Sagittarius', element: 'Fire', modality: 'Mutable', ruler: 'Jupiter', start: [11, 22], end: [12, 21] }
  ];
  
  for (const s of signs) {
    const [startMonth, startDay] = s.start;
    const [endMonth, endDay] = s.end;
    
    // Handle Capricorn which spans year boundary
    if (startMonth > endMonth) {
      if ((month === startMonth && day >= startDay) || (month === endMonth && day <= endDay)) {
        return {
          ...s,
          chineseAnimal,
          chineseElement
        };
      }
    } else {
      if ((month === startMonth && day >= startDay) || (month === endMonth && day <= endDay) ||
          (month > startMonth && month < endMonth)) {
        return {
          ...s,
          chineseAnimal,
          chineseElement
        };
      }
    }
  }
  
  const signData = signs[0]; // Default to Capricorn
  return {
    ...signData,
    chineseAnimal,
    chineseElement
  };
}

function estimateAscendant(birthTime) {
  // Rough estimation based on time of day (actual requires exact time + location)
  const timeToSign = {
    'late_night': 'Aries',      // 12am-6am
    'morning': 'Cancer',        // 6am-12pm
    'midday': 'Libra',          // 12pm-2pm
    'afternoon': 'Scorpio',     // 2pm-6pm
    'evening': 'Sagittarius',   // 6pm-9pm
    'night': 'Aquarius',        // 9pm-12am
    'unknown': null
  };
  
  return timeToSign[birthTime] || null;
}

function calculateBasicHouses(sunSign, ascendant) {
  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  
  if (!ascendant) return null;
  
  const ascIndex = signs.indexOf(ascendant);
  if (ascIndex === -1) return null;
  
  const houses = {};
  for (let i = 0; i < 12; i++) {
    const houseNum = i + 1;
    const signIndex = (ascIndex + i) % 12;
    houses[`house${houseNum}`] = {
      sign: signs[signIndex],
      meaning: getHouseMeaning(houseNum)
    };
  }
  
  return houses;
}

function getHouseMeaning(houseNum) {
  const meanings = {
    1: 'Self, appearance, first impressions',
    2: 'Money, possessions, values',
    3: 'Communication, siblings, short trips',
    4: 'Home, family, roots',
    5: 'Creativity, romance, children',
    6: 'Health, daily work, service',
    7: 'Partnerships, marriage, contracts',
    8: 'Transformation, shared resources, death/rebirth',
    9: 'Higher learning, travel, philosophy',
    10: 'Career, public image, authority',
    11: 'Friends, groups, hopes/wishes',
    12: 'Subconscious, hidden matters, spirituality'
  };
  return meanings[houseNum];
}

// Parse birth time string to decimal hours
function parseBirthTimeToHours(birthTime) {
  if (!birthTime) return 12; // Default to noon
  
  // Handle period-based times (morning, afternoon, etc.)
  const periodToHour = {
    'late_night': 3,
    'morning': 9,
    'midday': 13,
    'afternoon': 16,
    'evening': 19.5,
    'night': 22.5,
    'unknown': 12
  };
  
  if (periodToHour[birthTime] !== undefined) {
    return periodToHour[birthTime];
  }
  
  // Try to parse exact time formats like "11:06 PM", "23:06", "11:06 PM EST"
  const timeStr = birthTime.toUpperCase().trim();
  
  // Match patterns: "HH:MM AM/PM", "HH:MM", with optional timezone
  const match12 = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  const match24 = timeStr.match(/^(\d{1,2}):(\d{2})/);
  
  if (match12) {
    let hours = parseInt(match12[1]);
    const minutes = parseInt(match12[2]);
    const period = match12[3].toUpperCase();
    
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    
    return hours + (minutes / 60);
  }
  
  if (match24) {
    const hours = parseInt(match24[1]);
    const minutes = parseInt(match24[2]);
    return hours + (minutes / 60);
  }
  
  return 12; // Default to noon if can't parse
}

// Estimate moon sign based on birth date and time
function estimateMoonSign(birthDate, birthTime) {
  const date = new Date(birthDate);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();
  
  const hour = parseBirthTimeToHours(birthTime);
  
  // Moon cycle is ~29.5 days, moves through all 12 signs
  // Calculate days since a known new moon (Jan 6, 2000 was new moon in Capricorn)
  const knownNewMoon = new Date(2000, 0, 6, 18, 14);
  const birthDateTime = new Date(year, month - 1, day, Math.floor(hour), (hour % 1) * 60);
  
  const daysSinceNewMoon = (birthDateTime - knownNewMoon) / (1000 * 60 * 60 * 24);
  const lunarCycle = 29.530588853;
  
  const positionInCycle = ((daysSinceNewMoon % lunarCycle) + lunarCycle) % lunarCycle;
  const daysPerSign = lunarCycle / 12;
  const signIndex = Math.floor(positionInCycle / daysPerSign);
  
  const moonSigns = [
    'Capricorn', 'Aquarius', 'Pisces', 'Aries', 'Taurus', 'Gemini',
    'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius'
  ];
  
  return moonSigns[signIndex % 12];
}

// Calculate Ascendant (Rising Sign) based on birth time and approximate location
function calculateAscendant(birthDate, birthTime, birthPlace) {
  const date = new Date(birthDate);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();
  
  const hour = parseBirthTimeToHours(birthTime);
  
  // Get approximate latitude from birth place (simplified US-centric lookup)
  const latitudeLookup = {
    // Northeast US
    'pa': 40, 'ny': 41, 'nj': 40, 'ma': 42, 'ct': 41, 'ri': 41, 'nh': 43, 'vt': 44, 'me': 45,
    'philadelphia': 40, 'new york': 41, 'boston': 42, 'drexel hill': 40,
    // Southeast
    'fl': 28, 'ga': 33, 'nc': 35, 'sc': 34, 'va': 37, 'md': 39, 'dc': 39,
    'miami': 26, 'atlanta': 34,
    // Midwest
    'il': 40, 'oh': 40, 'mi': 43, 'in': 40, 'wi': 44, 'mn': 45,
    'chicago': 42, 'detroit': 42,
    // Southwest
    'tx': 31, 'az': 34, 'nm': 35, 'co': 39, 'nv': 39,
    'dallas': 33, 'phoenix': 33, 'denver': 40,
    // West
    'ca': 36, 'wa': 47, 'or': 44,
    'los angeles': 34, 'san francisco': 38, 'seattle': 47,
    // Default
    'default': 40
  };
  
  let latitude = 40; // Default to mid-US
  if (birthPlace) {
    const place = birthPlace.toLowerCase();
    for (const [key, lat] of Object.entries(latitudeLookup)) {
      if (place.includes(key)) {
        latitude = lat;
        break;
      }
    }
  }
  
  // Calculate Local Sidereal Time (simplified)
  // Julian Day calculation
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  const JD = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  
  // Days since J2000.0
  const D = JD - 2451545.0 + (hour / 24);
  
  // Greenwich Mean Sidereal Time (in hours)
  let GMST = 18.697374558 + 24.06570982441908 * D;
  GMST = ((GMST % 24) + 24) % 24;
  
  // Approximate longitude offset (rough US estimate based on latitude)
  const longitude = latitude > 42 ? -90 : latitude > 38 ? -80 : latitude > 34 ? -85 : -100;
  
  // Local Sidereal Time
  let LST = GMST + (longitude / 15);
  LST = ((LST % 24) + 24) % 24;
  
  // Convert LST to degrees (0-360)
  const lstDegrees = LST * 15;
  
  // Ascendant calculation (simplified - actual requires more complex math)
  // This uses the RAMC (Right Ascension of Midheaven) method
  const obliquity = 23.4397; // Earth's axial tilt
  const latRad = latitude * Math.PI / 180;
  const oblRad = obliquity * Math.PI / 180;
  
  // Simplified ascendant calculation
  let ascDegrees = lstDegrees + 90; // Very simplified
  
  // Adjust for latitude (higher latitudes have longer/shorter rising times)
  const latFactor = Math.cos(latRad);
  ascDegrees = ascDegrees * (0.8 + 0.2 * latFactor);
  
  ascDegrees = ((ascDegrees % 360) + 360) % 360;
  
  // Convert degrees to zodiac sign
  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  
  const signIndex = Math.floor(ascDegrees / 30);
  const signDegree = Math.floor(ascDegrees % 30);
  
  return {
    sign: signs[signIndex],
    degree: signDegree,
    display: `${signs[signIndex]} ${signDegree}°`
  };
}

// Get element for a zodiac sign
function getSignElement(sign) {
  const elements = {
    'Aries': 'Fire', 'Leo': 'Fire', 'Sagittarius': 'Fire',
    'Taurus': 'Earth', 'Virgo': 'Earth', 'Capricorn': 'Earth',
    'Gemini': 'Air', 'Libra': 'Air', 'Aquarius': 'Air',
    'Cancer': 'Water', 'Scorpio': 'Water', 'Pisces': 'Water'
  };
  return elements[sign] || null;
}

// Get modality for a zodiac sign
function getSignModality(sign) {
  const modalities = {
    'Aries': 'Cardinal', 'Cancer': 'Cardinal', 'Libra': 'Cardinal', 'Capricorn': 'Cardinal',
    'Taurus': 'Fixed', 'Leo': 'Fixed', 'Scorpio': 'Fixed', 'Aquarius': 'Fixed',
    'Gemini': 'Mutable', 'Virgo': 'Mutable', 'Sagittarius': 'Mutable', 'Pisces': 'Mutable'
  };
  return modalities[sign] || null;
}

// Calculate the dominant element and modality from Sun, Moon, Rising
function calculateDominantTraits(sunSign, moonSign, ascendant) {
  const elements = {};
  const modalities = {};
  
  [sunSign, moonSign, ascendant].forEach((sign, idx) => {
    if (!sign) return;
    const weight = idx === 0 ? 3 : idx === 1 ? 2 : 2; // Sun=3, Moon=2, Rising=2
    
    const element = getSignElement(sign);
    const modality = getSignModality(sign);
    
    if (element) elements[element] = (elements[element] || 0) + weight;
    if (modality) modalities[modality] = (modalities[modality] || 0) + weight;
  });
  
  const dominantElement = Object.entries(elements).sort((a, b) => b[1] - a[1])[0];
  const dominantModality = Object.entries(modalities).sort((a, b) => b[1] - a[1])[0];
  
  return {
    dominantElement: dominantElement ? dominantElement[0] : null,
    dominantModality: dominantModality ? dominantModality[0] : null,
    elementBreakdown: elements,
    modalityBreakdown: modalities
  };
}

// Get element from Life Path number (numerology-based secondary element)
function getElementFromLifePath(lifePathNum) {
  // Fire: 1, 3, 9 - Action, creativity, passion
  // Earth: 4, 8 - Stability, material, practical
  // Air: 5, 7, 11 - Mental, communication, ideas
  // Water: 2, 6, 22, 33 - Emotional, intuitive, nurturing
  const elementMap = {
    1: 'Fire',    // Leadership, initiative
    2: 'Water',   // Cooperation, sensitivity
    3: 'Fire',    // Creativity, expression
    4: 'Earth',   // Structure, foundation
    5: 'Air',     // Freedom, change, communication
    6: 'Water',   // Nurturing, responsibility
    7: 'Air',     // Analysis, spirituality, wisdom
    8: 'Earth',   // Power, material mastery
    9: 'Fire',    // Humanitarian, completion
    11: 'Air',    // Intuition, inspiration, vision
    22: 'Earth',  // Master builder (elevated Earth)
    33: 'Water'   // Master healer (elevated Water)
  };
  return elementMap[lifePathNum] || 'Earth';
}

function detectNameMasterNumbers(fullName, birthDate) {
  const masters = new Set();
  const locations = [];
  
  // Expression (Western - primary)
  const expression = calculateExpressionWestern(fullName);
  if ([11, 22, 33].includes(expression.sum) || [11, 22, 33].includes(expression.reduced)) {
    const val = [11, 22, 33].includes(expression.sum) ? expression.sum : expression.reduced;
    masters.add(val);
    locations.push(`expression:${val}`);
  }
  
  // Soul Urge (Western - primary)
  const soulUrge = calculateSoulUrgeWestern(fullName);
  if ([11, 22, 33].includes(soulUrge.sum) || [11, 22, 33].includes(soulUrge.reduced)) {
    const val = [11, 22, 33].includes(soulUrge.sum) ? soulUrge.sum : soulUrge.reduced;
    masters.add(val);
    locations.push(`soulUrge:${val}`);
  }
  
  // Personality (Western - primary)
  const personality = calculatePersonalityWestern(fullName);
  if ([11, 22, 33].includes(personality.sum) || [11, 22, 33].includes(personality.reduced)) {
    const val = [11, 22, 33].includes(personality.sum) ? personality.sum : personality.reduced;
    masters.add(val);
    locations.push(`personality:${val}`);
  }
  
  // Life Path (Western - primary)
  if (birthDate) {
    const lifePath = calculateLifePathWestern(birthDate);
    if ([11, 22, 33].includes(lifePath.total) || [11, 22, 33].includes(lifePath.reduced)) {
      const val = [11, 22, 33].includes(lifePath.total) ? lifePath.total : lifePath.reduced;
      masters.add(val);
      locations.push(`lifePath:${val}`);
    }
    
    // Birthday day
    const date = new Date(birthDate);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    
    if ([11, 22].includes(day)) {
      masters.add(day);
      locations.push(`birthday:${day}`);
    }
    
    // Birthday month (November = 11)
    if (month === 11) {
      masters.add(11);
      locations.push(`month:11`);
    }
  }
  
  return {
    hasMaster: masters.size > 0,
    masterNumbers: Array.from(masters).sort((a, b) => a - b).join(','),
    masterLocations: locations.join('; ')
  };
}

// ============================================================================
// FULL CALCULATION FUNCTIONS
// ============================================================================

function calculateFullDateNumerology(dateStr) {
  const date = new Date(dateStr);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  
  const vibes = getDateVibes(day, month, year);
  const eastern = calculateDateEastern(day, month, year);
  const western = calculateDateWestern(day, month, year);
  const reverse = calculateDateReverse(day, month, year);
  const masters = detectMasterNumbers(day, month, year);
  const hebrew = gregorianToHebrew(year, month, day);
  const shemitah = calculateShemitahPosition(hebrew.hebrewYear);
  
  // Hebrew date calculations
  const hebrewEastern = calculateDateEastern(hebrew.hebrewDay, hebrew.hebrewMonth, hebrew.hebrewYear);
  const hebrewWestern = calculateDateWestern(hebrew.hebrewDay, hebrew.hebrewMonth, hebrew.hebrewYear);
  const hebrewReverse = calculateDateReverse(hebrew.hebrewDay, hebrew.hebrewMonth, hebrew.hebrewYear);
  
  return {
    // Gregorian basics
    greg_date: dateStr,
    greg_day: day,
    greg_month: month,
    greg_year: year,
    day_vibe: vibes.dayVibe,
    month_vibe: vibes.monthVibe,
    year_vibe: vibes.yearVibe,
    
    // Gregorian calculations
    day_month_eastern: `${reduceToDigit(day)}+${reduceToDigit(month)}=${reduceToDigit(day + month)}`,
    day_month_western: formatWithReduction(day + month),
    day_month_reverse: formatWithReduction(month + day),
    full_date_eastern: eastern.formatted,
    full_date_western: western.formatted,
    full_date_reverse: reverse.formatted,
    full_date_vibe_eastern: String(eastern.reduced),
    full_date_vibe_western: String(western.reduced),
    full_date_vibe_reverse_eastern: String(eastern.reduced),
    full_date_vibe_reverse_western: String(reverse.reduced),
    
    // Method comparison flags
    greg_method_differs: eastern.reduced !== western.reduced,
    greg_reverse_equals_eastern_dm: reduceToDigit(month + day) === reduceToDigit(day + month),
    greg_reverse_equals_eastern_full: reverse.reduced === eastern.reduced,
    
    // Hebrew basics
    hebrew_date: hebrew.hebrewDate,
    hebrew_day: hebrew.hebrewDay,
    hebrew_month: hebrew.hebrewMonth,
    hebrew_year: hebrew.hebrewYear,
    hebrew_day_vibe: hebrew.hebrewDayVibe,
    hebrew_month_vibe: hebrew.hebrewMonthVibe,
    hebrew_year_vibe: hebrew.hebrewYearVibe,
    
    // Hebrew calculations
    hebrew_day_month_eastern: `${hebrew.hebrewDayVibe}+${hebrew.hebrewMonthVibe}=${reduceToDigit(hebrew.hebrewDayVibe + hebrew.hebrewMonthVibe)}`,
    hebrew_day_month_western: formatWithReduction(hebrew.hebrewDay + hebrew.hebrewMonth),
    hebrew_day_month_reverse: formatWithReduction(hebrew.hebrewMonth + hebrew.hebrewDay),
    hebrew_full_date_eastern: hebrewEastern.formatted,
    hebrew_full_date_western: hebrewWestern.formatted,
    hebrew_full_date_reverse: hebrewReverse.formatted,
    hebrew_full_date_vibe_eastern: String(hebrewEastern.reduced),
    hebrew_full_date_vibe_western: String(hebrewWestern.reduced),
    hebrew_full_date_vibe_reverse_eastern: String(hebrewEastern.reduced),
    hebrew_full_date_vibe_reverse_western: String(hebrewReverse.reduced),
    
    // Hebrew method comparison flags
    heb_method_differs: hebrewEastern.reduced !== hebrewWestern.reduced,
    heb_reverse_equals_eastern_dm: reduceToDigit(hebrew.hebrewMonth + hebrew.hebrewDay) === reduceToDigit(hebrew.hebrewDay + hebrew.hebrewMonth),
    heb_reverse_equals_eastern_full: hebrewReverse.reduced === hebrewEastern.reduced,
    
    // Master numbers
    has_master_number: masters.hasMaster ? masters.masterNumbers : null,
    master_locations: masters.masterLocations || null,
    
    // Shemitah
    shemitah_year_position: shemitah.position,
    shemitah_alert: shemitah.alert,
    
    // Combined signal (for games)
    combined_signal: generateCombinedSignal(eastern.reduced, western.reduced, masters.hasMaster)
  };
}

function generateCombinedSignal(easternVibe, westernVibe, hasMaster) {
  const signals = [];
  
  if (hasMaster) signals.push('MASTER');
  if (easternVibe === westernVibe) signals.push('ALIGNED');
  if ([7, 8, 9].includes(easternVibe)) signals.push('HIGH_ENERGY');
  if ([1, 2, 3].includes(easternVibe)) signals.push('NEW_BEGINNINGS');
  if (easternVibe === 5) signals.push('CHANGE');
  if (easternVibe === 6) signals.push('HARMONY');
  
  return signals.join('; ') || 'NEUTRAL';
}

function calculateFullNameNumerology(fullName, birthDate = null, birthTime = null, birthPlace = null) {
  const cleanedName = cleanName(fullName);
  
  // Western calculations (Pythagorean-based) - PRIMARY for display
  const expressionWestern = calculateExpressionWestern(cleanedName);
  const soulUrgeWestern = calculateSoulUrgeWestern(cleanedName);
  const personalityWestern = calculatePersonalityWestern(cleanedName);
  
  // Chaldean calculations - stored as secondary
  const expressionChaldean = calculateExpressionChaldean(cleanedName);
  const soulUrgeChaldean = calculateSoulUrgeChaldean(cleanedName);
  const personalityChaldean = calculatePersonalityChaldean(cleanedName);
  
  // Chaldean2 calculations - ALWAYS single digit (no master numbers)
  const expressionChaldean2 = calculateExpressionChaldean2(cleanedName);
  const soulUrgeChaldean2 = calculateSoulUrgeChaldean2(cleanedName);
  const personalityChaldean2 = calculatePersonalityChaldean2(cleanedName);
  
  const vowelConsonant = vowelConsonantAnalysis(cleanedName);
  const masters = detectNameMasterNumbers(cleanedName, birthDate);
  
  // Collect master numbers as array (from Western calculations)
  // Include higher master numbers: 44, 55, 66, 77, 88, 99
  // ALSO capture master numbers that appear DURING the reduction process (e.g., 74 -> 11 -> 2)
  const ALL_MASTER_NUMBERS = [11, 22, 33, 44, 55, 66, 77, 88, 99];
  const masterNumbersArray = [];
  
  // Check Expression for master numbers (raw sum AND any masters found during reduction)
  const expressionReduction = reduceWithMasters(expressionWestern.sum);
  expressionReduction.masters.forEach(m => {
    if (!masterNumbersArray.includes(m)) masterNumbersArray.push(m);
  });
  if (ALL_MASTER_NUMBERS.includes(expressionWestern.sum) && !masterNumbersArray.includes(expressionWestern.sum)) {
    masterNumbersArray.push(expressionWestern.sum);
  }
  
  // Check Soul Urge for master numbers
  const soulUrgeReduction = reduceWithMasters(soulUrgeWestern.sum);
  soulUrgeReduction.masters.forEach(m => {
    if (!masterNumbersArray.includes(m)) masterNumbersArray.push(m);
  });
  if (ALL_MASTER_NUMBERS.includes(soulUrgeWestern.sum) && !masterNumbersArray.includes(soulUrgeWestern.sum)) {
    masterNumbersArray.push(soulUrgeWestern.sum);
  }
  
  // Check Personality for master numbers
  const personalityReduction = reduceWithMasters(personalityWestern.sum);
  personalityReduction.masters.forEach(m => {
    if (!masterNumbersArray.includes(m)) masterNumbersArray.push(m);
  });
  if (ALL_MASTER_NUMBERS.includes(personalityWestern.sum) && !masterNumbersArray.includes(personalityWestern.sum)) {
    masterNumbersArray.push(personalityWestern.sum);
  }
  
  // Also check Chaldean for higher master numbers (like 77)
  const expressionChaldeanReduction = reduceWithMasters(expressionChaldean.sum);
  expressionChaldeanReduction.masters.forEach(m => {
    if (!masterNumbersArray.includes(m)) masterNumbersArray.push(m);
  });
  const soulUrgeChaldeanReduction = reduceWithMasters(soulUrgeChaldean.sum);
  soulUrgeChaldeanReduction.masters.forEach(m => {
    if (!masterNumbersArray.includes(m)) masterNumbersArray.push(m);
  });
  const personalityChaldeanReduction = reduceWithMasters(personalityChaldean.sum);
  personalityChaldeanReduction.masters.forEach(m => {
    if (!masterNumbersArray.includes(m)) masterNumbersArray.push(m);
  });
  
  const result = {
    // Name info
    original_name: fullName,
    cleaned_name: cleanedName,
    
    // Pythagorean - structured for UI
    pythagorean: {
      total: pythagoreanSum(cleanedName),
      reduced: reduceToDigit(pythagoreanSum(cleanedName)),
      display: formatWithReduction(pythagoreanSum(cleanedName))
    },
    
    // Chaldean - structured for UI
    chaldean: {
      total: chaldeanSum(cleanedName),
      reduced: reduceToDigit(chaldeanSum(cleanedName)),
      display: formatWithReduction(chaldeanSum(cleanedName))
    },
    
    // Gematria - structured for UI
    gematria: {
      total: gematriaSimple(cleanedName),
      simple: gematriaSimple(cleanedName),
      reverse: gematriaReverse(cleanedName)
    },
    
    // Western (Pythagorean) - PRIMARY for display
    expression: {
      sum: expressionWestern.sum,
      reduced: ALL_MASTER_NUMBERS.includes(expressionWestern.sum) ? expressionWestern.sum : expressionWestern.reduced,
      display: ALL_MASTER_NUMBERS.includes(expressionWestern.sum) ? String(expressionWestern.sum) : expressionWestern.formatted
    },
    soulUrge: {
      sum: soulUrgeWestern.sum,
      reduced: ALL_MASTER_NUMBERS.includes(soulUrgeWestern.sum) ? soulUrgeWestern.sum : soulUrgeWestern.reduced,
      display: ALL_MASTER_NUMBERS.includes(soulUrgeWestern.sum) ? String(soulUrgeWestern.sum) : soulUrgeWestern.formatted
    },
    personality: {
      sum: personalityWestern.sum,
      reduced: ALL_MASTER_NUMBERS.includes(personalityWestern.sum) ? personalityWestern.sum : personalityWestern.reduced,
      display: ALL_MASTER_NUMBERS.includes(personalityWestern.sum) ? String(personalityWestern.sum) : personalityWestern.formatted
    },
    
    // Chaldean versions for storage (check for higher masters like 77)
    expressionChaldean: {
      sum: expressionChaldean.sum,
      reduced: ALL_MASTER_NUMBERS.includes(expressionChaldean.sum) ? expressionChaldean.sum : expressionChaldean.reduced,
      reducedSingleDigit: expressionChaldean.reducedSingleDigit,
      display: ALL_MASTER_NUMBERS.includes(expressionChaldean.sum) ? String(expressionChaldean.sum) : expressionChaldean.formatted
    },
    soulUrgeChaldean: {
      sum: soulUrgeChaldean.sum,
      reduced: ALL_MASTER_NUMBERS.includes(soulUrgeChaldean.sum) ? soulUrgeChaldean.sum : soulUrgeChaldean.reduced,
      reducedSingleDigit: soulUrgeChaldean.reducedSingleDigit,
      display: ALL_MASTER_NUMBERS.includes(soulUrgeChaldean.sum) ? String(soulUrgeChaldean.sum) : soulUrgeChaldean.formatted
    },
    personalityChaldean: {
      sum: personalityChaldean.sum,
      reduced: ALL_MASTER_NUMBERS.includes(personalityChaldean.sum) ? personalityChaldean.sum : personalityChaldean.reduced,
      reducedSingleDigit: personalityChaldean.reducedSingleDigit,
      display: ALL_MASTER_NUMBERS.includes(personalityChaldean.sum) ? String(personalityChaldean.sum) : personalityChaldean.formatted
    },
    
    // Chaldean2 versions (ALWAYS single digit)
    expressionChaldean2: {
      sum: expressionChaldean2.sum,
      reduced: expressionChaldean2.reduced, // Always single digit
      display: expressionChaldean2.formatted
    },
    soulUrgeChaldean2: {
      sum: soulUrgeChaldean2.sum,
      reduced: soulUrgeChaldean2.reduced, // Always single digit
      display: soulUrgeChaldean2.formatted
    },
    personalityChaldean2: {
      sum: personalityChaldean2.sum,
      reduced: personalityChaldean2.reduced, // Always single digit
      display: personalityChaldean2.formatted
    },
    
    // Vowel/Consonant analysis
    vowel_sum: vowelConsonant.vowelSum,
    consonant_sum: vowelConsonant.consonantSum,
    vowel_consonant_ratio: vowelConsonant.ratio,
    
    // Master numbers as array for UI
    masterNumbers: [...new Set(masterNumbersArray)].sort((a, b) => a - b),
    
    // Legacy fields
    has_master_number: masters.hasMaster ? masters.masterNumbers : null,
    master_locations: masters.masterLocations || null
  };
  
  // Add karmic debt and karmic lessons
  result.karmicDebt = detectKarmicDebt(birthDate, cleanedName);
  result.karmicLessons = detectKarmicLessons(cleanedName);
  
  // Add life path if birthdate provided
  if (birthDate) {
    const date = new Date(birthDate);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    
    // Western life path (primary)
    const lifePathWestern = calculateLifePathWestern(birthDate);
    const lifePathChaldean = calculateLifePathChaldean(birthDate);
    const lifePathChaldean2 = calculateLifePathChaldean2(birthDate);
    const birthday = calculateBirthdayNumber(day);
    const birthdayMonth = { reduced: reduceToDigit(month), display: formatWithReduction(month) };
    
    // Check if life path is master number
    const lifePathWesternIsMaster = [11, 22, 33].includes(lifePathWestern.total);
    const lifePathChaldeanIsMaster = [11, 22, 33].includes(lifePathChaldean.total);
    
    // Western life path (primary for display)
    result.lifePath = {
      total: lifePathWestern.total,
      reduced: lifePathWesternIsMaster ? lifePathWestern.total : lifePathWestern.reduced,
      display: lifePathWesternIsMaster ? String(lifePathWestern.total) : lifePathWestern.formatted
    };
    
    // Chaldean life path (for storage)
    result.lifePathChaldean = {
      total: lifePathChaldean.total,
      reduced: lifePathChaldeanIsMaster ? lifePathChaldean.total : lifePathChaldean.reduced,
      reducedSingleDigit: lifePathChaldean.reducedSingleDigit,
      display: lifePathChaldeanIsMaster ? String(lifePathChaldean.total) : lifePathChaldean.formatted
    };
    
    // Chaldean2 life path (ALWAYS single digit)
    result.lifePathChaldean2 = {
      total: lifePathChaldean2.total,
      reduced: lifePathChaldean2.reduced, // Always single digit
      display: lifePathChaldean2.formatted
    };
    
    result.birthday = {
      day: day,
      reduced: [11, 22].includes(day) ? day : birthday.reduced,
      display: [11, 22].includes(day) ? String(day) : birthday.formatted
    };
    
    result.birthdayMonth = birthdayMonth;
    
    // Add life path to master numbers if applicable (use Western)
    if (lifePathWesternIsMaster && !result.masterNumbers.includes(lifePathWestern.total)) {
      result.masterNumbers.push(lifePathWestern.total);
    }
    
    // Add birthday day to master numbers if applicable (11, 22)
    if ([11, 22].includes(day) && !result.masterNumbers.includes(day)) {
      result.masterNumbers.push(day);
    }
    
    // Add birth month to master numbers if applicable (11 = November)
    if (month === 11 && !result.masterNumbers.includes(11)) {
      result.masterNumbers.push(11);
    }
    
    // Sort and dedupe
    result.masterNumbers = [...new Set(result.masterNumbers)].sort((a, b) => a - b);
    
    // Add astrology data
    const sunSignData = calculateSunSign(birthDate);
    
    // Calculate secondary element from Life Path number
    const lifePathNum = result.lifePath.reduced;
    const secondaryElement = getElementFromLifePath(lifePathNum);
    
    // Calculate moon sign (more accurate with birth time)
    const moonSign = estimateMoonSign(birthDate, birthTime);
    
    // Calculate Ascendant/Rising sign (requires birth time and location)
    const ascendantData = calculateAscendant(birthDate, birthTime, birthPlace);
    
    // Calculate dominant traits from the Big 3
    const dominantTraits = calculateDominantTraits(sunSignData.sign, moonSign, ascendantData.sign);
    
    result.astrology = {
      sunSign: sunSignData.sign,
      sunElement: sunSignData.element,
      sunModality: sunSignData.modality,
      moonSign: moonSign,
      moonElement: getSignElement(moonSign),
      moonModality: getSignModality(moonSign),
      ascendant: ascendantData.sign,
      ascendantDegree: ascendantData.degree,
      ascendantDisplay: ascendantData.display,
      ascendantElement: getSignElement(ascendantData.sign),
      ascendantModality: getSignModality(ascendantData.sign),
      element: sunSignData.element,
      secondaryElement: secondaryElement,
      modality: sunSignData.modality,
      rulingPlanet: sunSignData.ruler,
      dominantElement: dominantTraits.dominantElement,
      dominantModality: dominantTraits.dominantModality,
      elementBreakdown: dominantTraits.elementBreakdown,
      modalityBreakdown: dominantTraits.modalityBreakdown,
      bigThree: `${sunSignData.sign}/${moonSign}/${ascendantData.sign}`,
      chineseZodiac: `${sunSignData.chineseElement} ${sunSignData.chineseAnimal}`,
      chineseAnimal: sunSignData.chineseAnimal,
      chineseElement: sunSignData.chineseElement,
      sign: sunSignData.sign
    };
  }
  
  return result;
}

// ============================================================================
// FAMILY MEMBER CALCULATIONS
// ============================================================================

function calculateFamilyMember(name, birthDate) {
    const dateCalc = calculateFullDateNumerology(birthDate);
    const nameCalc = calculateFullNameNumerology(name, birthDate);

    return {
      name,
      birthDate,
      ...nameCalc,
      birth_date_numerology: dateCalc
    };
  }

  // ============================================================================
  // DAY NUMBERS CALCULATION (Universal & Personal)
  // ============================================================================

  function calculateDayNumbers(dateStr, lifePath = null) {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    // Universal Year = reduce current year to single digit
    const universalYear = reduceToDigit(year);

    // Universal Month = Universal Year + calendar month, reduced
    const universalMonth = reduceToDigit(universalYear + month);

    // Universal Day = Universal Month + calendar day, reduced
    const universalDay = reduceToDigit(universalMonth + day);

    // Format displays
    const universalDayDisplay = formatWithReduction(universalMonth + day);

    const result = {
      date: dateStr,
      day,
      month,
      year,
      universalYear,
      universalMonth,
      universalDay,
      universalDayDisplay,
      vibeSummary: getUniversalDayVibe(universalDay),
      recommendations: getUniversalDayRecommendations(universalDay)
    };

    // Personal cycles if life path provided
    if (lifePath) {
      // Personal Year = birth month + birth day + current year, reduced
      // Since we don't have birth date here, we use life path directly
      // Personal Year = Life Path + Universal Year, reduced
      const personalYear = reduceToDigit(lifePath + universalYear);

      // Personal Month = Personal Year + calendar month, reduced  
      const personalMonth = reduceToDigit(personalYear + month);

      // Personal Day = Personal Month + calendar day, reduced
      const personalDay = reduceToDigit(personalMonth + day);

      result.lifePath = lifePath;
      result.personalYear = personalYear;
      result.personalMonth = personalMonth;
      result.personalDay = personalDay;
      result.personalDayDisplay = formatWithReduction(personalMonth + day);
    }

    return result;
  }

  function getUniversalDayVibe(num) {
    const vibes = {
      1: "Day of new beginnings, leadership, and independence. Great for starting projects and taking initiative.",
      2: "Day of partnerships, diplomacy, and cooperation. Ideal for collaboration and building relationships.",
      3: "Day of creativity, self-expression, and joy. Perfect for communication, art, and social activities.",
      4: "Day of foundation building, organization, and hard work. Focus on practical matters and structure.",
      5: "Day of change, freedom, and adventure. Embrace flexibility and new experiences.",
      6: "Day of responsibility, family, and nurturing. Focus on home, loved ones, and service.",
      7: "Day of reflection, spirituality, and inner wisdom. Ideal for study, meditation, and solitude.",
      8: "Day of abundance, power, and achievement. Great for business, finances, and manifestation.",
      9: "Day of completion, compassion, and universal love. Time for letting go and humanitarian efforts.",
      11: "Master Day of spiritual insight and intuition. Heightened awareness and inspiration available.",
      22: "Master Builder Day. Exceptional for manifesting large-scale visions into reality.",
      33: "Master Teacher Day. Profound healing and selfless service energy available."
    };
    return vibes[num] || vibes[reduceToDigit(num, false)];
  }

  function getUniversalDayRecommendations(num) {
    const recs = {
      1: "Start something new. Take the lead. Be independent. Trust your original ideas.",
      2: "Collaborate with others. Practice patience. Listen more. Seek harmony.",
      3: "Express yourself creatively. Socialize. Write, speak, or create art. Have fun.",
      4: "Build foundations. Organize. Work steadily. Focus on practical goals.",
      5: "Embrace change. Try something new. Travel or explore. Be adaptable.",
      6: "Nurture family. Take responsibility. Create beauty at home. Serve others.",
      7: "Spend time alone. Meditate or study. Trust your intuition. Seek deeper meaning.",
      8: "Focus on business. Manage finances. Step into your power. Manifest abundance.",
      9: "Let go of what no longer serves. Practice compassion. Give to others. Complete projects.",
      11: "Trust your intuition. Seek spiritual insights. Inspire others. Stay grounded.",
      22: "Think big. Build lasting structures. Turn dreams into reality. Lead by example.",
      33: "Heal and teach. Practice unconditional love. Serve humanity. Embody compassion."
    };
    return recs[num] || recs[reduceToDigit(num, false)];
  }

// ============================================================================
// MAIN HANDLER
// ============================================================================

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    const { type, date, name, birthDate, familyMembers } = body;
    
    let result;
    
    switch (type) {
      case 'date':
        // Calculate numerology for a specific date
        if (!date) {
          return Response.json({ error: 'Date required' }, { status: 400 });
        }
        result = calculateFullDateNumerology(date);
        break;

      case 'dayNumbers':
        // Calculate universal and personal day numbers
        if (!date) {
          return Response.json({ error: 'Date required' }, { status: 400 });
        }
        result = calculateDayNumbers(date, body.lifePath);
        break;
        
      case 'name':
                // Calculate numerology for a name
                if (!name) {
                  return Response.json({ error: 'Name required' }, { status: 400 });
                }
                const calc = calculateFullNameNumerology(name, birthDate, body.birthTime, body.birthPlace);
                // Flatten nested astrology and lifePath data for easier frontend access
                result = {
                  ...calc,
                  // Flatten astrology data from nested object
                  ...(calc.astrology ? {
                    sun_sign: calc.astrology.sunSign,
                    moon_sign: calc.astrology.moonSign,
                    rising_sign: calc.astrology.ascendant,
                    element: calc.astrology.element,
                    dominant_element: calc.astrology.dominantElement,
                    chinese_zodiac: calc.astrology.chineseZodiac,
                    chinese_animal: calc.astrology.chineseAnimal,
                    chinese_element: calc.astrology.chineseElement,
                    dominant_polarity: calc.astrology.dominantPolarity,
                    preferred_keys: calc.astrology.preferredKeys,
                    preferred_tempos: calc.astrology.preferredTempos,
                    mood_preferences: calc.astrology.moodPreferences,
                    houses: calc.astrology.houses,
                    planets: calc.astrology.planets,
                    aspects: calc.astrology.aspects,
                  } : {}),
                  // Flatten lifePath and numerology numbers
                  life_path_number: calc.lifePath?.reduced,
                  expression_number: calc.expression?.reduced,
                  soul_urge_number: calc.soulUrge?.reduced,
                  personality_number: calc.personality?.reduced,
                  birthday_number: calc.birthday?.reduced,
                  // Western vibes (compound numbers like 16/7)
                  expression_western_vibe: calc.expression.display,
                  life_path_western_vibe: calc.lifePath ? calc.lifePath.display : null,
                  soul_urge_western_vibe: calc.soulUrge.display,
                  personality_western_vibe: calc.personality.display,
                  // Chaldean vibes
                  expression_chaldean_vibe: calc.expressionChaldean.display,
                  life_path_chaldean_vibe: calc.lifePathChaldean ? calc.lifePathChaldean.display : null,
                  soul_urge_chaldean_vibe: calc.soulUrgeChaldean.display,
                  personality_chaldean_vibe: calc.personalityChaldean.display
                };
                break;
        
      case 'family':
        // Calculate for multiple family members
        if (!familyMembers || !Array.isArray(familyMembers)) {
          return Response.json({ error: 'Family members array required' }, { status: 400 });
        }
        result = familyMembers.map(member => 
          calculateFamilyMember(member.name, member.birthDate)
        );
        break;
        
      case 'dateRange':
        // Calculate for a range of dates (for populating database)
        const { startDate, endDate } = body;
        if (!startDate || !endDate) {
          return Response.json({ error: 'Start and end dates required' }, { status: 400 });
        }
        
        const results = [];
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          results.push(calculateFullDateNumerology(d.toISOString().split('T')[0]));
        }
        result = results;
        break;
        
      default:
        return Response.json({ error: 'Invalid type. Use: date, name, family, or dateRange' }, { status: 400 });
    }
    
    return Response.json({ success: true, data: result });
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});