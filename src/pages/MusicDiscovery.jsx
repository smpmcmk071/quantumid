import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Music, Search, Star, Sparkles } from 'lucide-react';
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

  useEffect(() => {
    loadProfile();
    loadRecommendations();
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