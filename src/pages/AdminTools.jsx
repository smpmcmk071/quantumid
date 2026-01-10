import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminTools() {
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [results, setResults] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const user = await base44.auth.me();
    
    if (user.role !== 'admin') {
      alert('Admin access required');
      return;
    }

    const clients = await base44.entities.Client.filter({ admin_email: user.email });
    
    if (clients.length > 0) {
      const c = clients[0];
      setClient(c);
      
      // Load all team members
      const teams = await base44.entities.Team.filter({ client_id: c.id });
      const allMembers = [];
      for (const team of teams) {
        const members = await base44.entities.TeamMember.filter({ team_id: team.id });
        allMembers.push(...members);
      }
      setTeamMembers(allMembers);

      // Load all candidates
      const cands = await base44.entities.Candidate.filter({ client_id: c.id });
      setCandidates(cands);
    }
    setLoading(false);
  };

  const recalculateAll = async () => {
    if (!client) return;

    setRecalculating(true);
    setResults(null);

    try {
      const response = await base44.functions.invoke('recalculateAllProfiles', {
        clientId: client.id
      });

      if (response.data?.success) {
        setResults(response.data.data);
        // Reload data to show updated values
        await loadData();
      } else {
        alert('Error: ' + (response.data?.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setRecalculating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 p-6 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Admin <span className="text-yellow-400">Tools</span></h1>

        {/* Recalculate All Profiles */}
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-teal-400" />
              Recalculate All Profiles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 mb-4">
              This will recalculate numerology and astrological data for all team members and candidates.
              Use this when birthdates have been updated or to ensure all fields are current.
            </p>
            <Button
              onClick={recalculateAll}
              disabled={recalculating}
              className="bg-teal-600 hover:bg-teal-700"
            >
              {recalculating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Recalculating...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Recalculate All
                </>
              )}
            </Button>

            {results && (
              <div className="mt-6 space-y-4">
                <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <h3 className="text-green-300 font-semibold">Recalculation Complete</h3>
                  </div>
                  <p className="text-gray-300 text-sm">
                    Team Members Updated: {results.teamMembers.updated}
                  </p>
                  <p className="text-gray-300 text-sm">
                    Candidates Updated: {results.candidates.updated}
                  </p>
                </div>

                {(results.teamMembers.errors.length > 0 || results.candidates.errors.length > 0) && (
                  <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-red-400" />
                      <h3 className="text-red-300 font-semibold">Errors</h3>
                    </div>
                    {results.teamMembers.errors.map((err, idx) => (
                      <p key={idx} className="text-gray-300 text-sm">
                        Team Member {err.name}: {err.error}
                      </p>
                    ))}
                    {results.candidates.errors.map((err, idx) => (
                      <p key={idx} className="text-gray-300 text-sm">
                        Candidate {err.name}: {err.error}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Show All Team Members with Their Fields */}
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Team Members ({teamMembers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {teamMembers.map(member => (
                <div key={member.id} className="p-3 bg-slate-900 rounded border border-slate-700">
                  <h3 className="text-white font-semibold">{member.full_name}</h3>
                  <p className="text-gray-400 text-sm">Birth Date: {member.birth_date}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-xs">
                    <div>
                      <span className="text-gray-500">LP (West): </span>
                      <span className="text-amber-400">{member.life_path_western || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">LP (Chald): </span>
                      <span className="text-amber-400">{member.life_path_chaldean || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">LP (Chald2): </span>
                      <span className="text-amber-400">{member.life_path_chaldean2 || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Expr (West): </span>
                      <span className="text-purple-400">{member.expression_western || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Expr (Chald): </span>
                      <span className="text-purple-400">{member.expression_chaldean || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Expr (Chald2): </span>
                      <span className="text-purple-400">{member.expression_chaldean2 || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Soul (West): </span>
                      <span className="text-pink-400">{member.soul_urge_western || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Soul (Chald): </span>
                      <span className="text-pink-400">{member.soul_urge_chaldean || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Soul (Chald2): </span>
                      <span className="text-pink-400">{member.soul_urge_chaldean2 || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Pers (West): </span>
                      <span className="text-blue-400">{member.personality_western || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Pers (Chald): </span>
                      <span className="text-blue-400">{member.personality_chaldean || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Pers (Chald2): </span>
                      <span className="text-blue-400">{member.personality_chaldean2 || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Birthday: </span>
                      <span className="text-green-400">{member.birthday_number || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Pyth Total: </span>
                      <span className="text-cyan-400">{member.pythagorean_total || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Chald Total: </span>
                      <span className="text-cyan-400">{member.chaldean_total || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Gematria: </span>
                      <span className="text-indigo-400">{member.gematria_simple || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Master #s: </span>
                      <span className="text-amber-400">{member.master_numbers || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Element: </span>
                      <span className="text-teal-400">{member.element || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Sun: </span>
                      <span className="text-yellow-400">{member.sun_sign || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Moon: </span>
                      <span className="text-blue-300">{member.moon_sign || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Ascendant: </span>
                      <span className="text-purple-300">{member.ascendant || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Chinese: </span>
                      <span className="text-red-400">{member.chinese_zodiac || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Archetype: </span>
                      <span className="text-green-400">{member.archetype_primary || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Show All Candidates with Their Fields */}
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Candidates ({candidates.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {candidates.map(candidate => (
                <div key={candidate.id} className="p-3 bg-slate-900 rounded border border-slate-700">
                  <h3 className="text-white font-semibold">{candidate.full_name}</h3>
                  <p className="text-gray-400 text-sm">Birth Date: {candidate.birth_date}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-xs">
                    <div>
                      <span className="text-gray-500">LP (West): </span>
                      <span className="text-amber-400">{candidate.life_path_western || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">LP (Chald): </span>
                      <span className="text-amber-400">{candidate.life_path_chaldean || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">LP (Chald2): </span>
                      <span className="text-amber-400">{candidate.life_path_chaldean2 || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Expr (West): </span>
                      <span className="text-purple-400">{candidate.expression_western || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Expr (Chald): </span>
                      <span className="text-purple-400">{candidate.expression_chaldean || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Expr (Chald2): </span>
                      <span className="text-purple-400">{candidate.expression_chaldean2 || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Soul (West): </span>
                      <span className="text-pink-400">{candidate.soul_urge_western || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Soul (Chald): </span>
                      <span className="text-pink-400">{candidate.soul_urge_chaldean || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Soul (Chald2): </span>
                      <span className="text-pink-400">{candidate.soul_urge_chaldean2 || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Pers (West): </span>
                      <span className="text-blue-400">{candidate.personality_western || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Pers (Chald): </span>
                      <span className="text-blue-400">{candidate.personality_chaldean || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Pers (Chald2): </span>
                      <span className="text-blue-400">{candidate.personality_chaldean2 || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Birthday: </span>
                      <span className="text-green-400">{candidate.birthday_number || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Pyth Total: </span>
                      <span className="text-cyan-400">{candidate.pythagorean_total || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Chald Total: </span>
                      <span className="text-cyan-400">{candidate.chaldean_total || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Gematria: </span>
                      <span className="text-indigo-400">{candidate.gematria_simple || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Master #s: </span>
                      <span className="text-amber-400">{candidate.master_numbers || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Element: </span>
                      <span className="text-teal-400">{candidate.element || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Sun: </span>
                      <span className="text-yellow-400">{candidate.sun_sign || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Moon: </span>
                      <span className="text-blue-300">{candidate.moon_sign || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Ascendant: </span>
                      <span className="text-purple-300">{candidate.ascendant || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Chinese: </span>
                      <span className="text-red-400">{candidate.chinese_zodiac || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Archetype: </span>
                      <span className="text-green-400">{candidate.archetype_primary || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}