import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { artist, track } = await req.json();
    
    if (!artist || !track) {
      return Response.json({ error: 'Artist and track name required' }, { status: 400 });
    }
    
    const apiKey = Deno.env.get('LASTFM_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'LASTFM_API_KEY not configured' }, { status: 500 });
    }
    
    const baseUrl = 'http://ws.audioscrobbler.com/2.0/';
    const params = new URLSearchParams({
      method: 'track.getInfo',
      artist: artist,
      track: track,
      autocorrect: '1',
      api_key: apiKey,
      format: 'json'
    });
    
    const response = await fetch(`${baseUrl}?${params}`);
    const data = await response.json();
    
    if (data.error) {
      return Response.json({ error: `Last.fm error: ${data.message}` }, { status: 400 });
    }
    
    const trackData = data.track;
    
    // Extract relevant information
    const result = {
      name: trackData.name,
      artist: trackData.artist.name,
      album: trackData.album?.title || 'N/A',
      duration_ms: parseInt(trackData.duration) || 0,
      playcount: parseInt(trackData.playcount) || 0,
      listeners: parseInt(trackData.listeners) || 0,
      tags: (trackData.toptags?.tag || []).map(t => t.name).slice(0, 10),
      wiki_summary: trackData.wiki?.summary?.split('<a href')[0]?.trim() || null,
      mbid: trackData.mbid || null,
      url: trackData.url
    };
    
    return Response.json({ success: true, data: result });
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});