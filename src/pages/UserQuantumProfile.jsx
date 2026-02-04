import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Shield, Briefcase, Users, Heart, Download, Key, Lock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function UserQuantumProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [user, setUser] = useState(null);
  const [musicProfile, setMusicProfile] = useState(null);
  const [quantumProfile, setQuantumProfile] = useState(null);
  
  // Job History
  const [jobs, setJobs] = useState([]);
  const [newJob, setNewJob] = useState({
    employer: '', position: '', start_date: '', end_date: '', responsibilities: '', skills: ''
  });
  
  // Family Data
  const [familyMembers, setFamilyMembers] = useState([]);
  const [newMember, setNewMember] = useState({ name: '', relationship: '', birth_date: '' });
  
  // Hobbies
  const [hobbies, setHobbies] = useState([]);
  const [newHobby, setNewHobby] = useState({ name: '', category: '', skill_level: '', since_year: '' });
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    setLoading(true);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      // Load music profile for astrology data
      const musicProfiles = await base44.entities.UserMusicProfile.filter({ user_id: currentUser.id });
      if (musicProfiles.length > 0) {
        setMusicProfile(musicProfiles[0]);
      }
      
      // Load quantum profile if exists
      const quantumProfiles = await base44.entities.QuantumProfile.filter({ user_id: currentUser.id });
      if (quantumProfiles.length > 0) {
        const qp = quantumProfiles[0];
        setQuantumProfile(qp);
        setJobs(qp.job_history || []);
        setFamilyMembers(qp.family_data?.members || []);
        setHobbies(qp.hobbies || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const generateQuantumID = async () => {
    if (!musicProfile) {
      alert('Please complete your Music Profile first to generate QuantumID');
      return;
    }
    
    setGenerating(true);
    try {
      const response = await base44.functions.invoke('generateQuantumID', {
        userProfileId: musicProfile.id,
        planets: musicProfile.planets || {},
        lifePathNumber: musicProfile.life_path_number,
        birthDate: musicProfile.birth_date,
        fullName: musicProfile.full_name
      });
      
      if (response.data?.success) {
        const qData = response.data;
        
        // Save or update quantum profile
        const profileData = {
          user_id: user.id,
          quantum_id: qData.quantumID,
          planetary_codes: qData.planetaryCodes,
          life_path_number: musicProfile.life_path_number,
          protection_hash: qData.protectionHash,
          short_code_report: qData.shortCodeReport,
          job_history: jobs,
          family_data: { members: familyMembers },
          hobbies: hobbies,
          blockchain_ready: true,
          export_data: qData.exportData
        };
        
        if (quantumProfile) {
          const updated = await base44.entities.QuantumProfile.update(quantumProfile.id, profileData);
          setQuantumProfile(updated);
        } else {
          const created = await base44.entities.QuantumProfile.create(profileData);
          setQuantumProfile(created);
        }
        
        alert('QuantumID generated successfully!');
      }
    } catch (error) {
      alert('Error generating QuantumID: ' + error.message);
    } finally {
      setGenerating(false);
    }
  };
  
  const saveProfile = async () => {
    if (!quantumProfile) {
      alert('Generate QuantumID first');
      return;
    }
    
    setSaving(true);
    try {
      const updated = await base44.entities.QuantumProfile.update(quantumProfile.id, {
        job_history: jobs,
        family_data: { members: familyMembers },
        hobbies: hobbies
      });
      setQuantumProfile(updated);
      alert('Profile saved successfully!');
    } catch (error) {
      alert('Error saving: ' + error.message);
    } finally {
      setSaving(false);
    }
  };
  
  const addJob = () => {
    if (!newJob.employer || !newJob.position) {
      alert('Employer and position are required');
      return;
    }
    setJobs([...jobs, { ...newJob, skills: newJob.skills.split(',').map(s => s.trim()) }]);
    setNewJob({ employer: '', position: '', start_date: '', end_date: '', responsibilities: '', skills: '' });
  };
  
  const addFamilyMember = () => {
    if (!newMember.name || !newMember.relationship) {
      alert('Name and relationship are required');
      return;
    }
    setFamilyMembers([...familyMembers, newMember]);
    setNewMember({ name: '', relationship: '', birth_date: '' });
  };
  
  const addHobby = () => {
    if (!newHobby.name) {
      alert('Hobby name is required');
      return;
    }
    setHobbies([...hobbies, { ...newHobby, since_year: parseInt(newHobby.since_year) || new Date().getFullYear() }]);
    setNewHobby({ name: '', category: '', skill_level: '', since_year: '' });
  };
  
  const downloadReport = () => {
    if (!quantumProfile) return;
    
    const report = {
      quantumID: quantumProfile.quantum_id,
      shortCodes: quantumProfile.short_code_report,
      planetaryCodes: quantumProfile.planetary_codes,
      lifePathNumber: quantumProfile.life_path_number,
      protectionHash: quantumProfile.protection_hash,
      blockchainExportData: quantumProfile.export_data,
      generatedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quantum-id-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <Shield className="w-8 h-8 text-cyan-400" />
              Quantum Profile
            </h1>
            <p className="text-purple-200 mt-2">Self-sovereign identity with blockchain-ready export</p>
          </div>
          
          {quantumProfile && (
            <Button onClick={downloadReport} variant="outline" className="border-cyan-500/30 text-cyan-300">
              <Download className="w-4 h-4 mr-2" />
              Export Backup
            </Button>
          )}
        </div>
        
        {/* QuantumID Display */}
        <Card className="bg-slate-900/50 backdrop-blur-sm border-purple-500/30 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-cyan-400" />
              QuantumID Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {quantumProfile ? (
              <div className="space-y-4">
                <div>
                  <label className="text-purple-300 text-sm">Your QuantumID (SHA-256)</label>
                  <div className="bg-slate-800 p-3 rounded-lg mt-2 font-mono text-xs text-cyan-300 break-all">
                    {quantumProfile.quantum_id}
                  </div>
                </div>
                
                <div>
                  <label className="text-purple-300 text-sm">Protection Hash</label>
                  <div className="bg-slate-800 p-3 rounded-lg mt-2 font-mono text-xs text-green-300 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    {quantumProfile.protection_hash?.substring(0, 32)}...
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-purple-300 text-sm">Life Path Number</label>
                    <div className="bg-slate-800 p-3 rounded-lg mt-2 text-white">
                      {quantumProfile.life_path_number}
                    </div>
                  </div>
                  <div>
                    <label className="text-purple-300 text-sm">Blockchain Ready</label>
                    <div className="bg-slate-800 p-3 rounded-lg mt-2 text-white">
                      {quantumProfile.blockchain_ready ? '✅ Yes' : '❌ No'}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-purple-200 mb-4">No QuantumID generated yet</p>
                <Button
                  onClick={generateQuantumID}
                  disabled={generating || !musicProfile}
                  className="bg-gradient-to-r from-cyan-600 to-purple-600"
                >
                  {generating ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Shield className="w-4 h-4 mr-2" />
                  )}
                  Generate QuantumID
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Data Capture Tabs */}
        <Card className="bg-slate-900/50 backdrop-blur-sm border-purple-500/30">
          <CardContent className="pt-6">
            <Tabs defaultValue="jobs" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-slate-800">
                <TabsTrigger value="jobs" className="data-[state=active]:bg-purple-600">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Jobs
                </TabsTrigger>
                <TabsTrigger value="family" className="data-[state=active]:bg-purple-600">
                  <Users className="w-4 h-4 mr-2" />
                  Family
                </TabsTrigger>
                <TabsTrigger value="hobbies" className="data-[state=active]:bg-purple-600">
                  <Heart className="w-4 h-4 mr-2" />
                  Hobbies
                </TabsTrigger>
              </TabsList>
              
              {/* Jobs Tab */}
              <TabsContent value="jobs" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Employer"
                    value={newJob.employer}
                    onChange={(e) => setNewJob({...newJob, employer: e.target.value})}
                    className="bg-slate-800 border-purple-500/30 text-white"
                  />
                  <Input
                    placeholder="Position"
                    value={newJob.position}
                    onChange={(e) => setNewJob({...newJob, position: e.target.value})}
                    className="bg-slate-800 border-purple-500/30 text-white"
                  />
                  <Input
                    type="date"
                    placeholder="Start Date"
                    value={newJob.start_date}
                    onChange={(e) => setNewJob({...newJob, start_date: e.target.value})}
                    className="bg-slate-800 border-purple-500/30 text-white"
                  />
                  <Input
                    type="date"
                    placeholder="End Date"
                    value={newJob.end_date}
                    onChange={(e) => setNewJob({...newJob, end_date: e.target.value})}
                    className="bg-slate-800 border-purple-500/30 text-white"
                  />
                </div>
                <Textarea
                  placeholder="Responsibilities"
                  value={newJob.responsibilities}
                  onChange={(e) => setNewJob({...newJob, responsibilities: e.target.value})}
                  className="bg-slate-800 border-purple-500/30 text-white"
                />
                <Input
                  placeholder="Skills (comma-separated)"
                  value={newJob.skills}
                  onChange={(e) => setNewJob({...newJob, skills: e.target.value})}
                  className="bg-slate-800 border-purple-500/30 text-white"
                />
                <Button onClick={addJob} className="bg-purple-600 hover:bg-purple-700">
                  Add Job
                </Button>
                
                <div className="space-y-2 mt-4">
                  {jobs.map((job, idx) => (
                    <div key={idx} className="bg-slate-800 p-4 rounded-lg border border-purple-500/20">
                      <h4 className="text-white font-semibold">{job.position} at {job.employer}</h4>
                      <p className="text-purple-300 text-sm">{job.start_date} - {job.end_date || 'Present'}</p>
                      {job.skills && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {job.skills.map((skill, i) => (
                            <span key={i} className="bg-purple-600/30 px-2 py-1 rounded text-xs text-purple-200">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              {/* Family Tab */}
              <TabsContent value="family" className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    placeholder="Name"
                    value={newMember.name}
                    onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                    className="bg-slate-800 border-purple-500/30 text-white"
                  />
                  <Input
                    placeholder="Relationship"
                    value={newMember.relationship}
                    onChange={(e) => setNewMember({...newMember, relationship: e.target.value})}
                    className="bg-slate-800 border-purple-500/30 text-white"
                  />
                  <Input
                    type="date"
                    placeholder="Birth Date"
                    value={newMember.birth_date}
                    onChange={(e) => setNewMember({...newMember, birth_date: e.target.value})}
                    className="bg-slate-800 border-purple-500/30 text-white"
                  />
                </div>
                <Button onClick={addFamilyMember} className="bg-purple-600 hover:bg-purple-700">
                  Add Family Member
                </Button>
                
                <div className="space-y-2 mt-4">
                  {familyMembers.map((member, idx) => (
                    <div key={idx} className="bg-slate-800 p-4 rounded-lg border border-purple-500/20">
                      <h4 className="text-white font-semibold">{member.name}</h4>
                      <p className="text-purple-300 text-sm">{member.relationship} • {member.birth_date}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              {/* Hobbies Tab */}
              <TabsContent value="hobbies" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Hobby Name"
                    value={newHobby.name}
                    onChange={(e) => setNewHobby({...newHobby, name: e.target.value})}
                    className="bg-slate-800 border-purple-500/30 text-white"
                  />
                  <Input
                    placeholder="Category"
                    value={newHobby.category}
                    onChange={(e) => setNewHobby({...newHobby, category: e.target.value})}
                    className="bg-slate-800 border-purple-500/30 text-white"
                  />
                  <Input
                    placeholder="Skill Level"
                    value={newHobby.skill_level}
                    onChange={(e) => setNewHobby({...newHobby, skill_level: e.target.value})}
                    className="bg-slate-800 border-purple-500/30 text-white"
                  />
                  <Input
                    type="number"
                    placeholder="Since Year"
                    value={newHobby.since_year}
                    onChange={(e) => setNewHobby({...newHobby, since_year: e.target.value})}
                    className="bg-slate-800 border-purple-500/30 text-white"
                  />
                </div>
                <Button onClick={addHobby} className="bg-purple-600 hover:bg-purple-700">
                  Add Hobby
                </Button>
                
                <div className="space-y-2 mt-4">
                  {hobbies.map((hobby, idx) => (
                    <div key={idx} className="bg-slate-800 p-4 rounded-lg border border-purple-500/20">
                      <h4 className="text-white font-semibold">{hobby.name}</h4>
                      <p className="text-purple-300 text-sm">
                        {hobby.category} • {hobby.skill_level} • Since {hobby.since_year}
                      </p>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="mt-6 flex justify-end">
              <Button
                onClick={saveProfile}
                disabled={saving || !quantumProfile}
                className="bg-gradient-to-r from-cyan-600 to-purple-600"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Save All Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}