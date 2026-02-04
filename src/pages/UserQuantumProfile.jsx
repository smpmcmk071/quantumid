import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Shield, Briefcase, Users, Heart, Download, Key, Lock, RefreshCw, Upload, Check, X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function UserQuantumProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [user, setUser] = useState(null);
  const [quantumProfile, setQuantumProfile] = useState(null);
  
  // Form fields
  const [formData, setFormData] = useState({
    full_name: '',
    birth_date: '',
    birth_time: '',
    birth_location: ''
  });
  
  // Job History
  const [jobs, setJobs] = useState([
    {
      employer: 'TechCorp Solutions',
      position: 'Senior Software Engineer',
      start_date: '2019-01-15',
      end_date: '2024-06-30',
      responsibilities: 'Led development of cloud infrastructure, mentored junior engineers, architected microservices',
      skills: ['JavaScript', 'React', 'Node.js', 'AWS', 'Docker', 'PostgreSQL']
    },
    {
      employer: 'Digital Innovations Inc',
      position: 'Full Stack Developer',
      start_date: '2016-03-10',
      end_date: '2018-12-31',
      responsibilities: 'Built web applications, implemented CI/CD pipelines, database optimization',
      skills: ['Python', 'Django', 'Vue.js', 'MySQL', 'Linux']
    }
  ]);
  const [newJob, setNewJob] = useState({
    employer: '', position: '', start_date: '', end_date: '', responsibilities: '', skills: ''
  });

  // Family Data
  const [familyMembers, setFamilyMembers] = useState([
    { name: 'Margaret Maher', relationship: 'Mother', birth_date: '1947-03-22' },
    { name: 'Paul Maher Sr.', relationship: 'Father', birth_date: '1945-08-15' },
    { name: 'Lisa Maher', relationship: 'Sister', birth_date: '1972-05-10' }
  ]);
  const [newMember, setNewMember] = useState({ name: '', relationship: '', birth_date: '' });

  // Hobbies
  const [hobbies, setHobbies] = useState([
    { name: 'Guitar Playing', category: 'Music', skill_level: 'Advanced', since_year: 2005 },
    { name: 'Rock Climbing', category: 'Sports', skill_level: 'Intermediate', since_year: 2015 },
    { name: 'Photography', category: 'Creative', skill_level: 'Intermediate', since_year: 2018 }
  ]);
  const [newHobby, setNewHobby] = useState({ name: '', category: '', skill_level: '', since_year: '' });
  
  // Resume parsing
  const [parsing, setParsing] = useState(false);
  const [parsedJobs, setParsedJobs] = useState(null);
  const [resumeText, setResumeText] = useState('');
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    setLoading(true);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      // Load quantum profile if exists
      const quantumProfiles = await base44.entities.QuantumProfile.filter({ user_id: currentUser.id });
      if (quantumProfiles.length > 0) {
        const qp = quantumProfiles[0];
        setQuantumProfile(qp);
        setFormData({
          full_name: qp.full_name || '',
          birth_date: qp.birth_date || '',
          birth_time: qp.birth_time || '',
          birth_location: qp.birth_location || ''
        });
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
  
  const calculateProfile = async () => {
    if (!formData.full_name || !formData.birth_date) {
      alert('Please enter full name and birth date');
      return;
    }

    setCalculating(true);
    try {
      const response = await base44.functions.invoke('calculateNumerology', {
        type: 'name',
        name: formData.full_name,
        birthDate: formData.birth_date,
        birthTime: formData.birth_time || 'unknown',
        birthLocation: formData.birth_location || 'unknown'
      });

      if (response.data?.success) {
        const calcData = response.data.data;

        // Start with existing profile data to prevent overwriting
        const profileData = quantumProfile ? { ...quantumProfile } : {};

        // Merge in new calculated data
        Object.assign(profileData, {
          user_id: user.id,
          birth_date: formData.birth_date,
          birth_time: formData.birth_time || 'None',
          birth_location: formData.birth_location || 'None',
          full_name: formData.full_name,
          sun_sign: calcData.sun_sign || calcData.astrology?.sunSign || 'None',
          moon_sign: calcData.moon_sign || calcData.astrology?.moonSign || 'None',
          rising_sign: calcData.rising_sign || calcData.astrology?.ascendant || 'None',
          houses: calcData.houses || {},
          planets: calcData.planets || {},
          aspects: calcData.aspects || {},
          element: calcData.element || calcData.astrology?.element || 'None',
          dominant_element: calcData.dominant_element || calcData.astrology?.dominantElement || 'None',
          chinese_zodiac: calcData.chinese_zodiac || calcData.astrology?.chineseZodiac || 'None',
          chinese_animal: calcData.chinese_animal || calcData.astrology?.chineseAnimal || 'None',
          chinese_element: calcData.chinese_element || calcData.astrology?.chineseElement || 'None',
          life_path_number: calcData.life_path_number || calcData.lifePath?.reduced || 0,
          expression_number: calcData.expression_number || calcData.expression?.reduced || 0,
          soul_urge_number: calcData.soul_urge_number || calcData.soulUrge?.reduced || 0,
          personality_number: calcData.personality_number || calcData.personality?.reduced || 0,
          birthday_number: calcData.birthday_number || calcData.birthday?.reduced || 0,
          master_numbers: (calcData.masterNumbers || []).join(', ') || 'None',
          karmic_debt: (calcData.karmicDebt?.locations || '') || 'None',
          karmic_lessons: (calcData.karmicLessons?.lessons || []).join(', ') || 'None',
          dominant_polarity: calcData.astrology?.dominantPolarity || 'None',
          preferred_keys: calcData.astrology?.preferredKeys || [],
          preferred_tempos: calcData.astrology?.preferredTempos || [],
          mood_preferences: calcData.astrology?.moodPreferences || {},
          job_history: jobs,
          family_data: { members: familyMembers },
          hobbies: hobbies
        });

        if (quantumProfile) {
          const updated = await base44.entities.QuantumProfile.update(quantumProfile.id, profileData);
          setQuantumProfile(updated);
        } else {
          const created = await base44.entities.QuantumProfile.create(profileData);
          setQuantumProfile(created);
        }

        alert('Profile calculated successfully! Now generate your QuantumID.');
      }
    } catch (error) {
      alert('Error calculating profile: ' + error.message);
    } finally {
      setCalculating(false);
    }
  };
  
  const generateQuantumID = async () => {
    if (!quantumProfile?.planets || !quantumProfile?.life_path_number) {
      alert('Please calculate your profile first before generating QuantumID');
      return;
    }
    
    setGenerating(true);
    try {
      const response = await base44.functions.invoke('generateQuantumID', {
        userProfileId: quantumProfile.id,
        planets: quantumProfile.planets,
        lifePathNumber: quantumProfile.life_path_number,
        birthDate: quantumProfile.birth_date,
        fullName: quantumProfile.full_name
      });
      
      if (response.data?.success) {
        const qData = response.data;
        
        // Update quantum profile with ID data
        const updated = await base44.entities.QuantumProfile.update(quantumProfile.id, {
          quantum_id: qData.quantumID,
          planetary_codes: qData.planetaryCodes,
          protection_hash: qData.protectionHash,
          short_code_report: qData.shortCodeReport,
          blockchain_ready: true,
          export_data: qData.exportData
        });
        
        setQuantumProfile(updated);
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
      alert('Calculate profile first before saving additional data');
      return;
    }

    setSaving(true);
    try {
      // Merge new data with all existing fields
      const updateData = {
        ...quantumProfile,
        job_history: jobs,
        family_data: { members: familyMembers },
        hobbies: hobbies
      };
      const updated = await base44.entities.QuantumProfile.update(quantumProfile.id, updateData);
      setQuantumProfile(updated);
      alert('Profile saved successfully!');
    } catch (error) {
      alert('Error saving: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

          const handleParseResumeText = async () => {
            if (!resumeText.trim()) {
              alert('Please paste your resume text');
              return;
            }

            setParsing(true);
            try {
              const response = await base44.functions.invoke('parseResume', { resume_text: resumeText });

              if (response.data?.success) {
                const parsed = response.data.data;
                setParsedJobs({
                  skills: parsed.skills || [],
                  education: parsed.education || [],
                  years_exp: parsed.years_experience || 0,
                  jobs: parsed.job_history || []
                });
              } else {
                alert('Error parsing resume: ' + response.data?.error);
              }
            } catch (error) {
              alert('Error parsing resume: ' + error.message);
            } finally {
              setParsing(false);
            }
          };

          const confirmParsedData = () => {
            if (parsedJobs?.roles) {
              // Parse roles string into job objects
              const rolesList = parsedJobs.roles.split(';').map(role => {
                const match = role.match(/(.+?)\sat\s(.+?)\s\((.+?)\)/);
                return {
                  position: match?.[1]?.trim() || 'Position',
                  employer: match?.[2]?.trim() || 'Company',
                  start_date: '',
                  end_date: '',
                  responsibilities: '',
                  skills: parsedJobs.skills?.split(',').map(s => s.trim()) || []
                };
              });
              setJobs([...jobs, ...rolesList]);
            }
            setParsedJobs(null);
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
        {quantumProfile?.quantum_id && (
          <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-4 mb-6 flex items-center gap-3">
            <Check className="w-5 h-5 text-green-400" />
            <div>
              <p className="text-green-300 font-semibold">QuantumID Generated</p>
              <p className="text-green-200 text-sm">Your self-sovereign identity has been created and is blockchain-ready</p>
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <Shield className="w-8 h-8 text-cyan-400" />
              Quantum Profile
            </h1>
            <p className="text-purple-200 mt-2">Self-sovereign identity with blockchain-ready export</p>
          </div>
          
          {quantumProfile?.quantum_id && (
            <Button onClick={downloadReport} variant="outline" className="border-cyan-500/30 text-cyan-300">
              <Download className="w-4 h-4 mr-2" />
              Export Backup
            </Button>
          )}
        </div>
        
        {/* Profile Setup Section */}
        <Card className="bg-slate-900/50 backdrop-blur-sm border-purple-500/30 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-purple-300 text-sm">Full Name</label>
                <Input
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  placeholder="Enter your full name"
                  className="bg-slate-800 border-purple-500/30 text-white mt-2"
                />
              </div>
              <div>
                <label className="text-purple-300 text-sm">Birth Date</label>
                <Input
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => setFormData({...formData, birth_date: e.target.value})}
                  className="bg-slate-800 border-purple-500/30 text-white mt-2"
                />
              </div>
              <div>
                <label className="text-purple-300 text-sm">Birth Time (optional)</label>
                <Input
                  value={formData.birth_time}
                  onChange={(e) => setFormData({...formData, birth_time: e.target.value})}
                  placeholder="e.g., 14:30 or morning"
                  className="bg-slate-800 border-purple-500/30 text-white mt-2"
                />
              </div>
              <div>
                <label className="text-purple-300 text-sm">Birth Location (optional)</label>
                <Input
                  value={formData.birth_location}
                  onChange={(e) => setFormData({...formData, birth_location: e.target.value})}
                  placeholder="City, Country"
                  className="bg-slate-800 border-purple-500/30 text-white mt-2"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={calculateProfile}
                disabled={calculating}
                className="bg-gradient-to-r from-purple-600 to-pink-600"
              >
                {calculating ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Calculate Profile
              </Button>
              
              {quantumProfile?.planets && (
                <div className="text-green-400 flex items-center gap-2">
                  ✓ Profile calculated
                </div>
              )}
            </div>
            
            {quantumProfile && (
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="bg-slate-800 p-3 rounded-lg">
                  <p className="text-purple-300 text-xs">Life Path</p>
                  <p className="text-white font-bold text-xl">{quantumProfile.life_path_number || 'None'}</p>
                </div>
                <div className="bg-slate-800 p-3 rounded-lg">
                  <p className="text-purple-300 text-xs">Sun Sign</p>
                  <p className="text-white font-bold">{quantumProfile.sun_sign || 'None'}</p>
                </div>
                <div className="bg-slate-800 p-3 rounded-lg">
                  <p className="text-purple-300 text-xs">Moon Sign</p>
                  <p className="text-white font-bold">{quantumProfile.moon_sign || 'None'}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* QuantumID Display */}
        <Card className="bg-slate-900/50 backdrop-blur-sm border-purple-500/30 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-cyan-400" />
              QuantumID Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {quantumProfile?.quantum_id ? (
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
                <p className="text-purple-200 mb-4">
                  {quantumProfile?.planets ? 'Profile calculated - ready to generate QuantumID' : 'Calculate your profile first'}
                </p>
                <Button
                  onClick={generateQuantumID}
                  disabled={generating || !quantumProfile?.planets || quantumProfile?.quantum_id}
                  className="bg-gradient-to-r from-cyan-600 to-purple-600"
                >
                  {generating ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Shield className="w-4 h-4 mr-2" />
                  )}
                  {quantumProfile?.quantum_id ? 'QuantumID Already Generated' : 'Generate QuantumID'}
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
                {/* Resume Paste */}
                  <div className="bg-slate-800 p-4 rounded-lg border border-purple-500/20">
                    <label className="text-purple-300 text-sm font-semibold mb-3 block">
                      Quick Import: Paste Resume Text
                    </label>
                    <Textarea
                      placeholder="Paste your resume content here..."
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      disabled={parsing}
                      className="bg-slate-700 border-purple-500/30 text-white min-h-40"
                    />
                    <Button
                      onClick={handleParseResumeText}
                      disabled={parsing || !resumeText.trim()}
                      className="mt-3 bg-purple-600 hover:bg-purple-700 w-full"
                    >
                      {parsing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Parsing...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Parse Resume
                        </>
                      )}
                    </Button>
                  </div>

                {/* Parsed Data Confirmation */}
                {parsedJobs && (
                  <div className="bg-cyan-900/30 border border-cyan-500/50 p-4 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-cyan-300 font-semibold">Parsed Resume Data</h4>
                      <button
                        onClick={() => setParsedJobs(null)}
                        className="text-cyan-400 hover:text-cyan-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {parsedJobs.education && (
                      <div>
                        <p className="text-purple-300 text-xs">Education</p>
                        <p className="text-cyan-200">{parsedJobs.education}</p>
                      </div>
                    )}

                    {parsedJobs.years_exp && (
                      <div>
                        <p className="text-purple-300 text-xs">Years of Experience</p>
                        <p className="text-cyan-200">{parsedJobs.years_exp}+</p>
                      </div>
                    )}

                    {parsedJobs.skills && (
                      <div>
                        <p className="text-purple-300 text-xs">Skills</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {parsedJobs.skills.split(',').map((skill, i) => (
                            <span key={i} className="bg-purple-600/30 px-2 py-1 rounded text-xs text-cyan-200">
                              {skill.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {parsedJobs.jobs && parsedJobs.jobs.length > 0 && (
                          <div>
                            <p className="text-purple-300 text-xs">Job History</p>
                            <div className="space-y-2 mt-2">
                              {parsedJobs.jobs.map((job, i) => (
                                <div key={i} className="text-cyan-200 text-sm bg-slate-700 p-2 rounded">
                                  <p className="font-semibold">{job.position} at {job.employer}</p>
                                  <p className="text-xs text-purple-300">{job.start_date} - {job.end_date}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                    <div className="flex gap-2 mt-4">
                      <Button
                        onClick={confirmParsedData}
                        className="bg-green-600 hover:bg-green-700 flex-1"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Add to Jobs
                      </Button>
                      <Button
                        onClick={() => setParsedJobs(null)}
                        variant="outline"
                        className="border-purple-500/30 text-purple-200 flex-1"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Dismiss
                      </Button>
                    </div>
                  </div>
                )}

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
                    <div key={idx} className="bg-slate-800 p-4 rounded-lg border border-purple-500/20 flex justify-between items-start">
                      <div className="flex-1">
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
                      <button
                        onClick={() => setJobs(jobs.filter((_, i) => i !== idx))}
                        className="text-red-400 hover:text-red-300 ml-4"
                      >
                        <X className="w-5 h-5" />
                      </button>
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