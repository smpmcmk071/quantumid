import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Loader2, Upload, Trash2, FlaskConical, GitCompare, X, Mail, Pencil, Users, Target, ClipboardCheck } from 'lucide-react';
import ArchetypeTest from '../components/candidates/ArchetypeTest';
import CandidateComparison from '../components/candidates/CandidateComparison';
import InterviewAssessment from '../components/candidates/InterviewAssessment';

export default function Candidates() {
  const [client, setClient] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  const [newCandidate, setNewCandidate] = useState({
    full_name: '',
    email: '',
    birth_date: '',
    resume_text: '',
    status: 'new',
    extracted_skills: '',
    years_experience: 0,
    education: '',
    previous_roles: ''
  });
  const [jobs, setJobs] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [matchedJobs, setMatchedJobs] = useState([]);
  const [matchingJobs, setMatchingJobs] = useState(false);
  const [showArchetypeTest, setShowArchetypeTest] = useState(false);
  const [testingCandidate, setTestingCandidate] = useState(null);
  const [showComparison, setShowComparison] = useState(false);
  const [teams, setTeams] = useState([]);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddToTeam, setShowAddToTeam] = useState(false);
  const [selectedCandidateForTeam, setSelectedCandidateForTeam] = useState(null);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [memberRole, setMemberRole] = useState('');
  const [memberSeniority, setMemberSeniority] = useState('mid');
  const [addingToTeam, setAddingToTeam] = useState(false);
  const [showCompatibility, setShowCompatibility] = useState(false);
  const [compatibilityCandidate, setCompatibilityCandidate] = useState(null);
  const [compatibilityTeamId, setCompatibilityTeamId] = useState('');
  const [compatibilityJobId, setCompatibilityJobId] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [showInterviewAssessment, setShowInterviewAssessment] = useState(false);
  const [assessingCandidate, setAssessingCandidate] = useState(null);

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
      
      // Auto-classify candidates without archetypes
      for (const candidate of cands) {
        if (!candidate.archetype_primary && candidate.life_path_western) {
          await base44.functions.invoke('classifyArchetype', {
            personId: candidate.id,
            entityType: 'Candidate'
          });
        }
      }
      
      const updatedCands = await base44.entities.Candidate.filter({ client_id: c.id });
      const j = await base44.entities.JobPosting.filter({ client_id: c.id, status: 'open' });
      const t = await base44.entities.Team.filter({ client_id: c.id });
      setCandidates(updatedCands);
      setJobs(j);
      setTeams(t);
      }
      setLoading(false);
      };

      const generateSampleCandidates = async () => {
      if (!client) return;

      const samples = [
      { full_name: 'Sarah Johnson', birth_date: '1992-03-15', email: 'sarah.j@example.com', extracted_skills: 'React, Node.js, Python, Leadership', years_experience: 5 },
      { full_name: 'Michael Chen', birth_date: '1988-11-22', email: 'mchen@example.com', extracted_skills: 'Java, AWS, Docker, Kubernetes', years_experience: 8 },
      { full_name: 'Emily Rodriguez', birth_date: '1995-07-08', email: 'emily.r@example.com', extracted_skills: 'UI/UX, Figma, Product Design, Research', years_experience: 3 }
      ];

      setLoading(true);

      for (const sample of samples) {
      const response = await base44.functions.invoke('calculateNumerology', {
        type: 'name',
        name: sample.full_name,
        birthDate: sample.birth_date
      });

      if (response.data?.success) {
        const calc = response.data.data;
        await base44.entities.Candidate.create({
          client_id: client.id,
          ...sample,
          resume_text: `Experienced professional with ${sample.years_experience} years in the field.`,
          status: 'new',
          life_path_western: calc.lifePath?.reduced || 0,
          life_path_chaldean: calc.lifePathChaldean?.reduced || 0,
          expression_western: calc.expression?.reduced || 0,
          soul_urge_western: calc.soulUrge?.reduced || 0,
          personality_western: calc.personality?.reduced || 0,
          birthday_number: calc.birthday?.reduced || 0,
          master_numbers: calc.masterNumbers?.join(', ') || '',
          element: calc.astrology?.element || 'Earth',
          chinese_zodiac: calc.astrology?.chineseZodiac || '',
          chinese_animal: calc.astrology?.chineseAnimal || '',
          sun_sign: calc.astrology?.sign || ''
        });
      }
      }

      await loadData();
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

  const handleResumeFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingFile(true);
    
    try {
      // Upload file
      const uploadResponse = await base44.integrations.Core.UploadFile({ file });
      const fileUrl = uploadResponse.file_url;
      
      // Extract data from file
      const extractResponse = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url: fileUrl,
        json_schema: {
          type: 'object',
          properties: {
            full_name: { type: 'string' },
            email: { type: 'string' },
            skills: { type: 'array', items: { type: 'string' } },
            years_experience: { type: 'number' },
            education: { type: 'string' },
            previous_roles: { type: 'string' },
            resume_text: { type: 'string' }
          }
        }
      });
      
      if (extractResponse.status === 'success' && extractResponse.output) {
        const data = extractResponse.output;
        setNewCandidate({
          ...newCandidate,
          full_name: data.full_name || newCandidate.full_name,
          email: data.email || newCandidate.email,
          resume_text: data.resume_text || newCandidate.resume_text,
          extracted_skills: Array.isArray(data.skills) ? data.skills.join(', ') : data.skills || '',
          years_experience: parseInt(data.years_experience) || 0,
          education: data.education || '',
          previous_roles: data.previous_roles || ''
        });
      }
    } catch (error) {
      alert('Error processing file: ' + error.message);
    } finally {
      setUploadingFile(false);
    }
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
        extracted_skills: data.extracted_skills || newCandidate.extracted_skills,
        years_experience: data.years_experience || newCandidate.years_experience,
        education: data.education || newCandidate.education,
        previous_roles: data.previous_roles || newCandidate.previous_roles
      });
    }
    setParsing(false);
  };

  const addCandidate = async () => {
    if (!client) {
      alert('No client found. Please refresh the page.');
      return;
    }

    if (!newCandidate.full_name || !newCandidate.email || !newCandidate.birth_date) {
      alert('Please fill in Name, Email, and Birth Date');
      return;
    }
    
    setCalculating(true);
    
    try {
      // Calculate numerology
      const response = await base44.functions.invoke('calculateNumerology', {
        type: 'name',
        name: newCandidate.full_name,
        birthDate: newCandidate.birth_date
      });

      if (response.data?.success) {
        const calc = response.data.data;

        // Extract correct values from nested response
        const lifePathWestern = calc.lifePath?.reduced || 0;
        const lifePathChaldean = calc.lifePathChaldean?.reduced || 0;
        const expressionWestern = calc.expression?.reduced || 0;
        const soulUrgeWestern = calc.soulUrge?.reduced || 0;
        const personalityWestern = calc.personality?.reduced || 0;
        const birthdayNumber = calc.birthday?.reduced || 0;
        const masterNumbers = calc.masterNumbers?.join(', ') || '';
        const element = calc.astrology?.element || 'Earth';

        await base44.entities.Candidate.create({
          client_id: client.id,
          full_name: newCandidate.full_name,
          email: newCandidate.email,
          birth_date: newCandidate.birth_date,
          resume_text: newCandidate.resume_text || '',
          extracted_skills: newCandidate.extracted_skills || '',
          years_experience: newCandidate.years_experience || 0,
          education: newCandidate.education || '',
          previous_roles: newCandidate.previous_roles || '',
          status: newCandidate.status,
          life_path_western: lifePathWestern,
          life_path_chaldean: lifePathChaldean,
          expression_western: expressionWestern,
          soul_urge_western: soulUrgeWestern,
          personality_western: personalityWestern,
          birthday_number: birthdayNumber,
          master_numbers: masterNumbers,
          element: element,
          chinese_zodiac: calc.astrology?.chineseZodiac || '',
          chinese_animal: calc.astrology?.chineseAnimal || '',
          sun_sign: calc.astrology?.sign || ''
        });
      } else {
        alert('Failed to calculate numerology profile');
        setCalculating(false);
        return;
      }
      
        setNewCandidate({
          full_name: '',
          email: '',
          birth_date: '',
          resume_text: '',
          status: 'new',
          extracted_skills: '',
          years_experience: 0,
          education: '',
          previous_roles: ''
        });
        setShowAddCandidate(false);
        loadData();
      } catch (error) {
        alert('Error adding candidate: ' + error.message);
      } finally {
        setCalculating(false);
      }
  };

  const deleteCandidate = async (candidateId) => {
    if (!confirm('Delete this candidate?')) return;
    await base44.entities.Candidate.delete(candidateId);
    loadData();
  };

  const inviteCandidate = async (candidate) => {
    if (!candidate.email) {
      alert('Candidate must have an email address to be invited');
      return;
    }
    
    try {
      await base44.users.inviteUser(candidate.email, 'user');
      alert(`Invitation sent to ${candidate.email}!\nThey can log in and complete their archetype test on "My Profile".`);
    } catch (error) {
      alert('Error sending invitation: ' + error.message);
    }
  };

  const startEditCandidate = (candidate) => {
    setEditingCandidate({ 
      ...candidate,
      resume_text: candidate.resume_text || '',
      extracted_skills: candidate.extracted_skills || '',
      years_experience: candidate.years_experience || 0,
      education: candidate.education || '',
      previous_roles: candidate.previous_roles || ''
    });
    setShowEditDialog(true);
  };

  const saveEditCandidate = async () => {
    if (!editingCandidate) return;
    
    await base44.entities.Candidate.update(editingCandidate.id, {
      email: editingCandidate.email,
      full_name: editingCandidate.full_name,
      birth_date: editingCandidate.birth_date,
      resume_text: editingCandidate.resume_text || '',
      extracted_skills: editingCandidate.extracted_skills || '',
      years_experience: editingCandidate.years_experience || 0,
      education: editingCandidate.education || '',
      previous_roles: editingCandidate.previous_roles || ''
    });
    
    setShowEditDialog(false);
    setEditingCandidate(null);
    loadData();
  };

  const parseResumeForEdit = async () => {
    if (!editingCandidate?.resume_text) return;
    
    setParsing(true);
    const response = await base44.functions.invoke('parseResume', {
      resumeText: editingCandidate.resume_text
    });
    
    if (response.data?.success) {
      const data = response.data.data;
      setEditingCandidate({
        ...editingCandidate,
        full_name: data.full_name || editingCandidate.full_name,
        email: data.email || editingCandidate.email,
        extracted_skills: data.extracted_skills || editingCandidate.extracted_skills,
        years_experience: data.years_experience || editingCandidate.years_experience,
        education: data.education || editingCandidate.education,
        previous_roles: data.previous_roles || editingCandidate.previous_roles
      });
    }
    setParsing(false);
  };

  const handleEditResumeFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingFile(true);
    
    try {
      const uploadResponse = await base44.integrations.Core.UploadFile({ file });
      const fileUrl = uploadResponse.file_url;
      
      const extractResponse = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url: fileUrl,
        json_schema: {
          type: 'object',
          properties: {
            full_name: { type: 'string' },
            email: { type: 'string' },
            skills: { type: 'array', items: { type: 'string' } },
            resume_text: { type: 'string' }
          }
        }
      });
      
      if (extractResponse.status === 'success' && extractResponse.output) {
        const data = extractResponse.output;
        setEditingCandidate({
          ...editingCandidate,
          full_name: data.full_name || editingCandidate.full_name,
          email: data.email || editingCandidate.email,
          resume_text: data.resume_text || editingCandidate.resume_text,
          extracted_skills: Array.isArray(data.skills) ? data.skills.join(', ') : data.skills || editingCandidate.extracted_skills,
          years_experience: parseInt(data.years_experience) || editingCandidate.years_experience,
          education: data.education || editingCandidate.education,
          previous_roles: data.previous_roles || editingCandidate.previous_roles
        });
      }
    } catch (error) {
      alert('Error processing file: ' + error.message);
    } finally {
      setUploadingFile(false);
    }
  };

  const startAddToTeam = (candidate) => {
    setSelectedCandidateForTeam(candidate);
    setMemberRole(candidate.previous_roles?.split(',')[0] || '');
    setShowAddToTeam(true);
  };

  const addCandidateToTeam = async () => {
    if (!selectedTeamId || !memberRole) {
      alert('Please select a team and enter a role');
      return;
    }

    setAddingToTeam(true);

    try {
      await base44.entities.TeamMember.create({
        team_id: selectedTeamId,
        full_name: selectedCandidateForTeam.full_name,
        email: selectedCandidateForTeam.email,
        birth_date: selectedCandidateForTeam.birth_date,
        role: memberRole,
        seniority: memberSeniority,
        life_path_western: selectedCandidateForTeam.life_path_western,
        life_path_chaldean: selectedCandidateForTeam.life_path_chaldean,
        expression_western: selectedCandidateForTeam.expression_western,
        soul_urge_western: selectedCandidateForTeam.soul_urge_western,
        personality_western: selectedCandidateForTeam.personality_western,
        birthday_number: selectedCandidateForTeam.birthday_number,
        master_numbers: selectedCandidateForTeam.master_numbers,
        element: selectedCandidateForTeam.element,
        chinese_zodiac: selectedCandidateForTeam.chinese_zodiac,
        chinese_animal: selectedCandidateForTeam.chinese_animal,
        sun_sign: selectedCandidateForTeam.sun_sign,
        archetype_primary: selectedCandidateForTeam.archetype_primary,
        archetype_secondary: selectedCandidateForTeam.archetype_secondary,
        skills: selectedCandidateForTeam.extracted_skills || ''
      });

      // Update candidate status to hired
      await base44.entities.Candidate.update(selectedCandidateForTeam.id, { status: 'hired' });

      setShowAddToTeam(false);
      setSelectedCandidateForTeam(null);
      setSelectedTeamId('');
      setMemberRole('');
      alert('Candidate successfully added to team!');
      loadData();
    } catch (error) {
      alert('Error adding to team: ' + error.message);
    } finally {
      setAddingToTeam(false);
    }
  };

  const startArchetypeTest = (candidate) => {
    setTestingCandidate(candidate);
    setShowArchetypeTest(true);
  };

  const handleTestComplete = async (results) => {
    if (!testingCandidate) return;
    
    await base44.entities.Candidate.update(testingCandidate.id, {
      archetype_primary: results.primary,
      archetype_secondary: results.secondary
    });
    
    setShowArchetypeTest(false);
    setTestingCandidate(null);
    loadData();
  };

  const updateStatus = async (candidateId, status) => {
    await base44.entities.Candidate.update(candidateId, { status });
    loadData();
  };

  const runCompatibilityAnalysis = async () => {
    if (!compatibilityCandidate) return;

    setAnalyzing(true);
    try {
      const response = await base44.functions.invoke('analyzeCompatibility', {
        candidateId: compatibilityCandidate.id,
        teamId: compatibilityTeamId || null,
        jobPostingId: compatibilityJobId || null
      });

      if (response.data?.success) {
        alert('Compatibility analysis completed! View results in the Compatibility Report page.');
        setShowCompatibility(false);
        setCompatibilityCandidate(null);
        setCompatibilityTeamId('');
        setCompatibilityJobId('');
      }
    } catch (error) {
      alert('Error running analysis: ' + error.message);
    } finally {
      setAnalyzing(false);
    }
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
          <div className="flex gap-2">
            <Button
              onClick={generateSampleCandidates}
              variant="outline"
              className="border-slate-700 text-gray-300"
              disabled={loading}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add 3 Sample Candidates
            </Button>
            <Button
              onClick={() => setShowComparison(true)}
              variant="outline"
              className="border-slate-700 text-gray-300"
              disabled={candidates.length < 2}
            >
              <GitCompare className="w-4 h-4 mr-2" />
              Compare
            </Button>
            <Dialog open={showAddCandidate} onOpenChange={setShowAddCandidate}>
            <DialogTrigger asChild>
              <Button className="bg-teal-600 hover:bg-teal-700">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Candidate
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700 max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader className="pb-2">
                <DialogTitle className="text-white text-base">Add New Candidate</DialogTitle>
              </DialogHeader>
              <div className="space-y-2">
                <div>
                  <label className="text-gray-300 text-xs mb-0.5 block">Resume Upload</label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleResumeFileUpload}
                    disabled={uploadingFile}
                    className="block w-full text-sm text-gray-300 bg-slate-900 border border-slate-700 rounded px-3 py-2 cursor-pointer hover:bg-slate-800"
                  />
                  {uploadingFile && (
                    <p className="text-xs text-teal-400 mt-1 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Processing file...
                    </p>
                  )}
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-700"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-slate-800 px-2 text-gray-400">OR paste text</span>
                  </div>
                </div>

                <div>
                  <label className="text-gray-300 text-xs mb-0.5 block">Resume (paste text)</label>
                  <Textarea
                    placeholder="Paste resume text here for AI parsing..."
                    value={newCandidate.resume_text}
                    onChange={(e) => setNewCandidate({ ...newCandidate, resume_text: e.target.value })}
                    className="bg-slate-900 border-slate-700 text-white text-sm h-24"
                  />
                  <Button
                    onClick={parseResume}
                    disabled={parsing || !newCandidate.resume_text}
                    size="sm"
                    className="mt-1 bg-teal-600 hover:bg-teal-700 h-7 text-xs"
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
                  className="bg-slate-900 border-slate-700 text-white h-8 text-sm"
                  autoComplete="off"
                  data-1p-ignore
                  data-lpignore="true"
                />
                <div>
                  <label className="text-gray-300 text-xs mb-0.5 block">Email *</label>
                  <Input
                    placeholder="Email (required to invite)"
                    type="email"
                    value={newCandidate.email}
                    onChange={(e) => setNewCandidate({ ...newCandidate, email: e.target.value })}
                    className="bg-slate-900 border-slate-700 text-white h-8 text-sm"
                    autoComplete="off"
                    data-1p-ignore
                    data-lpignore="true"
                  />
                </div>
                <div>
                  <label className="text-gray-300 text-xs mb-0.5 block">Birth Date *</label>
                  <Input
                    type="date"
                    value={newCandidate.birth_date}
                    onChange={(e) => setNewCandidate({ ...newCandidate, birth_date: e.target.value })}
                    className="bg-slate-900 border-slate-700 text-white h-8 text-sm"
                    autoComplete="off"
                    data-1p-ignore
                    data-lpignore="true"
                  />
                </div>
                <Select value={newCandidate.status} onValueChange={(v) => setNewCandidate({ ...newCandidate, status: v })}>
                  <SelectTrigger className="bg-slate-900 border-slate-700 text-white h-8 text-sm">
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
                  <div className="p-2 bg-green-500/10 rounded border border-green-500/20">
                    <p className="text-green-300 text-xs font-medium">✓ AI Extracted</p>
                    <p className="text-gray-300 text-xs mt-0.5">{newCandidate.extracted_skills}</p>
                    {newCandidate.years_experience > 0 && (
                      <p className="text-gray-300 text-xs">{newCandidate.years_experience} yrs exp</p>
                    )}
                  </div>
                )}

                <Button
                  onClick={addCandidate}
                  disabled={calculating || !newCandidate.full_name || !newCandidate.birth_date || !newCandidate.email}
                  className="w-full bg-teal-600 hover:bg-teal-700 h-8 text-sm mt-2"
                >
                  {calculating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Calculating Profile...
                    </>
                  ) : (
                    'Add Candidate'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        <div className="grid gap-2">
          {candidates.map(candidate => (
            <Card key={candidate.id} className="bg-slate-800/50 backdrop-blur-sm border-slate-700 hover:border-teal-600 transition-colors cursor-pointer" onClick={() => matchJobsForCandidate(candidate)}>
              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-white font-semibold text-lg">{candidate.full_name}</h3>
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(candidate.status)}`}>
                        {candidate.status}
                      </span>
                    </div>
                    
                    <div className="mb-2">
                      <span className="text-gray-500 text-xs">Email: </span>
                      <span className={`text-sm font-mono ${candidate.email ? 'text-teal-300' : 'text-red-400'}`}>
                        {candidate.email || '❌ NO EMAIL SAVED'}
                      </span>
                      </div>

                      {candidate.interview_score && (
                      <div className="mt-2 p-2 bg-purple-500/10 rounded border border-purple-500/20">
                        <div className="flex items-center justify-between">
                          <span className="text-purple-300 text-xs font-medium">Interview Score</span>
                          <span className="text-purple-400 text-lg font-bold">{candidate.interview_score}/100</span>
                        </div>
                        {candidate.interview_summary && (
                          <p className="text-gray-400 text-xs mt-1">{candidate.interview_summary}</p>
                        )}
                      </div>
                      )}
                    
                    <div className="text-gray-500 text-xs">
                      Birth Date: <span className="text-gray-400">{candidate.birth_date || 'N/A'}</span>
                    </div>

                    {candidate.archetype_primary && (
                      <div className="flex gap-2 mt-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          candidate.archetype_primary === 'visionary' ? 'bg-purple-500/20 text-purple-300' :
                          candidate.archetype_primary === 'strategist' ? 'bg-blue-500/20 text-blue-300' :
                          candidate.archetype_primary === 'creator' ? 'bg-amber-500/20 text-amber-300' :
                          'bg-green-500/20 text-green-300'
                        }`}>
                          {candidate.archetype_primary}
                        </span>
                        {candidate.archetype_secondary && (
                          <span className={`px-2 py-1 rounded text-xs ${
                            candidate.archetype_secondary === 'visionary' ? 'bg-purple-500/10 text-purple-400' :
                            candidate.archetype_secondary === 'strategist' ? 'bg-blue-500/10 text-blue-400' :
                            candidate.archetype_secondary === 'creator' ? 'bg-amber-500/10 text-amber-400' :
                            'bg-green-500/10 text-green-400'
                          }`}>
                            {candidate.archetype_secondary}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex gap-4 mt-3 text-sm">
                      <span className="text-amber-400">LP: {candidate.life_path_western}</span>
                      <span className="text-purple-400">Expr: {candidate.expression_western}</span>
                      <span className="text-pink-400">Soul: {candidate.soul_urge_western}</span>
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

                    {candidate.chinese_zodiac && (
                      <p className="text-pink-300 text-xs mt-1">🐉 {candidate.chinese_zodiac}</p>
                    )}

                    {candidate.sun_sign && (
                      <p className="text-indigo-300 text-xs">♈ {candidate.sun_sign} • {candidate.element}</p>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    {candidate.email && (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          inviteCandidate(candidate);
                        }}
                        className="bg-teal-600 hover:bg-teal-700 h-8"
                        title="Invite to take archetype test"
                      >
                        <Mail className="w-3 h-3 mr-1" />
                        Invite
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAssessingCandidate(candidate);
                        setShowInterviewAssessment(true);
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 h-8"
                      title="Interview assessment"
                    >
                      <ClipboardCheck className="w-3 h-3 mr-1" />
                      Interview
                    </Button>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCompatibilityCandidate(candidate);
                        setShowCompatibility(true);
                      }}
                      className="bg-purple-600 hover:bg-purple-700 h-8"
                      title="Run compatibility analysis"
                    >
                      <Target className="w-3 h-3 mr-1" />
                      Analyze
                    </Button>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        startAddToTeam(candidate);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 h-8"
                      title="Add to team"
                    >
                      <Users className="w-3 h-3 mr-1" />
                      Add to Team
                    </Button>
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
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditCandidate(candidate);
                      }}
                      className="text-blue-400 hover:text-blue-300 h-8"
                      title="Edit candidate details"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteCandidate(candidate.id);
                      }}
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

        {/* Archetype Test Dialog */}
        {showArchetypeTest && testingCandidate && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto p-4">
            <div className="max-w-2xl mx-auto my-8">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">
                      Archetype Assessment: {testingCandidate.full_name}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setShowArchetypeTest(false);
                        setTestingCandidate(null);
                      }}
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                  <p className="text-gray-400 text-sm mt-2">
                    Answer these questions to determine the candidate's primary team archetype
                  </p>
                </CardHeader>
                <CardContent>
                  <ArchetypeTest
                    candidateName={testingCandidate.full_name}
                    onComplete={handleTestComplete}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Edit Candidate Dialog */}
        {showEditDialog && editingCandidate && (
          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogContent className="bg-slate-800 border-slate-700 max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-white">Edit Candidate</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <label className="text-gray-300 text-xs mb-1 block">Resume Upload</label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleEditResumeFileUpload}
                    disabled={uploadingFile}
                    className="block w-full text-sm text-gray-300 bg-slate-900 border border-slate-700 rounded px-3 py-2 cursor-pointer hover:bg-slate-800"
                  />
                  {uploadingFile && (
                    <p className="text-xs text-teal-400 mt-1 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Processing file...
                    </p>
                  )}
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-700"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-slate-800 px-2 text-gray-400">OR paste text</span>
                  </div>
                </div>

                <div>
                  <label className="text-gray-300 text-xs mb-1 block">Resume Text</label>
                  <Textarea
                    placeholder="Paste resume text here..."
                    value={editingCandidate.resume_text || ''}
                    onChange={(e) => setEditingCandidate({ ...editingCandidate, resume_text: e.target.value })}
                    className="bg-slate-900 border-slate-700 text-white text-sm h-24"
                  />
                  <Button
                    onClick={parseResumeForEdit}
                    disabled={parsing || !editingCandidate.resume_text}
                    size="sm"
                    className="mt-1 bg-teal-600 hover:bg-teal-700 h-7 text-xs"
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

                {editingCandidate.extracted_skills && (
                  <div className="p-2 bg-green-500/10 rounded border border-green-500/20">
                    <p className="text-green-300 text-xs font-medium">✓ AI Extracted Skills</p>
                    <p className="text-gray-300 text-xs mt-0.5">{editingCandidate.extracted_skills}</p>
                  </div>
                )}

                <Input
                  placeholder="Full Name"
                  value={editingCandidate.full_name}
                  onChange={(e) => setEditingCandidate({ ...editingCandidate, full_name: e.target.value })}
                  className="bg-slate-900 border-slate-700 text-white text-sm h-8"
                />
                <Input
                  placeholder="Email"
                  type="email"
                  value={editingCandidate.email || ''}
                  onChange={(e) => setEditingCandidate({ ...editingCandidate, email: e.target.value })}
                  className="bg-slate-900 border-slate-700 text-white text-sm h-8"
                />
                <Input
                  type="date"
                  value={editingCandidate.birth_date}
                  onChange={(e) => setEditingCandidate({ ...editingCandidate, birth_date: e.target.value })}
                  className="bg-slate-900 border-slate-700 text-white text-sm h-8"
                />
                <Button
                  onClick={saveEditCandidate}
                  className="w-full bg-teal-600 hover:bg-teal-700 h-8 text-sm"
                >
                  Save Changes
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Add to Team Dialog */}
        {showAddToTeam && selectedCandidateForTeam && (
          <Dialog open={showAddToTeam} onOpenChange={setShowAddToTeam}>
            <DialogContent className="bg-slate-800 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">Add {selectedCandidateForTeam.full_name} to Team</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Select Team</label>
                  <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                    <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                      <SelectValue placeholder="Choose team..." />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map(team => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.team_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Input
                  placeholder="Role/Position *"
                  value={memberRole}
                  onChange={(e) => setMemberRole(e.target.value)}
                  className="bg-slate-900 border-slate-700 text-white"
                />
                <Select value={memberSeniority} onValueChange={setMemberSeniority}>
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
                <Button
                  onClick={addCandidateToTeam}
                  disabled={!selectedTeamId || !memberRole || addingToTeam}
                  className="w-full bg-teal-600 hover:bg-teal-700"
                >
                  {addingToTeam ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding to Team...
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4 mr-2" />
                      Add to Team
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Interview Assessment Dialog */}
        {showInterviewAssessment && assessingCandidate && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto p-4">
            <div className="max-w-3xl mx-auto my-8">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">
                      Interview Assessment: {assessingCandidate.full_name}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setShowInterviewAssessment(false);
                        setAssessingCandidate(null);
                      }}
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                  <p className="text-gray-400 text-sm mt-2">
                    Paste interview responses and get AI-powered assessment
                  </p>
                </CardHeader>
                <CardContent>
                  <InterviewAssessment
                    candidate={assessingCandidate}
                    onComplete={() => {
                      loadData();
                      setShowInterviewAssessment(false);
                      setAssessingCandidate(null);
                    }}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Compatibility Analysis Dialog */}
        {showCompatibility && compatibilityCandidate && (
          <Dialog open={showCompatibility} onOpenChange={setShowCompatibility}>
            <DialogContent className="bg-slate-800 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">Compatibility Analysis: {compatibilityCandidate.full_name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-gray-300 text-sm">
                  Select a team and/or job posting to analyze compatibility.
                </p>

                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Team (optional)</label>
                  <Select value={compatibilityTeamId} onValueChange={setCompatibilityTeamId}>
                    <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                      <SelectValue placeholder="Select team..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>None</SelectItem>
                      {teams.map(team => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.team_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Job Posting (optional)</label>
                  <Select value={compatibilityJobId} onValueChange={setCompatibilityJobId}>
                    <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                      <SelectValue placeholder="Select job..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>None</SelectItem>
                      {jobs.map(job => (
                        <SelectItem key={job.id} value={job.id}>
                          {job.job_title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={runCompatibilityAnalysis}
                  disabled={analyzing}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Target className="w-4 h-4 mr-2" />
                      Run Analysis
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Candidate Comparison */}
        {showComparison && (
          <CandidateComparison
            candidates={candidates}
            jobs={jobs}
            teams={teams}
            onClose={() => setShowComparison(false)}
          />
        )}
        </div>
        </div>
        );
        }