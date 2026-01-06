import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// PhD-level team building research: 4 core archetypes for high-performing teams
const ARCHETYPES = {
  visionary: {
    name: 'Visionary/Leader',
    numbers: [1, 8, 11, 22],
    description: 'Sets direction, drives execution, natural leadership',
    strengths: ['Leadership', 'Vision', 'Decision-making', 'Initiative'],
    teamRole: 'Takes charge, sets goals, drives results'
  },
  strategist: {
    name: 'Strategist/Analyst',
    numbers: [4, 7],
    description: 'Deep thinker, analytical, systematic planner',
    strengths: ['Analysis', 'Strategy', 'Problem-solving', 'Precision'],
    teamRole: 'Plans approach, analyzes risks, ensures quality'
  },
  creator: {
    name: 'Creator/Innovator',
    numbers: [3, 5, 33],
    description: 'Generates ideas, creative solutions, adaptable',
    strengths: ['Creativity', 'Innovation', 'Flexibility', 'Communication'],
    teamRole: 'Generates ideas, finds creative solutions, adapts to change'
  },
  harmonizer: {
    name: 'Harmonizer/Builder',
    numbers: [2, 6, 9],
    description: 'Brings people together, builds consensus, nurtures team',
    strengths: ['Collaboration', 'Empathy', 'Diplomacy', 'Team building'],
    teamRole: 'Unifies team, resolves conflicts, supports members'
  }
};

function classifyPerson(lifePath, expressionNumber, masterNumbers) {
  // Primary archetype from life path
  let primaryArchetype = null;
  let secondaryArchetype = null;
  
  for (const [key, archetype] of Object.entries(ARCHETYPES)) {
    if (archetype.numbers.includes(lifePath)) {
      primaryArchetype = key;
      break;
    }
  }
  
  // Secondary from expression
  if (expressionNumber && expressionNumber !== lifePath) {
    for (const [key, archetype] of Object.entries(ARCHETYPES)) {
      if (archetype.numbers.includes(expressionNumber) && key !== primaryArchetype) {
        secondaryArchetype = key;
        break;
      }
    }
  }
  
  // Check for master numbers
  const hasMasterNumbers = masterNumbers && masterNumbers.length > 0;
  const masterNumbersList = hasMasterNumbers ? masterNumbers.split(',').map(n => parseInt(n.trim())) : [];
  
  return {
    primary: primaryArchetype,
    primaryDetails: ARCHETYPES[primaryArchetype],
    secondary: secondaryArchetype,
    secondaryDetails: secondaryArchetype ? ARCHETYPES[secondaryArchetype] : null,
    hasMasterNumbers,
    masterNumbers: masterNumbersList,
    potentialLevel: hasMasterNumbers ? 'High-Potential' : 'Standard'
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { personId, entityType = 'TeamMember' } = await req.json();
    
    if (!personId) {
      return Response.json({ error: 'Person ID required' }, { status: 400 });
    }

    // Fetch person data
    const person = entityType === 'TeamMember' 
      ? await base44.entities.TeamMember.get(personId)
      : await base44.entities.Candidate.get(personId);

    const classification = classifyPerson(
      person.life_path_western,
      person.expression_western,
      person.master_numbers
    );

    // Update person with archetype
    const updateData = {
      archetype_primary: classification.primary,
      archetype_secondary: classification.secondary,
      potential_level: classification.potentialLevel
    };

    if (entityType === 'TeamMember') {
      await base44.entities.TeamMember.update(personId, updateData);
    } else {
      await base44.entities.Candidate.update(personId, updateData);
    }

    return Response.json({
      success: true,
      data: classification
    });

  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});