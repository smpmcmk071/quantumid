import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Famous people with known birthdates for testing
const CELEBRITIES = [
  // Tech Leaders
  { full_name: 'Elon Musk', birth_date: '1971-06-28', role: 'CEO', seniority: 'lead' },
  { full_name: 'Steve Jobs', birth_date: '1955-02-24', role: 'CEO', seniority: 'lead' },
  { full_name: 'Bill Gates', birth_date: '1955-10-28', role: 'CEO', seniority: 'lead' },
  { full_name: 'Mark Zuckerberg', birth_date: '1984-05-14', role: 'CEO', seniority: 'lead' },
  
  // Political Leaders
  { full_name: 'Donald Trump', birth_date: '1946-06-14', role: 'Executive', seniority: 'lead' },
  { full_name: 'Barack Obama', birth_date: '1961-08-04', role: 'Executive', seniority: 'lead' },
  { full_name: 'Joe Biden', birth_date: '1942-11-20', role: 'Executive', seniority: 'lead' },
  
  // Business Leaders
  { full_name: 'Oprah Winfrey', birth_date: '1954-01-29', role: 'Media Executive', seniority: 'lead' },
  { full_name: 'Warren Buffett', birth_date: '1930-08-30', role: 'Investor', seniority: 'lead' },
  { full_name: 'Jeff Bezos', birth_date: '1964-01-12', role: 'CEO', seniority: 'lead' },
  
  // Athletes
  { full_name: 'Michael Jordan', birth_date: '1963-02-17', role: 'Athlete', seniority: 'senior' },
  { full_name: 'LeBron James', birth_date: '1984-12-30', role: 'Athlete', seniority: 'senior' },
  { full_name: 'Tom Brady', birth_date: '1977-08-03', role: 'Athlete', seniority: 'senior' },
  
  // Artists/Creatives
  { full_name: 'Taylor Swift', birth_date: '1989-12-13', role: 'Artist', seniority: 'senior' },
  { full_name: 'Beyonce Knowles', birth_date: '1981-09-04', role: 'Artist', seniority: 'senior' },
  { full_name: 'Leonardo DiCaprio', birth_date: '1974-11-11', role: 'Actor', seniority: 'senior' },
  
  // Scientists/Innovators
  { full_name: 'Albert Einstein', birth_date: '1879-03-14', role: 'Scientist', seniority: 'lead' },
  { full_name: 'Stephen Hawking', birth_date: '1942-01-08', role: 'Scientist', seniority: 'lead' },
  
  // User
  { full_name: 'Stephen Paul Maher', birth_date: '1969-11-07', role: 'CEO', seniority: 'lead' }
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { clientName = 'Threshold7' } = await req.json();
    
    // Find or create Threshold7 client
    let clients = await base44.entities.Client.filter({ company_name: clientName });
    let client;
    
    if (clients.length === 0) {
      client = await base44.entities.Client.create({
        company_name: clientName,
        admin_email: user.email,
        industry: 'Technology',
        subscription_tier: 'enterprise',
        is_active: true
      });
    } else {
      client = clients[0];
    }

    // Find or create default team
    let teams = await base44.entities.Team.filter({ client_id: client.id, team_name: 'All Stars' });
    let team;
    
    if (teams.length === 0) {
      team = await base44.entities.Team.create({
        client_id: client.id,
        team_name: 'All Stars',
        department: 'Leadership',
        description: 'Test team with famous people',
        is_active: true
      });
    } else {
      team = teams[0];
    }

    // Add all celebrities
    const added = [];
    const numerologyFunction = base44.functions.invoke;
    
    for (const celeb of CELEBRITIES) {
      // Check if already exists
      const existing = await base44.entities.TeamMember.filter({
        team_id: team.id,
        full_name: celeb.full_name
      });
      
      if (existing.length === 0) {
        // Calculate numerology
        const response = await numerologyFunction('calculateNumerology', {
          type: 'name',
          name: celeb.full_name,
          birthDate: celeb.birth_date
        });

        if (response.data?.success) {
          const calc = response.data.data;
          
          await base44.entities.TeamMember.create({
            team_id: team.id,
            full_name: celeb.full_name,
            email: `${celeb.full_name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
            birth_date: celeb.birth_date,
            role: celeb.role,
            seniority: celeb.seniority,
            life_path_western: calc.lifePathWestern,
            life_path_chaldean: calc.lifePathChaldean,
            expression_western: calc.expressionWestern,
            soul_urge_western: calc.soulUrgeWestern,
            personality_western: calc.personalityWestern,
            birthday_number: calc.birthdayNumber,
            master_numbers: calc.masterNumbers?.join(', ') || '',
            element: calc.element
          });
          
          added.push(celeb.full_name);
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