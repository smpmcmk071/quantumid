import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, TrendingUp, Users, Briefcase, Target, CheckCircle, AlertCircle } from 'lucide-react';

export default function CompatibilityReport() {
  const [client, setClient] = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRecommendation, setFilterRecommendation] = useState('all');

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
      const allAnalyses = await base44.entities.CompatibilityAnalysis.filter({ client_id: c.id }, '-created_date');
      
      // Enrich with candidate, team, and job names
      const enriched = await Promise.all(allAnalyses.map(async (analysis) => {
        const candidate = await base44.entities.Candidate.get(analysis.candidate_id);
        const team = analysis.team_id ? await base44.entities.Team.get(analysis.team_id) : null;
        const job = analysis.job_posting_id ? await base44.entities.JobPosting.get(analysis.job_posting_id) : null;
        
        return {
          ...analysis,
          candidateName: candidate.full_name,
          teamName: team?.team_name || 'N/A',
          jobTitle: job?.job_title || 'N/A'
        };
      }));
      
      setAnalyses(enriched);
    }
    setLoading(false);
  };

  const getRecommendationColor = (rec) => {
    const colors = {
      strongly_recommend: 'bg-green-500/20 text-green-300 border-green-500',
      recommend: 'bg-blue-500/20 text-blue-300 border-blue-500',
      consider: 'bg-yellow-500/20 text-yellow-300 border-yellow-500',
      not_recommended: 'bg-red-500/20 text-red-300 border-red-500'
    };
    return colors[rec] || 'bg-gray-500/20 text-gray-300 border-gray-500';
  };

  const getRecommendationIcon = (rec) => {
    if (rec === 'strongly_recommend' || rec === 'recommend') return <CheckCircle className="w-4 h-4" />;
    return <AlertCircle className="w-4 h-4" />;
  };

  const filteredAnalyses = filterRecommendation === 'all' 
    ? analyses 
    : analyses.filter(a => a.recommendation === filterRecommendation);

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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Compatibility Analysis Report</h1>
            <p className="text-gray-400 mt-1">{analyses.length} total analyses</p>
          </div>
          <Select value={filterRecommendation} onValueChange={setFilterRecommendation}>
            <SelectTrigger className="bg-slate-900 border-slate-700 text-white w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Recommendations</SelectItem>
              <SelectItem value="strongly_recommend">Strongly Recommend</SelectItem>
              <SelectItem value="recommend">Recommend</SelectItem>
              <SelectItem value="consider">Consider</SelectItem>
              <SelectItem value="not_recommended">Not Recommended</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredAnalyses.length === 0 ? (
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
            <CardContent className="py-12 text-center">
              <Target className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No compatibility analyses yet. Run analyses from the Candidates page.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredAnalyses.map(analysis => (
              <Card key={analysis.id} className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-white text-xl mb-2">{analysis.candidateName}</CardTitle>
                      <div className="flex gap-3 text-sm text-gray-400">
                        {analysis.teamName !== 'N/A' && (
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {analysis.teamName}
                          </div>
                        )}
                        {analysis.jobTitle !== 'N/A' && (
                          <div className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4" />
                            {analysis.jobTitle}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={`px-3 py-2 rounded-lg border flex items-center gap-2 ${getRecommendationColor(analysis.recommendation)}`}>
                      {getRecommendationIcon(analysis.recommendation)}
                      <span className="font-semibold capitalize">
                        {analysis.recommendation.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Scores */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white mb-1">{analysis.overall_score}</div>
                      <div className="text-gray-400 text-xs">Overall</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400 mb-1">{analysis.team_fit_score}</div>
                      <div className="text-gray-400 text-xs">Team Fit</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400 mb-1">{analysis.job_fit_score}</div>
                      <div className="text-gray-400 text-xs">Job Fit</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-amber-400 mb-1">{analysis.numerology_score}</div>
                      <div className="text-gray-400 text-xs">Numerology</div>
                    </div>
                  </div>

                  {/* Explanations */}
                  <div className="grid md:grid-cols-3 gap-3">
                    {analysis.team_fit_explanation && (
                      <div className="p-3 bg-blue-500/10 rounded border border-blue-500/20">
                        <p className="text-blue-300 text-sm font-medium mb-1">Team Fit</p>
                        <p className="text-gray-300 text-xs">{analysis.team_fit_explanation}</p>
                      </div>
                    )}
                    {analysis.job_fit_explanation && (
                      <div className="p-3 bg-purple-500/10 rounded border border-purple-500/20">
                        <p className="text-purple-300 text-sm font-medium mb-1">Job Fit</p>
                        <p className="text-gray-300 text-xs">{analysis.job_fit_explanation}</p>
                      </div>
                    )}
                    {analysis.numerology_explanation && (
                      <div className="p-3 bg-amber-500/10 rounded border border-amber-500/20">
                        <p className="text-amber-300 text-sm font-medium mb-1">Numerology</p>
                        <p className="text-gray-300 text-xs">{analysis.numerology_explanation}</p>
                      </div>
                    )}
                  </div>

                  {/* Strengths & Concerns */}
                  <div className="grid md:grid-cols-2 gap-3">
                    {analysis.strengths && (
                      <div className="p-3 bg-green-500/10 rounded border border-green-500/20">
                        <p className="text-green-300 text-sm font-medium mb-2 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          Strengths
                        </p>
                        <p className="text-gray-300 text-sm whitespace-pre-line">{analysis.strengths}</p>
                      </div>
                    )}
                    {analysis.concerns && (
                      <div className="p-3 bg-orange-500/10 rounded border border-orange-500/20">
                        <p className="text-orange-300 text-sm font-medium mb-2 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          Concerns
                        </p>
                        <p className="text-gray-300 text-sm whitespace-pre-line">{analysis.concerns}</p>
                      </div>
                    )}
                  </div>

                  <div className="text-gray-500 text-xs text-right">
                    Analyzed on {new Date(analysis.created_date).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}