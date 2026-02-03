import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Music, Search, Star, Sparkles, Plus, RefreshCw, Database } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { createPageUrl } from '../utils';
import { Link } from 'react-router-dom';

export default function MusicDiscovery() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchArtist, setSearchArtist] = useState('');
  const [searchTrack, setSearchTrack] = useState('');
  const [trackInfo, setTrackInfo] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [testResult, setTestResult] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [inserting, setInserting] = useState(false);

  useEffect(() => {
    loadProfile();
    loadRecommendations();
    loadTracks();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const user = await base44.auth.me();
      if (!user) {
        base44.auth.redirectToLogin();
        return;
      }

      const profiles = await base44.entities.UserMusicProfile.filter({ user_id: user.id });
      if (profiles.length === 0) {
        window.location.href = createPageUrl('UserMusicProfileSetup');
        return;
      }
      setProfile(profiles[0]);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecommendations = async () => {
    try {
      const recs = await base44.entities.MusicRecommendation.list('-match_score', 20);
      setRecommendations(recs);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
  };

  const loadTracks = async () => {
    try {
      const allTracks = await base44.entities.MusicTrack.list('-created_date', 50);
      setTracks(allTracks);
    } catch (error) {
      console.error('Error loading tracks:', error);
    }
  };

  const handleInsertSampleTrack = async () => {
    setInserting(true);
    try {
      const response = await base44.functions.invoke('getLastFmTrackInfo', {
        artist: 'The Beatles',
        track: 'Here Comes the Sun'
      });

      if (response.data?.error) {
        alert('Error: ' + response.data.error);
      } else {
        alert('Track inserted successfully!');
        await loadTracks();
      }
    } catch (error) {
      alert('Error inserting track: ' + error.message);
    } finally {
      setInserting(false);
    }
  };

  const handleTestFunction = async () => {
    if (!searchArtist || !searchTrack) {
      alert('Please enter both artist and track name');
      return;
    }

    setSearching(true);
    setTestResult(null);
    try {
      const response = await base44.functions.invoke('getLastFmTrackInfo', {
        artist: searchArtist,
        track: searchTrack
      });

      setTestResult(response.data);
      await loadTracks();
    } catch (error) {
      setTestResult({ error: error.message });
    } finally {
      setSearching(false);
    }
  };

  const handleSearch = async () => {
    if (!searchArtist || !searchTrack) {
      alert('Please enter both artist and track name');
      return;
    }

    setSearching(true);
    try {
      // Get track info from Last.fm
      const trackResponse = await base44.functions.invoke('getLastFmTrackInfo', {
        artist: searchArtist,
        track: searchTrack
      });

      if (!trackResponse.data?.success) {
        alert('Track not found on Last.fm');
        setSearching(false);
        return;
      }

      const trackData = trackResponse.data.data;
      setTrackInfo(trackData);

      // Save or update track in database
      const existingTracks = await base44.entities.MusicTrack.filter({ 
        artist_name: trackData.artist,
        name: trackData.name
      });

      let trackId;
      if (existingTracks.length > 0) {
        trackId = existingTracks[0].id;
      } else {
        // Calculate numerology for track
        const numerologyResponse = await base44.functions.invoke('calculateTrackNumerology', {
          artist_name: trackData.artist,
          album_name: trackData.album,
          name: trackData.name,
          release_date: '2020-01-01',
          release_year: 2020,
          key: 0,
          tempo: 120,
          energy: 0.7,
          valence: 0.6
        });

        const trackRecord = {
          name: trackData.name,
          artist_name: trackData.artist,
          album_name: trackData.album,
          duration_ms: trackData.duration_ms,
          lastfm_playcount: trackData.playcount,
          lastfm_listeners: trackData.listeners,
          lastfm_tags: trackData.tags,
          ...numerologyResponse.data?.data
        };

        const created = await base44.entities.MusicTrack.create(trackRecord);
        trackId = created.id;
      }

      // Calculate match score
      const matchResponse = await base44.functions.invoke('calculateMusicMatchScore', {
        userProfileId: profile.id,
        trackId: trackId
      });

      if (matchResponse.data?.success) {
        const matchData = matchResponse.data.data;
        
        // Create recommendation
        await base44.entities.MusicRecommendation.create({
          user_music_profile_id: profile.id,
          music_track_id: trackId,
          match_score: matchData.match_score,
          match_reasons: matchData.match_reasons,
          match_zodiac: matchData.match_zodiac,
          match_planet_influence: matchData.match_planet_influence,
          match_house_position: matchData.match_house_position
        });

        await loadRecommendations();
        alert(`Match Score: ${Math.round(matchData.match_score * 100)}%`);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setSearching(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-300" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <Music className="w-8 h-8 text-purple-400" />
              Music Discovery
            </h1>
            <p className="text-purple-200 mt-2">Find music aligned with your cosmic energy</p>
          </div>
          <Link to={createPageUrl('UserMusicProfileSetup')}>
            <Button variant="outline" className="border-purple-500/30 text-purple-200">
              Edit Profile
            </Button>
          </Link>
        </div>

        {/* Search Section */}
        <Card className="bg-slate-900/50 backdrop-blur-sm border-purple-500/30 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Search className="w-5 h-5" />
              Test getLastFmTrackInfo Function
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <Input
                placeholder="Artist name"
                value={searchArtist}
                onChange={(e) => setSearchArtist(e.target.value)}
                className="bg-slate-800 border-purple-500/30 text-white"
              />
              <Input
                placeholder="Track name"
                value={searchTrack}
                onChange={(e) => setSearchTrack(e.target.value)}
                className="bg-slate-800 border-purple-500/30 text-white"
              />
              <Button
                onClick={handleTestFunction}
                disabled={searching}
                className="bg-gradient-to-r from-purple-600 to-pink-600"
              >
                {searching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Test'
                )}
              </Button>
            </div>

            {testResult && (
              <div className="p-4 bg-slate-800 rounded-lg border border-purple-500/20 overflow-auto max-h-96">
                <pre className="text-purple-200 text-xs">
                  {JSON.stringify(testResult, null, 2)}
                </pre>
              </div>
            )}

          </CardContent>
        </Card>

        {/* Tracks Database */}
        <Card className="bg-slate-900/50 backdrop-blur-sm border-purple-500/30 mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Database className="w-5 h-5" />
                Music Tracks in Database ({tracks.length})
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  onClick={handleInsertSampleTrack}
                  disabled={inserting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {inserting ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Insert Sample Track
                </Button>
                <Button
                  onClick={loadTracks}
                  variant="outline"
                  className="border-purple-500/30 text-purple-200"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {tracks.length === 0 ? (
              <div className="text-center py-8">
                <Music className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                <p className="text-purple-200">No tracks in database yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-purple-500/30 hover:bg-slate-800/50">
                      <TableHead className="text-purple-300">Track</TableHead>
                      <TableHead className="text-purple-300">Artist</TableHead>
                      <TableHead className="text-purple-300">Album</TableHead>
                      <TableHead className="text-purple-300">Playcount</TableHead>
                      <TableHead className="text-purple-300">Listeners</TableHead>
                      <TableHead className="text-purple-300">Tags</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tracks.map((track) => (
                      <TableRow key={track.id} className="border-purple-500/20 hover:bg-slate-800/50">
                        <TableCell className="text-white font-medium">{track.name}</TableCell>
                        <TableCell className="text-purple-200">{track.artist_name}</TableCell>
                        <TableCell className="text-purple-200">{track.album_name || '-'}</TableCell>
                        <TableCell className="text-purple-200">{track.lastfm_playcount?.toLocaleString() || '0'}</TableCell>
                        <TableCell className="text-purple-200">{track.lastfm_listeners?.toLocaleString() || '0'}</TableCell>
                        <TableCell className="text-purple-200 max-w-xs truncate text-xs">
                          {track.lastfm_tags?.slice(0, 3).join(', ') || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recommendations */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-400" />
            Your Cosmic Matches
          </h2>
          <div className="grid gap-4">
            {recommendations.map((rec) => (
              <Card key={rec.id} className="bg-slate-900/50 backdrop-blur-sm border-purple-500/30">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Star className="w-5 h-5 text-yellow-400" />
                        <span className="text-2xl font-bold text-purple-300">
                          {Math.round(rec.match_score * 100)}%
                        </span>
                      </div>
                      <div className="space-y-1">
                        {rec.match_reasons?.map((reason, idx) => (
                          <p key={idx} className="text-purple-200 text-sm">• {reason}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {recommendations.length === 0 && (
              <Card className="bg-slate-900/50 backdrop-blur-sm border-purple-500/30">
                <CardContent className="py-12 text-center">
                  <Music className="w-16 h-16 text-purple-500 mx-auto mb-4" />
                  <p className="text-purple-200">No recommendations yet. Search for music above to get started!</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}