import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { artistName } = await req.json();
    
    if (!artistName) {
      return Response.json({ error: 'Artist name required' }, { status: 400 });
    }
    
    const userAgent = Deno.env.get('MUSICBRAINZ_USER_AGENT') || 'QuantumVibe/1.0';
    const baseUrl = 'https://musicbrainz.org/ws/2/';
    
    const params = new URLSearchParams({
      query: artistName,
      fmt: 'json',
      limit: '5'
    });
    
    const response = await fetch(`${baseUrl}artist/?${params}`, {
      headers: {
        'User-Agent': userAgent
      }
    });
    
    const data = await response.json();
    
    if (!data.artists || data.artists.length === 0) {
      return Response.json({ success: true, data: [] });
    }
    
    const results = data.artists.map(artist => ({
      mbid: artist.id,
      name: artist.name,
      type: artist.type || 'N/A',
      country: artist.country || 'N/A',
      disambiguation: artist.disambiguation || null,
      score: artist.score || 0
    }));
    
    return Response.json({ success: true, data: results });
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});