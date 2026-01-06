import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, Users, TrendingUp, Target, AlertCircle } from 'lucide-react';

export default function Analyzer() {
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [building, setBuilding] = useState(false);
  const [teamSize, setTeamSize] = useState(3);
  const [numberOfTeams, setNumberOfTeams] = useState(1);
  const [task, setTask] = useState('');
  const [result, setResult] = useState(null);
  const [totalMembers, setTotalMembers] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const user = await base44.auth.me();
    const clients = await base44.entities.Client.filter({ admin_email: user.email });
    
    if (clients.length > 0) {
      const c = clients[0];
      setClient(c);
      
      // Count total members
      const teams = await base44.entities.Team.filter({ client_id: c.id });
      const allMembers = await Promise.all(
        teams.map(t => base44.entities.TeamMember.filter({ team_id: t.id }))
      );
      setTotalMembers(allMembers.flat().length);
    }
    setLoading(false);
  };

  const buildTeams = async () => {
    if (!client) return;
    
    setBuilding(true);
    const response = await base44.functions.invoke('buildOptimalTeams', {
      clientId: client.id,
      teamSize: parseInt(teamSize),
      numberOfTeams: parseInt(numberOfTeams),
      task: task || null
    });
    
    if (response.data?.success) {
      setResult(response.data.data);
    }
    setBuilding(false);
  };

  const getArchetypeColor = (archetype) => {
    const colors = {
      visionary: 'text-amber-400 bg-amber-500/20',
      strategist: 'text-blue-400 bg-blue-500/20',
      creator: 'text-purple-400 bg-purple-500/20',
      harmonizer: 'text-green-400 bg-green-500/20'
    };
    return colors[archetype] || 'text-gray-400 bg-gray-500/20';
  };

  const getArchetypeIcon = (archetype) => {
    const icons = {
      visionary: '🎯',
      strategist: '🧠',
      creator: '💡',
      harmonizer: '🤝'
    };
    return icons[archetype] || '👤';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  const maxTeams = Math.floor(totalMembers / teamSize);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">AI Team Builder</h1>
          <p className="text-gray-300">Build optimal teams using behavioral science & team research</p>
        </div>

        {/* Team Builder Config */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" />
              Configure Teams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-gray-300 text-sm mb-2 block">Team Size</label>
                <Input
                  type="number"
                  min="2"
                  max="10"
                  value={teamSize}
                  onChange={(e) => setTeamSize(e.target.value)}
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="text-gray-300 text-sm mb-2 block">Number of Teams</label>
                <Input
                  type="number"
                  min="1"
                  max={maxTeams}
                  value={numberOfTeams}
                  onChange={(e) => setNumberOfTeams(e.target.value)}
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="text-gray-300 text-sm mb-2 block">Total People Needed</label>
                <div className="h-10 flex items-center px-3 bg-slate-900 border border-slate-700 rounded-md">
                  <span className="text-white font-bold">{teamSize * numberOfTeams}</span>
                  <span className="text-gray-400 ml-2">/ {totalMembers} available</span>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="text-gray-300 text-sm mb-2 block">Task/Goal (Optional)</label>
              <Textarea
                placeholder="e.g., Build a new product feature, Run a marketing campaign..."
                value={task}
                onChange={(e) => setTask(e.target.value)}
                className="bg-slate-900 border-slate-700 text-white h-20"
              />
            </div>

            {teamSize * numberOfTeams > totalMembers && (
              <div className="p-3 bg-orange-500/20 rounded-lg border border-orange-500/30 mb-4">
                <div className="flex items-center gap-2 text-orange-300 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  Not enough members. Need {teamSize * numberOfTeams - totalMembers} more people.
                </div>
              </div>
            )}

            <Button
              onClick={buildTeams}
              disabled={building || teamSize * numberOfTeams > totalMembers}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {building ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Building Optimal Teams...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Build Teams with AI
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Overall Analysis */}
            <Card className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Overall Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-200">{result.overallAnalysis}</p>
              </CardContent>
            </Card>

            {/* Teams */}
            {result.teams?.map((team, idx) => (
              <Card key={idx} className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-400" />
                      Team {team.teamNumber}
                    </CardTitle>
                    <div className="flex gap-2">
                      {Object.entries(team.archetypeBalance || {}).map(([arch, count]) => (
                        count > 0 && (
                          <span key={arch} className={`px-2 py-1 rounded text-xs ${getArchetypeColor(arch)}`}>
                            {getArchetypeIcon(arch)} {count}
                          </span>
                        )
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm mt-2">{team.teamSummary}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {team.members?.map((member, mIdx) => (
                      <div key={mIdx} className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-white font-semibold">{member.name}</h3>
                              <span className={`px-2 py-0.5 rounded text-xs ${getArchetypeColor(member.archetype)}`}>
                                {getArchetypeIcon(member.archetype)} {member.archetype}
                              </span>
                            </div>
                            <p className="text-amber-400 text-sm font-medium mb-1">→ {member.assignedRole}</p>
                            <p className="text-gray-300 text-sm">Life Path {member.lifePath}</p>
                          </div>
                        </div>
                        <p className="text-gray-400 text-sm">{member.reasoning}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!result && !building && (
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="py-12 text-center">
              <Sparkles className="w-16 h-16 text-purple-500 mx-auto mb-4" />
              <h3 className="text-white text-xl font-semibold mb-2">Ready to Build Teams</h3>
              <p className="text-gray-400">Configure your team size and click Build Teams to get AI-powered recommendations</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}