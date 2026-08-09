import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { artist } = await req.json();
    
    if (!artist) {
      return Response.json({ error: 'Artist name required' }, { status: 400 });
    }
    
    const apiKey = Deno.env.get('LASTFM_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'LASTFM_API_KEY not configured' }, { status: 500 });
    }
    
    const baseUrl = 'http://ws.audioscrobbler.com/2.0/';
    const params = new URLSearchParams({
      method: 'artist.getInfo',
      artist: artist,
      autocorrect: '1',
      api_key: apiKey,
      format: 'json'
    });
    
    const response = await fetch(`${baseUrl}?${params}`);
    const data = await response.json();
    
    if (data.error) {
      return Response.json({ error: `Last.fm error: ${data.message}` }, { status: 400 });
    }
    
    const artistData = data.artist;
    
    const result = {
      name: artistData.name,
      mbid: artistData.mbid || null,
      url: artistData.url,
      bio: artistData.bio?.summary?.split('<a href')[0]?.trim() || null,
      tags: (artistData.tags?.tag || []).map(t => t.name).slice(0, 10),
      similar: (artistData.similar?.artist || []).map(a => a.name).slice(0, 10),
      stats: {
        listeners: parseInt(artistData.stats?.listeners) || 0,
        playcount: parseInt(artistData.stats?.playcount) || 0
      }
    };
    
    return Response.json({ success: true, data: result });
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});