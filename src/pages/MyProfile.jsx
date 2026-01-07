import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Loader2, FlaskConical, CheckCircle2, AlertCircle } from 'lucide-react';
import ArchetypeTest from '../components/candidates/ArchetypeTest';

export default function MyProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTest, setShowTest] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [birthDate, setBirthDate] = useState('');
  const [linkedRecord, setLinkedRecord] = useState(null);
  const [recordType, setRecordType] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    const u = await base44.auth.me();
    setUser(u);
    
    // Try to find linked Candidate or TeamMember by email
    const candidates = await base44.entities.Candidate.filter({ email: u.email });
    if (candidates.length > 0) {
      const candidate = candidates[0];
      setLinkedRecord(candidate);
      setRecordType('Candidate');
      setBirthDate(candidate.birth_date || u.birth_date || '');
    } else {
      const teamMembers = await base44.entities.TeamMember.filter({ email: u.email });
      if (teamMembers.length > 0) {
        const member = teamMembers[0];
        setLinkedRecord(member);
        setRecordType('TeamMember');
        setBirthDate(member.birth_date || u.birth_date || '');
      } else {
        setBirthDate(u.birth_date || '');
      }
    }
    
    setLoading(false);
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
          <Card className="bg-red-500/10 border-red-500 mb-6">
            <CardContent className="p-4">
              <div className="space-y-2">
                <p className="text-red-300 font-semibold">⚠️ No Record Found</p>
                <p className="text-gray-300 text-sm">
                  We couldn't find a candidate or team member record matching your email ({user.email}).
                </p>
                <p className="text-gray-300 text-sm">
                  Please contact your administrator and verify:
                </p>
                <ul className="text-gray-400 text-xs ml-4 list-disc">
                  <li>Your email was entered correctly when you were added as a candidate/team member</li>
                  <li>You're signing in with the exact same email address</li>
                </ul>
              </div>
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