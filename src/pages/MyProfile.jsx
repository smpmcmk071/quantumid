import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Loader2, FlaskConical, CheckCircle2, AlertCircle, Link2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ArchetypeTest from '../components/candidates/ArchetypeTest';

export default function MyProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTest, setShowTest] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [birthDate, setBirthDate] = useState('');
  const [linkedRecord, setLinkedRecord] = useState(null);
  const [recordType, setRecordType] = useState(null);
  const [allCandidates, setAllCandidates] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [selectedProfileType, setSelectedProfileType] = useState('');
  const [confirmBirthDate, setConfirmBirthDate] = useState('');
  const [linking, setLinking] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    const u = await base44.auth.me();
    setUser(u);
    
    // Try to find linked Candidate or TeamMember by email (case-insensitive)
    const candidates = await base44.entities.Candidate.list();
    const candidate = candidates.find(c => c.email?.toLowerCase() === u.email.toLowerCase());
    
    if (candidate) {
      setLinkedRecord(candidate);
      setRecordType('Candidate');
      setBirthDate(candidate.birth_date || u.birth_date || '');
    } else {
      const members = await base44.entities.TeamMember.list();
      const member = members.find(m => m.email?.toLowerCase() === u.email.toLowerCase());
      
      if (member) {
        setLinkedRecord(member);
        setRecordType('TeamMember');
        setBirthDate(member.birth_date || u.birth_date || '');
      } else {
        // No match found - store all for manual selection
        setAllCandidates(candidates);
        setAllMembers(members);
        setBirthDate(u.birth_date || '');
      }
    }
    
    setLoading(false);
  };

  const linkProfile = async () => {
    if (!selectedProfileId || !selectedProfileType || !confirmBirthDate) {
      alert('Please select your profile and confirm your birth date');
      return;
    }

    setLinking(true);

    try {
      const selectedRecord = selectedProfileType === 'Candidate' 
        ? allCandidates.find(c => c.id === selectedProfileId)
        : allMembers.find(m => m.id === selectedProfileId);

      if (!selectedRecord) {
        alert('Profile not found');
        return;
      }

      if (selectedRecord.birth_date !== confirmBirthDate) {
        alert('Birth date does not match. Please verify your information.');
        setLinking(false);
        return;
      }

      // Update the record with user's email
      if (selectedProfileType === 'Candidate') {
        await base44.entities.Candidate.update(selectedProfileId, { email: user.email });
      } else {
        await base44.entities.TeamMember.update(selectedProfileId, { email: user.email });
      }

      // Reload profile
      await loadProfile();
    } catch (error) {
      alert('Error linking profile: ' + error.message);
    } finally {
      setLinking(false);
    }
  };

  const calculateNumerology = async () => {
    if (!birthDate) {
      alert('Please enter your birth date first');
      return;
    }

    setCalculating(true);
    const response = await base44.functions.invoke('calculateNumerology', {
      type: 'name',
      name: user.full_name,
      birthDate: birthDate
    });

    if (response.data?.success) {
      const calc = response.data.data;
      await base44.auth.updateMe({
        birth_date: birthDate,
        life_path_western: calc.lifePath?.reduced || 0,
        expression_western: calc.expression?.reduced || 0,
        master_numbers: calc.masterNumbers?.join(', ') || ''
      });

      // Reload user to get updated data with fresh ID
      const updatedUser = await base44.auth.me();

      // Auto-classify based on numerology
      if (updatedUser.id && updatedUser.life_path_western) {
        const classifyResponse = await base44.functions.invoke('classifyArchetype', {
          personId: updatedUser.id,
          entityType: 'User'
        });

        if (classifyResponse.data?.success) {
          await base44.auth.updateMe({
            archetype_primary_calculated: classifyResponse.data.data.primary,
            archetype_secondary_calculated: classifyResponse.data.data.secondary
          });
        }
      }

      loadProfile();
    }
    setCalculating(false);
  };

  const handleTestComplete = async (results) => {
    // Save to User entity
    await base44.auth.updateMe({
      archetype_primary: results.primary,
      archetype_secondary: results.secondary
    });

    // Also save to linked Candidate or TeamMember record
    if (linkedRecord && recordType) {
      if (recordType === 'Candidate') {
        await base44.entities.Candidate.update(linkedRecord.id, {
          archetype_primary: results.primary,
          archetype_secondary: results.secondary
        });
      } else if (recordType === 'TeamMember') {
        await base44.entities.TeamMember.update(linkedRecord.id, {
          archetype_primary: results.primary,
          archetype_secondary: results.secondary
        });
      }
    }

    setShowTest(false);
    loadProfile();
  };

  const getArchetypeColor = (archetype) => {
    const colors = {
      visionary: 'text-purple-400',
      strategist: 'text-blue-400',
      creator: 'text-amber-400',
      harmonizer: 'text-green-400'
    };
    return colors[archetype] || 'text-gray-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 p-6 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
      </div>
    );
  }

  const testArchetype = user.archetype_primary || linkedRecord?.archetype_primary;
  const hasCompletedTest = !!testArchetype;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-8 h-8 text-teal-400" />
          <h1 className="text-3xl font-bold text-white">Welcome, {user.full_name}</h1>
        </div>

        {linkedRecord ? (
          <Card className="bg-teal-500/10 border-teal-500 mb-6">
            <CardContent className="p-4">
              <p className="text-teal-300">
                ✓ We found your {recordType === 'Candidate' ? 'candidate' : 'team member'} record. Please verify your information below and complete your archetype assessment.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-amber-500/10 border-amber-500 mb-6">
            <CardHeader>
              <CardTitle className="text-amber-300 flex items-center gap-2">
                <Link2 className="w-5 h-5" />
                Link Your Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300 text-sm">
                We couldn't auto-match your email. Please select your profile below and confirm your birth date to link your account.
              </p>

              <div>
                <label className="text-gray-300 text-sm mb-2 block">Select Your Profile Type</label>
                <Select value={selectedProfileType} onValueChange={setSelectedProfileType}>
                  <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                    <SelectValue placeholder="Choose..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Candidate">Candidate</SelectItem>
                    <SelectItem value="TeamMember">Team Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedProfileType && (
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Select Your Name</label>
                  <Select value={selectedProfileId} onValueChange={setSelectedProfileId}>
                    <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                      <SelectValue placeholder="Choose your name..." />
                    </SelectTrigger>
                    <SelectContent>
                      {(selectedProfileType === 'Candidate' ? allCandidates : allMembers).map(record => (
                        <SelectItem key={record.id} value={record.id}>
                          {record.full_name} {record.birth_date ? `(${record.birth_date})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedProfileId && (
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Confirm Your Birth Date</label>
                  <Input
                    type="date"
                    value={confirmBirthDate}
                    onChange={(e) => setConfirmBirthDate(e.target.value)}
                    className="bg-slate-900 border-slate-700 text-white"
                  />
                  <p className="text-gray-400 text-xs mt-1">Enter your birth date to verify your identity</p>
                </div>
              )}

              <Button
                onClick={linkProfile}
                disabled={!selectedProfileId || !confirmBirthDate || linking}
                className="w-full bg-teal-600 hover:bg-teal-700"
              >
                {linking ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Linking Profile...
                  </>
                ) : (
                  <>
                    <Link2 className="w-4 h-4 mr-2" />
                    Link My Profile
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Basic Info */}
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Your Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-gray-300 text-sm mb-2 block">Full Name</label>
              <Input
                value={linkedRecord?.full_name || user.full_name}
                disabled
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>
            <div>
              <label className="text-gray-300 text-sm mb-2 block">Email</label>
              <Input
                value={user.email}
                disabled
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>
            <div>
              <label className="text-gray-300 text-sm mb-2 block">Birth Date</label>
              <Input
                type="date"
                value={birthDate}
                disabled
                className="bg-slate-900 border-slate-700 text-white"
              />
              <p className="text-gray-400 text-xs mt-1">This was provided by your organization</p>
            </div>
            {linkedRecord?.role && (
              <div>
                <label className="text-gray-300 text-sm mb-2 block">Role</label>
                <Input
                  value={linkedRecord.role}
                  disabled
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Archetype Assessment */}
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Team Archetype Assessment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!linkedRecord ? (
              <div className="text-center py-8">
                <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <p className="text-gray-300">Cannot complete assessment until your record is found.</p>
                <p className="text-gray-400 text-sm mt-2">Please contact your administrator.</p>
              </div>
            ) : !hasCompletedTest ? (
              <>
                <p className="text-gray-300 text-sm mb-4">
                  Complete this quick assessment to discover your team archetype. This helps your organization understand how you work best and where you'll thrive.
                </p>
                <Button
                  onClick={() => setShowTest(true)}
                  className="w-full bg-purple-600 hover:bg-purple-700 h-12 text-lg"
                >
                  <FlaskConical className="w-5 h-5 mr-2" />
                  Start Assessment
                </Button>
              </>
            ) : (
              <>
                <div className="p-6 bg-green-500/10 border-2 border-green-500 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle2 className="w-8 h-8 text-green-400" />
                    <h3 className="text-xl font-bold text-green-300">Assessment Complete!</h3>
                  </div>
                  <p className="text-gray-300 mb-4">Your archetype has been determined:</p>
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Primary Archetype</p>
                      <p className={`text-3xl font-bold capitalize ${getArchetypeColor(testArchetype)}`}>
                        {testArchetype}
                      </p>
                    </div>
                    {(user.archetype_secondary || linkedRecord?.archetype_secondary) && (
                      <div>
                        <p className="text-gray-400 text-sm mb-1">Secondary</p>
                        <p className={`text-xl font-semibold capitalize ${getArchetypeColor(user.archetype_secondary || linkedRecord?.archetype_secondary)}`}>
                          {user.archetype_secondary || linkedRecord?.archetype_secondary}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <p className="text-gray-400 text-sm text-center">
                  Your results have been saved. You can close this page or retake the assessment below.
                </p>

                <Button
                  onClick={() => setShowTest(true)}
                  variant="outline"
                  className="w-full border-slate-700 text-gray-300"
                >
                  Retake Assessment
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Archetype Test Dialog */}
        {showTest && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto p-4">
            <div className="max-w-2xl mx-auto my-8">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">
                    Team Archetype Assessment
                  </CardTitle>
                  <p className="text-gray-400 text-sm mt-2">
                    Answer honestly about how you naturally work and think
                  </p>
                </CardHeader>
                <CardContent>
                  <ArchetypeTest
                    candidateName={user.full_name}
                    onComplete={handleTestComplete}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}