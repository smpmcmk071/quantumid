import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Loader2, Upload, Trash2 } from 'lucide-react';

export default function Candidates() {
  const [client, setClient] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [calculating, setCalculating] = useState(false);

  const [newCandidate, setNewCandidate] = useState({
    full_name: '',
    email: '',
    birth_date: '',
    resume_text: '',
    status: 'new'
  });
  const [jobs, setJobs] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [matchedJobs, setMatchedJobs] = useState([]);
  const [matchingJobs, setMatchingJobs] = useState(false);

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
      const cands = await base44.entities.Candidate.filter({ client_id: c.id });
      const j = await base44.entities.JobPosting.filter({ client_id: c.id, status: 'open' });
      setCandidates(cands);
      setJobs(j);
    }
    setLoading(false);
  };

  const matchJobsForCandidate = async (candidate) => {
    setSelectedCandidate(candidate);
    setMatchingJobs(true);
    
    const response = await base44.functions.invoke('matchJobsToCandidate', {
      candidateId: candidate.id,
      clientId: client.id
    });
    
    if (response.data?.success) {
      setMatchedJobs(response.data.data);
    }
    setMatchingJobs(false);
  };

  const parseResume = async () => {
    if (!newCandidate.resume_text) return;
    
    setParsing(true);
    const response = await base44.functions.invoke('parseResume', {
      resumeText: newCandidate.resume_text
    });
    
    if (response.data?.success) {
      const data = response.data.data;
      setNewCandidate({
        ...newCandidate,
        full_name: data.full_name || newCandidate.full_name,
        email: data.email || newCandidate.email,
        extracted_skills: data.extracted_skills,
        years_experience: data.years_experience,
        education: data.education,
        previous_roles: data.previous_roles
      });
    }
    setParsing(false);
  };

  const addCandidate = async () => {
    if (!client || !newCandidate.full_name || !newCandidate.birth_date) return;
    
    setCalculating(true);
    
    // Calculate numerology
    const response = await base44.functions.invoke('calculateNumerology', {
      type: 'name',
      name: newCandidate.full_name,
      birthDate: newCandidate.birth_date
    });

    if (response.data?.success) {
      const calc = response.data.data;
      await base44.entities.Candidate.create({
        client_id: client.id,
        full_name: newCandidate.full_name,
        email: newCandidate.email,
        birth_date: newCandidate.birth_date,
        resume_text: newCandidate.resume_text,
        extracted_skills: newCandidate.extracted_skills || '',
        years_experience: newCandidate.years_experience || 0,
        education: newCandidate.education || '',
        previous_roles: newCandidate.previous_roles || '',
        status: newCandidate.status,
        life_path_western: calc.lifePathWestern,
        life_path_chaldean: calc.lifePathChaldean,
        expression_western: calc.expressionWestern,
        soul_urge_western: calc.soulUrgeWestern,
        personality_western: calc.personalityWestern,
        birthday_number: calc.birthdayNumber,
        master_numbers: calc.masterNumbers?.join(', ') || '',
        element: calc.element
      });
      
      setNewCandidate({
        full_name: '',
        email: '',
        birth_date: '',
        resume_text: '',
        status: 'new'
      });
      setShowAddCandidate(false);
      loadData();
    }
    
    setCalculating(false);
  };

  const deleteCandidate = async (candidateId) => {
    if (!confirm('Delete this candidate?')) return;
    await base44.entities.Candidate.delete(candidateId);
    loadData();
  };

  const updateStatus = async (candidateId, status) => {
    await base44.entities.Candidate.update(candidateId, { status });
    loadData();
  };

  const getStatusColor = (status) => {
    const colors = {
      new: 'bg-blue-500/20 text-blue-300',
      screening: 'bg-yellow-500/20 text-yellow-300',
      interviewing: 'bg-purple-500/20 text-purple-300',
      offer: 'bg-green-500/20 text-green-300',
      hired: 'bg-green-700/20 text-green-400',
      rejected: 'bg-red-500/20 text-red-300'
    };
    return colors[status] || colors.new;
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
          <h1 className="text-3xl font-bold text-white">Candidates</h1>
          <Dialog open={showAddCandidate} onOpenChange={setShowAddCandidate}>
            <DialogTrigger asChild>
              <Button className="bg-teal-600 hover:bg-teal-700">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Candidate
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-white">Add New Candidate</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-gray-300 text-sm mb-1 block">Resume (paste text)</label>
                  <Textarea
                    placeholder="Paste resume text here for AI parsing..."
                    value={newCandidate.resume_text}
                    onChange={(e) => setNewCandidate({ ...newCandidate, resume_text: e.target.value })}
                    className="bg-slate-900 border-slate-700 text-white h-32"
                  />
                  <Button
                    onClick={parseResume}
                    disabled={parsing || !newCandidate.resume_text}
                    size="sm"
                    className="mt-2 bg-teal-600 hover:bg-teal-700"
                  >
                    {parsing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Parsing...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Parse Resume with AI
                      </>
                    )}
                  </Button>
                </div>

                <Input
                  placeholder="Full Name *"
                  value={newCandidate.full_name}
                  onChange={(e) => setNewCandidate({ ...newCandidate, full_name: e.target.value })}
                  className="bg-slate-900 border-slate-700 text-white"
                />
                <Input
                  placeholder="Email"
                  type="email"
                  value={newCandidate.email}
                  onChange={(e) => setNewCandidate({ ...newCandidate, email: e.target.value })}
                  className="bg-slate-900 border-slate-700 text-white"
                />
                <div>
                  <label className="text-gray-300 text-sm mb-1 block">Birth Date * (Required for numerology)</label>
                  <Input
                    type="date"
                    value={newCandidate.birth_date}
                    onChange={(e) => setNewCandidate({ ...newCandidate, birth_date: e.target.value })}
                    className="bg-slate-900 border-slate-700 text-white"
                  />
                </div>
                <Select value={newCandidate.status} onValueChange={(v) => setNewCandidate({ ...newCandidate, status: v })}>
                  <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="screening">Screening</SelectItem>
                    <SelectItem value="interviewing">Interviewing</SelectItem>
                    <SelectItem value="offer">Offer</SelectItem>
                    <SelectItem value="hired">Hired</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>

                {newCandidate.extracted_skills && (
                  <div className="p-3 bg-green-500/10 rounded border border-green-500/20">
                    <p className="text-green-300 text-sm font-medium mb-1">✓ AI Extracted Data:</p>
                    <p className="text-gray-300 text-xs">Skills: {newCandidate.extracted_skills}</p>
                    {newCandidate.years_experience > 0 && (
                      <p className="text-gray-300 text-xs">Experience: {newCandidate.years_experience} years</p>
                    )}
                  </div>
                )}

                <Button
                  onClick={addCandidate}
                  disabled={calculating || !newCandidate.full_name || !newCandidate.birth_date}
                  className="w-full bg-teal-600 hover:bg-teal-700"
                >
                  {calculating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Calculating Numerology...
                    </>
                  ) : (
                    'Add Candidate'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {candidates.map(candidate => (
            <Card key={candidate.id} className="bg-slate-800/50 backdrop-blur-sm border-slate-700 hover:border-teal-600 transition-colors cursor-pointer" onClick={() => matchJobsForCandidate(candidate)}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-white font-semibold text-lg">{candidate.full_name}</h3>
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(candidate.status)}`}>
                        {candidate.status}
                      </span>
                    </div>
                    
                    {candidate.email && (
                      <p className="text-gray-400 text-sm">{candidate.email}</p>
                    )}
                    
                    <div className="flex gap-4 mt-3 text-sm">
                      <span className="text-amber-400">LP: {candidate.life_path_western}</span>
                      <span className="text-purple-400">Expr: {candidate.expression_western}</span>
                      <span className="text-pink-400">Soul: {candidate.soul_urge_western}</span>
                      <span className="text-green-400">{candidate.element}</span>
                      {candidate.years_experience > 0 && (
                        <span className="text-blue-400">{candidate.years_experience} yrs exp</span>
                      )}
                    </div>
                    
                    {candidate.extracted_skills && (
                      <div className="mt-2">
                        <p className="text-gray-500 text-xs mb-1">Skills:</p>
                        <p className="text-gray-300 text-sm">{candidate.extracted_skills}</p>
                      </div>
                    )}
                    
                    {candidate.master_numbers && (
                      <p className="text-amber-300 text-xs mt-2">✨ Master: {candidate.master_numbers}</p>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Select value={candidate.status} onValueChange={(v) => updateStatus(candidate.id, v)}>
                      <SelectTrigger className="bg-slate-900 border-slate-700 text-white w-32 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="screening">Screening</SelectItem>
                        <SelectItem value="interviewing">Interviewing</SelectItem>
                        <SelectItem value="offer">Offer</SelectItem>
                        <SelectItem value="hired">Hired</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteCandidate(candidate.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {candidates.length === 0 && (
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <CardContent className="py-12 text-center">
                <UserPlus className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">No candidates yet. Add your first candidate to get started.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}