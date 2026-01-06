import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const TEAM_MEMBERS = [
  { full_name: 'Amy Cher D\'Angelo', birth_date: '1970-12-27', role: 'Manager', seniority: 'senior' },
  { full_name: 'Christian Stephen Maher', birth_date: '1989-10-25', role: 'Developer', seniority: 'senior' },
  { full_name: 'Melanie Elizabeth Maher', birth_date: '1998-09-28', role: 'Designer', seniority: 'mid' },
  { full_name: 'Kyle Matthew Maher', birth_date: '1995-07-19', role: 'Developer', seniority: 'mid' },
  { full_name: 'Megan Johnson', birth_date: '1994-07-11', role: 'Manager', seniority: 'mid' }
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find Threshold7 client
    let clients = await base44.entities.Client.filter({ company_name: 'Threshold7' });
    
    if (clients.length === 0) {
      return Response.json({ error: 'Threshold7 client not found' }, { status: 404 });
    }
    
    const client = clients[0];

    // Find or create All Stars team
    let teams = await base44.entities.Team.filter({ client_id: client.id, team_name: 'All Stars' });
    let team;
    
    if (teams.length === 0) {
      team = await base44.entities.Team.create({
        client_id: client.id,
        team_name: 'All Stars',
        department: 'Leadership',
        description: 'Core team members',
        is_active: true
      });
    } else {
      team = teams[0];
    }

    const added = [];
    
    for (const member of TEAM_MEMBERS) {
      // Check if already exists
      const existing = await base44.entities.TeamMember.filter({
        team_id: team.id,
        full_name: member.full_name
      });
      
      if (existing.length === 0) {
        // Calculate numerology
        const response = await base44.functions.invoke('calculateNumerology', {
          type: 'name',
          name: member.full_name,
          birthDate: member.birth_date
        });

        if (response.data?.success) {
          const calc = response.data.data;
          
          await base44.entities.TeamMember.create({
            team_id: team.id,
            full_name: member.full_name,
            email: `${member.full_name.toLowerCase().replace(/\s+/g, '.')}@threshold7.com`,
            birth_date: member.birth_date,
            role: member.role,
            seniority: member.seniority,
            life_path_western: calc.lifePathWestern,
            life_path_chaldean: calc.lifePathChaldean,
            expression_western: calc.expressionWestern,
            soul_urge_western: calc.soulUrgeWestern,
            personality_western: calc.personalityWestern,
            birthday_number: calc.birthdayNumber,
            master_numbers: calc.masterNumbers?.join(', ') || '',
            element: calc.element
          });
          
          added.push(member.full_name);
        }
      }
    }

    return Response.json({
      success: true,
      data: {
        client: client.company_name,
        team: team.team_name,
        added: added.length,
        names: added
      }
    });

  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});