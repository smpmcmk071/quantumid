import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Briefcase, Plus, Loader2, Target, TrendingUp, CheckCircle } from 'lucide-react';

export default function JobPostings() {
  const [client, setClient] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [matchedCandidates, setMatchedCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [showAddJob, setShowAddJob] = useState(false);

  const [newJob, setNewJob] = useState({
    job_title: '',
    description: '',
    required_skills: '',
    preferred_skills: '',
    seniority: 'mid',
    team_id: '',
    ideal_numerology: ''
  });

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
      const j = await base44.entities.JobPosting.filter({ client_id: c.id });
      const t = await base44.entities.Team.filter({ client_id: c.id });
      const cands = await base44.entities.Candidate.filter({ client_id: c.id });
      setJobs(j);
      setTeams(t);
      setCandidates(cands);
    }
    setLoading(false);
  };

  const createJob = async () => {
    if (!client || !newJob.job_title) return;
    await base44.entities.JobPosting.create({ ...newJob, client_id: client.id, status: 'open' });
    setNewJob({ job_title: '', description: '', required_skills: '', preferred_skills: '', seniority: 'mid', team_id: '', ideal_numerology: '' });
    setShowAddJob(false);
    loadData();
  };

  const matchCandidates = async (job) => {
    setSelectedJob(job);
    setMatching(true);
    
    const response = await base44.functions.invoke('matchCandidatesToJob', {
      jobId: job.id,
      clientId: client.id
    });
    
    if (response.data?.success) {
      setMatchedCandidates(response.data.data);
    }
    setMatching(false);
  };

  const getStatusColor = (status) => {
    return status === 'open' ? 'bg-teal-500/20 text-teal-300' : 'bg-slate-500/20 text-slate-400';
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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">Job Postings</h1>
          <Dialog open={showAddJob} onOpenChange={setShowAddJob}>
            <DialogTrigger asChild>
              <Button className="bg-teal-600 hover:bg-teal-700">
                <Plus className="w-4 h-4 mr-2" />
                New Job Posting
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-white">Create Job Posting</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Job Title *"
                  value={newJob.job_title}
                  onChange={(e) => setNewJob({ ...newJob, job_title: e.target.value })}
                  className="bg-slate-900 border-slate-700 text-white"
                />
                <Textarea
                  placeholder="Job Description"
                  value={newJob.description}
                  onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                  className="bg-slate-900 border-slate-700 text-white h-24"
                />
                <Input
                  placeholder="Required Skills (comma-separated)"
                  value={newJob.required_skills}
                  onChange={(e) => setNewJob({ ...newJob, required_skills: e.target.value })}
                  className="bg-slate-900 border-slate-700 text-white"
                />
                <Select value={newJob.team_id} onValueChange={(v) => setNewJob({ ...newJob, team_id: v })}>
                  <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                    <SelectValue placeholder="Select Team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.team_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={newJob.seniority} onValueChange={(v) => setNewJob({ ...newJob, seniority: v })}>
                  <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="junior">Junior</SelectItem>
                    <SelectItem value="mid">Mid-Level</SelectItem>
                    <SelectItem value="senior">Senior</SelectItem>
                    <SelectItem value="lead">Lead</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={createJob} className="w-full bg-teal-600 hover:bg-teal-700">
                  Create Job Posting
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Job Listings */}
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">Open Positions ({jobs.filter(j => j.status === 'open').length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
              {jobs.filter(j => j.status === 'open').map(job => (
                <div
                  key={job.id}
                  onClick={() => matchCandidates(job)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedJob?.id === job.id
                      ? 'bg-teal-600 text-white'
                      : 'bg-slate-700/50 text-gray-300 hover:bg-slate-700'
                  }`}
                >
                  <p className="font-semibold">{job.job_title}</p>
                  <p className="text-xs opacity-75">{job.seniority}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Matched Candidates */}
          <div className="lg:col-span-2">
            {selectedJob ? (
              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white">{selectedJob.job_title}</CardTitle>
                      <p className="text-gray-400 text-sm mt-1">{selectedJob.required_skills}</p>
                    </div>
                    {matching && <Loader2 className="w-5 h-5 animate-spin text-teal-400" />}
                  </div>
                </CardHeader>
                <CardContent>
                  {matching ? (
                    <div className="text-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-teal-400 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">Analyzing candidates...</p>
                    </div>
                  ) : matchedCandidates.length > 0 ? (
                    <div className="space-y-3">
                      {matchedCandidates.map((match, idx) => (
                        <div key={idx} className="p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-white font-semibold">{match.name}</h3>
                                {idx === 0 && <span className="px-2 py-0.5 bg-teal-500/20 text-teal-300 rounded text-xs">Top Match</span>}
                              </div>
                              <div className="flex gap-2 mb-2">
                                <span className="text-teal-400 text-sm font-bold">{match.overallScore}%</span>
                                <span className="text-gray-400 text-sm">Match Score</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500">Skills: {match.skillScore}%</p>
                              <p className="text-xs text-gray-500">Numerology: {match.numerologyScore}%</p>
                            </div>
                          </div>
                          <p className="text-gray-300 text-sm">{match.reasoning}</p>
                          {match.matchedSkills && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {match.matchedSkills.split(',').map((skill, i) => (
                                <span key={i} className="px-2 py-0.5 bg-teal-500/10 text-teal-300 rounded text-xs">
                                  <CheckCircle className="w-3 h-3 inline mr-1" />
                                  {skill.trim()}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Target className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                      <p className="text-gray-400">No candidates analyzed yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
                <CardContent className="py-12 text-center">
                  <Briefcase className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Select a job posting to see matched candidates</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}