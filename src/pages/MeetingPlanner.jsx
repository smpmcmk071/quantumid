import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Loader2, Star, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function MeetingPlanner() {
  const [client, setClient] = useState(null);
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [dateRange, setDateRange] = useState('7');
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const user = await base44.auth.me();
    const clients = await base44.entities.Client.filter({ admin_email: user.email });
    
    if (clients.length > 0) {
      const c = clients[0];
      setClient(c);
      const t = await base44.entities.Team.filter({ client_id: c.id });
      setTeams(t);
    }
  };

  const analyzeDates = async () => {
    if (!selectedTeam) return;
    
    setAnalyzing(true);
    const startDate = new Date().toISOString().split('T')[0];
    const endDate = new Date(Date.now() + parseInt(dateRange) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const response = await base44.functions.invoke('analyzeMeetingDates', {
      teamId: selectedTeam,
      startDate,
      endDate
    });

    if (response.data?.success) {
      setResults(response.data.data);
    }
    setAnalyzing(false);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400 bg-green-500/20';
    if (score >= 60) return 'text-yellow-400 bg-yellow-500/20';
    return 'text-red-400 bg-red-500/20';
  };

  const getUniversalDayDescription = (num) => {
    const descriptions = {
      1: 'Leadership & New Beginnings',
      2: 'Collaboration & Partnership',
      3: 'Creativity & Communication',
      4: 'Structure & Planning',
      5: 'Change & Adaptability',
      6: 'Harmony & Teamwork',
      7: 'Analysis & Strategy',
      8: 'Achievement & Results',
      9: 'Completion & Compassion'
    };
    return descriptions[num] || '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="w-8 h-8 text-teal-400" />
          <h1 className="text-3xl font-bold text-white">Meeting Planner</h1>
        </div>
        
        <p className="text-gray-300 mb-8">
          Find the best dates for team meetings based on Universal Day Numbers and team member Personal Day compatibility.
        </p>

        {/* Configuration */}
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Configure Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-gray-300 text-sm mb-2 block">Select Team</label>
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                  <SelectValue placeholder="Choose a team..." />
                </SelectTrigger>
                <SelectContent>
                  {teams.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.team_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-gray-300 text-sm mb-2 block">Date Range</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Next 7 Days</SelectItem>
                  <SelectItem value="14">Next 2 Weeks</SelectItem>
                  <SelectItem value="30">Next 30 Days</SelectItem>
                  <SelectItem value="60">Next 60 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={analyzeDates}
              disabled={analyzing || !selectedTeam}
              className="w-full bg-teal-600 hover:bg-teal-700"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing Dates...
                </>
              ) : (
                <>
                  <Star className="w-4 h-4 mr-2" />
                  Find Best Meeting Dates
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {results && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-4">Recommended Meeting Dates</h2>
            {results.rankedDates?.map((date, idx) => (
              <Card key={idx} className="bg-slate-800/50 backdrop-blur-sm border-slate-700 hover:border-teal-600 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-white">
                          {new Date(date.date + 'T00:00:00').toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </h3>
                        <span className={`px-3 py-1 rounded-lg font-bold ${getScoreColor(date.score)}`}>
                          {date.score}/100
                        </span>
                      </div>
                      <p className="text-teal-400 text-sm">
                        Universal Day {date.universalDay}: {getUniversalDayDescription(date.universalDay)}
                      </p>
                    </div>
                    {idx === 0 && date.score >= 80 && (
                      <Star className="w-8 h-8 text-amber-400 fill-amber-400" />
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        <span className="text-green-300 font-medium text-sm">Why This Date Works:</span>
                      </div>
                      <p className="text-gray-300 text-sm ml-6">{date.reasoning}</p>
                    </div>

                    {date.bestFor && (
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Star className="w-4 h-4 text-amber-400" />
                          <span className="text-amber-300 font-medium text-sm">Best For:</span>
                        </div>
                        <p className="text-gray-300 text-sm ml-6">{date.bestFor}</p>
                      </div>
                    )}

                    {date.avoid && (
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <AlertCircle className="w-4 h-4 text-red-400" />
                          <span className="text-red-300 font-medium text-sm">Caution:</span>
                        </div>
                        <p className="text-gray-300 text-sm ml-6">{date.avoid}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!results && !analyzing && (
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
            <CardContent className="py-12 text-center">
              <Calendar className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">Select a team and date range to find optimal meeting dates</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}