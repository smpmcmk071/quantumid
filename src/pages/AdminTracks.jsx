import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Music, RefreshCw, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function AdminTracks() {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadTracks();
  }, []);

  const loadTracks = async () => {
    setLoading(true);
    try {
      const allTracks = await base44.entities.MusicTrack.list('-created_date', 100);
      setTracks(allTracks);
    } catch (error) {
      console.error('Error loading tracks:', error);
      alert('Error loading tracks: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTracks();
    setRefreshing(false);
  };

  const handleDelete = async (trackId) => {
    if (!confirm('Delete this track?')) return;
    
    try {
      await base44.entities.MusicTrack.delete(trackId);
      await loadTracks();
    } catch (error) {
      alert('Error deleting track: ' + error.message);
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <Music className="w-8 h-8 text-purple-400" />
              Music Tracks Database
            </h1>
            <p className="text-purple-200 mt-2">Total tracks: {tracks.length}</p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {refreshing ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>

        <Card className="bg-slate-900/50 backdrop-blur-sm border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white">All Music Tracks</CardTitle>
          </CardHeader>
          <CardContent>
            {tracks.length === 0 ? (
              <div className="text-center py-12">
                <Music className="w-16 h-16 text-purple-500 mx-auto mb-4" />
                <p className="text-purple-200">No tracks in database yet.</p>
                <p className="text-purple-300 text-sm mt-2">Use the Music Discovery page to test and add tracks.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-purple-500/30 hover:bg-slate-800/50">
                      <TableHead className="text-purple-300">Track Name</TableHead>
                      <TableHead className="text-purple-300">Artist</TableHead>
                      <TableHead className="text-purple-300">Album</TableHead>
                      <TableHead className="text-purple-300">Release Date</TableHead>
                      <TableHead className="text-purple-300">Duration</TableHead>
                      <TableHead className="text-purple-300">Playcount</TableHead>
                      <TableHead className="text-purple-300">Listeners</TableHead>
                      <TableHead className="text-purple-300">Tags</TableHead>
                      <TableHead className="text-purple-300">MusicBrainz ID</TableHead>
                      <TableHead className="text-purple-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tracks.map((track) => (
                      <TableRow key={track.id} className="border-purple-500/20 hover:bg-slate-800/50">
                        <TableCell className="text-white font-medium">{track.name}</TableCell>
                        <TableCell className="text-purple-200">{track.artist_name}</TableCell>
                        <TableCell className="text-purple-200">{track.album_name || '-'}</TableCell>
                        <TableCell className="text-purple-200">{track.release_date || '-'}</TableCell>
                        <TableCell className="text-purple-200">
                          {track.duration_ms ? `${Math.floor(track.duration_ms / 1000 / 60)}:${String(Math.floor((track.duration_ms / 1000) % 60)).padStart(2, '0')}` : '-'}
                        </TableCell>
                        <TableCell className="text-purple-200">{track.lastfm_playcount?.toLocaleString() || '-'}</TableCell>
                        <TableCell className="text-purple-200">{track.lastfm_listeners?.toLocaleString() || '-'}</TableCell>
                        <TableCell className="text-purple-200 max-w-xs truncate">
                          {track.lastfm_tags?.join(', ') || '-'}
                        </TableCell>
                        <TableCell className="text-purple-200 text-xs">{track.musicbrainz_id || '-'}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(track.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}