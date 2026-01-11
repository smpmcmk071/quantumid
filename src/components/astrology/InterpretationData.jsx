// Hardcoded astrological interpretation data for MVP

export const ZODIAC_SIGNS = {
  Aries: {
    element: 'Fire',
    modality: 'Cardinal',
    description: 'Bold, pioneering, and courageous. Natural leaders who initiate action and embrace challenges with enthusiasm and confidence.'
  },
  Taurus: {
    element: 'Earth',
    modality: 'Fixed',
    description: 'Grounded, practical, and sensual. Values stability, comfort, and material security. Patient and persistent in achieving goals.'
  },
  Gemini: {
    element: 'Air',
    modality: 'Mutable',
    description: 'Curious, communicative, and adaptable. Quick-witted and versatile, thrives on mental stimulation and social connections.'
  },
  Cancer: {
    element: 'Water',
    modality: 'Cardinal',
    description: 'Nurturing, intuitive, and emotional. Deeply connected to home and family, protective and empathetic to others\' needs.'
  },
  Leo: {
    element: 'Fire',
    modality: 'Fixed',
    description: 'Creative, confident, and charismatic. Natural performers who inspire others with warmth, generosity, and self-expression.'
  },
  Virgo: {
    element: 'Earth',
    modality: 'Mutable',
    description: 'Analytical, meticulous, and service-oriented. Detail-focused and practical, seeks to improve and perfect everything.'
  },
  Libra: {
    element: 'Air',
    modality: 'Cardinal',
    description: 'Diplomatic, harmonious, and relationship-focused. Values fairness, beauty, and partnership. Natural mediators and peacemakers.'
  },
  Scorpio: {
    element: 'Water',
    modality: 'Fixed',
    description: 'Intense, transformative, and mysterious. Deeply passionate with powerful emotional depth and investigative instincts.'
  },
  Sagittarius: {
    element: 'Fire',
    modality: 'Mutable',
    description: 'Adventurous, optimistic, and philosophical. Seeks truth, freedom, and higher knowledge through exploration and experience.'
  },
  Capricorn: {
    element: 'Earth',
    modality: 'Cardinal',
    description: 'Ambitious, disciplined, and responsible. Strategic planners who build lasting structures through patience and hard work.'
  },
  Aquarius: {
    element: 'Air',
    modality: 'Fixed',
    description: 'Innovative, humanitarian, and independent. Forward-thinking visionaries who champion progress and collective betterment.'
  },
  Pisces: {
    element: 'Water',
    modality: 'Mutable',
    description: 'Compassionate, artistic, and spiritual. Highly intuitive and empathetic, connects to the mystical and transcendent realms.'
  }
};

export const PLANETS = {
  Sun: {
    represents: 'Core identity, ego, vitality, life purpose',
    description: 'Your fundamental essence and conscious will. Represents who you are at your core and how you shine in the world.'
  },
  Moon: {
    represents: 'Emotions, instincts, inner world, needs',
    description: 'Your emotional nature and subconscious patterns. How you nurture yourself and respond emotionally to life.'
  },
  Mercury: {
    represents: 'Communication, thinking, learning, perception',
    description: 'Your mental processes and communication style. How you think, learn, and express ideas.'
  },
  Venus: {
    represents: 'Love, beauty, values, relationships, pleasure',
    description: 'What you value and find beautiful. Your approach to love, relationships, and aesthetic appreciation.'
  },
  Mars: {
    represents: 'Action, drive, desire, assertiveness, conflict',
    description: 'Your energy, motivation, and how you pursue goals. Your assertiveness and approach to conflict.'
  },
  Jupiter: {
    represents: 'Expansion, growth, wisdom, luck, optimism',
    description: 'Where you find abundance and opportunity. Your beliefs, philosophy, and capacity for growth.'
  },
  Saturn: {
    represents: 'Structure, discipline, responsibility, limitations',
    description: 'Your lessons, boundaries, and areas of mastery. Where you develop discipline and long-term success.'
  },
  Uranus: {
    represents: 'Innovation, rebellion, change, awakening',
    description: 'Where you seek freedom and express uniqueness. Your innovative impulses and sudden insights.'
  },
  Neptune: {
    represents: 'Dreams, spirituality, imagination, illusion',
    description: 'Your connection to the mystical and transcendent. Where you dissolve boundaries and tap into universal consciousness.'
  },
  Pluto: {
    represents: 'Transformation, power, depth, regeneration',
    description: 'Deep psychological transformation and empowerment. Where you experience profound change and reclaim power.'
  },
  NorthNode: {
    represents: 'Soul\'s growth direction, life lessons',
    description: 'Your karmic path forward and soul\'s evolutionary direction. Where you\'re meant to grow in this lifetime.'
  },
  Chiron: {
    represents: 'Wounded healer, core wounds, healing gifts',
    description: 'Your deepest wound and greatest healing potential. Where pain becomes wisdom and service to others.'
  }
};

