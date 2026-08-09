import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { mbid } = await req.json();
    
    if (!mbid) {
      return Response.json({ error: 'MusicBrainz ID (mbid) required' }, { status: 400 });
    }
    
    const userAgent = Deno.env.get('MUSICBRAINZ_USER_AGENT') || 'QuantumVibe/1.0';
    const baseUrl = 'https://musicbrainz.org/ws/2/';
    
    const params = new URLSearchParams({
      inc: 'url-rels+release-groups',
      fmt: 'json'
    });
    
    const response = await fetch(`${baseUrl}artist/${mbid}?${params}`, {
      headers: {
        'User-Agent': userAgent
      }
    });
    
    const data = await response.json();
    
    // Extract release groups and sort by date
    const releases = data['release-groups'] || [];
    const sortedReleases = releases
      .filter(rg => rg['first-release-date'])
      .sort((a, b) => b['first-release-date'].localeCompare(a['first-release-date']));
    
    const result = {
      name: data.name || 'N/A',
      type: data.type || 'N/A',
      country: data.area?.name || 'N/A',
      formed: data['life-span']?.begin || 'N/A',
      active: data['life-span']?.ended ? data['life-span'].end : 'present',
      official_site: data.relations?.find(r => r.type === 'official homepage')?.url?.resource || 'N/A',
      wikipedia: data.relations?.find(r => r.url?.resource?.includes('wikipedia'))?.url?.resource || 'N/A',
      release_groups_count: releases.length,
      latest_release: sortedReleases.length > 0 ? {
        title: sortedReleases[0].title,
        date: sortedReleases[0]['first-release-date'],
        primary_type: sortedReleases[0]['primary-type'] || 'N/A',
        secondary_types: sortedReleases[0]['secondary-types'] || []
      } : null,
      recent_albums: sortedReleases.slice(0, 5).map(rg => ({
        title: rg.title,
        date: rg['first-release-date'],
        primary_type: rg['primary-type'] || 'N/A',
        mbid: rg.id
      }))
    };
    
    return Response.json({ success: true, data: result });
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});