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
    
    // Helper function to call Last.fm API
    const lastfmGet = async (params) => {
      const queryParams = new URLSearchParams({
        ...params,
        api_key: apiKey,
        format: 'json'
      });
      
      const response = await fetch(`${baseUrl}?${queryParams}`);
      const data = await response.json();
      
      if (data.error) {
        throw new Error(`Last.fm error: ${data.message}`);
      }
      
      return data;
    };
    
    // 1. Get track info
    const trackData = await lastfmGet({
      method: 'track.getInfo',
      artist: artist,
      track: track,
      autocorrect: '1'
    });
    
    const trackInfo = trackData.track;
    
    // 2. Get album release date (if album exists)
    let releaseDate = null;
    const albumTitle = trackInfo.album?.title;
    if (albumTitle) {
      try {
        const albumData = await lastfmGet({
          method: 'album.getInfo',
          artist: trackInfo.artist.name,
          album: albumTitle,
          autocorrect: '1'
        });
        
        const releaseDateStr = albumData.album?.wiki?.published || albumData.album?.releasedate;
        if (releaseDateStr && releaseDateStr.trim() !== '') {
          releaseDate = releaseDateStr.trim();
        }
      } catch (error) {
        console.log('Could not fetch album info:', error.message);
      }
    }
    
    // 3. Get artist bio and full artist data
    let artistBio = null;
    let fullArtistData = null;
    try {
      const artistData = await lastfmGet({
        method: 'artist.getInfo',
        artist: trackInfo.artist.name,
        autocorrect: '1'
      });

      fullArtistData = artistData.artist;
      let bio = artistData.artist?.bio?.summary || '';
      // Clean up Last.fm link junk
      bio = bio.split('<a href="https://www.last.fm">')[0].trim();
      artistBio = bio || null;
    } catch (error) {
      console.log('Could not fetch artist info:', error.message);
    }
    
    // 4. Get similar tracks
    let similarTracks = [];
    try {
      const similarData = await lastfmGet({
        method: 'track.getSimilar',
        artist: trackInfo.artist.name,
        track: trackInfo.name,
        limit: '10',
        autocorrect: '1'
      });
      
      let tracks = similarData.similartracks?.track || [];
      // Handle single track case (not array)
      if (!Array.isArray(tracks)) {
        tracks = [tracks];
      }
      
      similarTracks = tracks
        .filter(t => t.name && t.artist?.name)
        .map(t => `${t.name} (${t.artist.name})`);
    } catch (error) {
      console.log('Could not fetch similar tracks:', error.message);
    }
    
    // Extract track wiki summary
    let trackWiki = trackInfo.wiki?.summary || null;
    if (trackWiki) {
      trackWiki = trackWiki.split('<a href')[0].trim();
    }
    
    // Build comprehensive result
    const trackData = {
      name: trackInfo.name,
      artist_name: trackInfo.artist.name,
      artist_mbid: trackInfo.artist.mbid || null,
      artist_url: trackInfo.artist.url || null,
      album_name: albumTitle || null,
      release_date: releaseDate,
      duration_ms: parseInt(trackInfo.duration) || 0,
      lastfm_playcount: parseInt(trackInfo.playcount) || 0,
      lastfm_listeners: parseInt(trackInfo.listeners) || 0,
      lastfm_tags: (trackInfo.toptags?.tag || []).map(t => t.name).slice(0, 10),
      lastfm_track_wiki_summary: trackWiki,
      lastfm_artist_bio_summary: artistBio,
      track_url: trackInfo.url || null,
      similar_tracks: similarTracks,
      musicbrainz_id: trackInfo.mbid || null
    };

    // Save or update artist data
    let savedArtist = null;
    if (fullArtistData) {
      const artistRecord = {
        name: trackInfo.artist.name,
        musicbrainz_id: trackInfo.artist.mbid || null,
        genres: (fullArtistData.tags?.tag || []).map(t => t.name).slice(0, 10),
        image_url: fullArtistData.image?.find(img => img.size === 'large')?.['#text'] || 
                   fullArtistData.image?.find(img => img.size === 'extralarge')?.['#text'] || 
                   null,
        astrological_profile: {
          bio_summary: artistBio,
          bio_full: fullArtistData.bio?.content || null,
          lastfm_url: fullArtistData.url || null,
          listeners: parseInt(fullArtistData.stats?.listeners) || 0,
          playcount: parseInt(fullArtistData.stats?.playcount) || 0,
          similar_artists: (fullArtistData.similar?.artist || []).map(a => a.name).slice(0, 10)
        }
      };

      const existingArtists = await base44.asServiceRole.entities.MusicArtist.filter({
        name: artistRecord.name
      });

      if (existingArtists.length > 0) {
        savedArtist = await base44.asServiceRole.entities.MusicArtist.update(existingArtists[0].id, artistRecord);
      } else {
        savedArtist = await base44.asServiceRole.entities.MusicArtist.create(artistRecord);
      }
    }

    // Check if track already exists
    const existingTracks = await base44.asServiceRole.entities.MusicTrack.filter({
      name: trackData.name,
      artist_name: trackData.artist_name
    });

    let savedTrack;
    if (existingTracks.length > 0) {
      // Update existing track
      try {
        savedTrack = await base44.asServiceRole.entities.MusicTrack.update(existingTracks[0].id, trackData);
        console.log(`Updated MusicTrack: ${savedTrack.id}`);
      } catch (dbError) {
        console.error(`Error updating MusicTrack ${existingTracks[0].id}:`, dbError);
        return Response.json({ error: `Database update failed: ${dbError.message}` }, { status: 500 });
      }
    } else {
      // Create new track
      try {
        savedTrack = await base44.asServiceRole.entities.MusicTrack.create(trackData);
        console.log(`Created MusicTrack: ${savedTrack.id}`);
      } catch (dbError) {
        console.error('Error creating MusicTrack:', dbError);
        return Response.json({ error: `Database creation failed: ${dbError.message}` }, { status: 500 });
      }
    }

    return Response.json({ success: true, data: trackData, savedTrack, savedArtist });

    } catch (error) {
    console.error('Unhandled error in getLastFmTrackInfo:', error);
    return Response.json({ error: error.message }, { status: 500 });
    }
});