export const HOUSES = {
  1: {
    name: 'First House',
    area: 'Self, identity, appearance, first impressions',
    description: 'Your persona and how you present yourself to the world. Physical appearance, personality, and approach to life.'
  },
  2: {
    name: 'Second House',
    area: 'Money, values, possessions, self-worth',
    description: 'Material resources, personal values, and sense of self-worth. What you own and how you earn.'
  },
  3: {
    name: 'Third House',
    area: 'Communication, learning, siblings, short trips',
    description: 'Mental activities, communication style, early education, siblings, and local environment.'
  },
  4: {
    name: 'Fourth House',
    area: 'Home, family, roots, emotional foundation',
    description: 'Your private life, home, family background, and emotional security. Your roots and inner sanctuary.'
  },
  5: {
    name: 'Fifth House',
    area: 'Creativity, pleasure, romance, children',
    description: 'Self-expression, creative pursuits, romance, play, and children. Where you find joy and express yourself.'
  },
  6: {
    name: 'Sixth House',
    area: 'Health, work, service, daily routines',
    description: 'Daily work, health habits, service to others, and practical skills. Your approach to wellness and duty.'
  },
  7: {
    name: 'Seventh House',
    area: 'Partnerships, marriage, contracts, others',
    description: 'Committed relationships, marriage, business partnerships, and how you relate one-on-one with others.'
  },
  8: {
    name: 'Eighth House',
    area: 'Transformation, shared resources, intimacy',
    description: 'Deep psychological processes, shared resources, intimacy, death, and transformation. Hidden realms.'
  },
  9: {
    name: 'Ninth House',
    area: 'Philosophy, higher learning, travel, beliefs',
    description: 'Higher education, philosophy, foreign travel, and spiritual beliefs. Your search for meaning and truth.'
  },
  10: {
    name: 'Tenth House',
    area: 'Career, reputation, public life, legacy',
    description: 'Professional life, public reputation, achievement, and life direction. How you contribute to society.'
  },
  11: {
    name: 'Eleventh House',
    area: 'Friends, groups, hopes, humanitarian goals',
    description: 'Friendships, group affiliations, social causes, and future aspirations. Your role in the collective.'
  },
  12: {
    name: 'Twelfth House',
    area: 'Spirituality, subconscious, hidden matters',
    description: 'The unconscious mind, spiritual practices, secrets, and what\'s hidden. Inner life and karmic completion.'
  }
};

export const ASPECTS = {
  conjunction: {
    angle: 0,
    nature: 'Neutral/Intense',
    description: 'Planets merge energies, intensifying both. Can be harmonious or challenging depending on planets involved.'
  },
  sextile: {
    angle: 60,
    nature: 'Harmonious',
    description: 'Supportive and opportunistic. Creates ease and natural talent between planetary energies.'
  },
  square: {
    angle: 90,
    nature: 'Challenging',
    description: 'Dynamic tension requiring action. Creates friction but also motivation for growth and achievement.'
  },
  trine: {
    angle: 120,
    nature: 'Harmonious',
    description: 'Natural flow and ease. Talents come naturally but may need conscious development to fully manifest.'
  },
  opposition: {
    angle: 180,
    nature: 'Challenging',
    description: 'Polarizing tension requiring integration. Awareness of both sides leads to balance and wholeness.'
  }
};