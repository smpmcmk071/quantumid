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

  const getArchetypeDescription = (archetype) => {
    const descriptions = {
      visionary: {
        title: 'The Visionary',
        description: 'You excel at seeing the big picture and inspiring others with innovative ideas. You thrive in environments that value creativity, forward-thinking, and transformational change.',
        strengths: ['Strategic thinking', 'Innovation', 'Inspiring leadership', 'Future-focused', 'Adaptable to change'],
        workStyle: 'You prefer autonomy and the freedom to explore new possibilities. You excel in roles that require conceptual thinking and long-term planning.'
      },
      strategist: {
        title: 'The Strategist',
        description: 'You bring analytical rigor and systematic thinking to every challenge. You excel at breaking down complex problems and creating efficient, data-driven solutions.',
        strengths: ['Analytical thinking', 'Problem-solving', 'Process optimization', 'Risk assessment', 'Detail-oriented'],
        workStyle: 'You thrive in structured environments with clear objectives. You excel when given time to analyze and plan before taking action.'
      },
      creator: {
        title: 'The Creator',
        description: 'You are action-oriented and results-driven, excelling at turning ideas into reality. You bring practical execution skills and a hands-on approach to every project.',
        strengths: ['Execution', 'Hands-on problem solving', 'Practical innovation', 'Results-focused', 'Resourceful'],
        workStyle: 'You prefer learning by doing and thrive in dynamic environments. You excel in roles that allow you to build, create, and see tangible outcomes.'
      },
      harmonizer: {
        title: 'The Harmonizer',
        description: 'You excel at building relationships and creating cohesive teams. You bring emotional intelligence and collaborative skills that strengthen organizational culture.',
        strengths: ['Team building', 'Conflict resolution', 'Empathy', 'Communication', 'Collaborative leadership'],
        workStyle: 'You thrive in team-oriented environments where collaboration is valued. You excel at facilitating communication and ensuring everyone feels heard.'
      }
    };
    return descriptions[archetype] || null;
  };

  const getLifePathInsight = (lifePathNumber) => {
    const insights = {
      1: 'Natural leader with strong independence and pioneering spirit',
      2: 'Diplomatic peacemaker with strong intuition and partnership skills',
      3: 'Creative communicator with natural charisma and expressive abilities',
      4: 'Practical builder focused on stability, organization, and hard work',
      5: 'Dynamic adventurer seeking freedom, variety, and progressive change',
      6: 'Nurturing caretaker focused on harmony, responsibility, and service',
      7: 'Analytical thinker with deep introspection and spiritual awareness',
      8: 'Ambitious achiever focused on material success and executive abilities',
      9: 'Humanitarian visionary with compassion and universal understanding',
      11: 'Master intuitive with heightened spiritual awareness and inspiration (Master Number)',
      22: 'Master builder capable of turning grand visions into reality (Master Number)',
      33: 'Master teacher focused on compassionate service and spiritual upliftment (Master Number)'
    };
    return insights[lifePathNumber] || 'Unique path of personal growth and development';
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
                  <label className="text-gray-300 text-sm mb-2 block">Confirm Your Birth Date (YYYY-MM-DD)</label>
                  <Input
                    type="text"
                    placeholder="1969-05-01"
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
              <label className="text-gray-300 text-sm mb-2 block">Birth Date (YYYY-MM-DD)</label>
              <Input
                type="text"
                placeholder="1969-05-01"
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
                <div className="p-6 bg-green-500/10 border-2 border-green-500 rounded-lg mb-6">
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

                {/* Detailed Archetype Profile */}
                {getArchetypeDescription(testArchetype) && (
                  <div className="space-y-6 mb-6">
                    <div className="p-6 bg-slate-900/50 rounded-lg border border-slate-700">
                      <h3 className={`text-2xl font-bold mb-3 capitalize ${getArchetypeColor(testArchetype)}`}>
                        {getArchetypeDescription(testArchetype).title}
                      </h3>
                      <p className="text-gray-300 mb-4">
                        {getArchetypeDescription(testArchetype).description}
                      </p>
                      
                      <div className="mb-4">
                        <h4 className="text-teal-400 font-semibold mb-2">Key Strengths</h4>
                        <div className="flex flex-wrap gap-2">
                          {getArchetypeDescription(testArchetype).strengths.map((strength, idx) => (
                            <span key={idx} className="px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full text-sm">
                              {strength}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-blue-400 font-semibold mb-2">Your Work Style</h4>
                        <p className="text-gray-300">{getArchetypeDescription(testArchetype).workStyle}</p>
                      </div>
                    </div>

                    {/* Secondary Archetype */}
                    {(user.archetype_secondary || linkedRecord?.archetype_secondary) && getArchetypeDescription(user.archetype_secondary || linkedRecord?.archetype_secondary) && (
                      <div className="p-6 bg-slate-900/30 rounded-lg border border-slate-700">
                        <h3 className={`text-xl font-bold mb-3 capitalize ${getArchetypeColor(user.archetype_secondary || linkedRecord?.archetype_secondary)}`}>
                          Secondary: {getArchetypeDescription(user.archetype_secondary || linkedRecord?.archetype_secondary).title}
                        </h3>
                        <p className="text-gray-300">
                          {getArchetypeDescription(user.archetype_secondary || linkedRecord?.archetype_secondary).description}
                        </p>
                      </div>
                    )}

                    {/* Numerology Insights */}
                    {linkedRecord && (linkedRecord.life_path_western || linkedRecord.expression_western) && (
                      <div className="p-6 bg-slate-900/50 rounded-lg border border-slate-700">
                        <h3 className="text-xl font-bold text-amber-400 mb-4">Your Numerology Profile</h3>
                        
                        {linkedRecord.life_path_western && (
                          <div className="mb-4">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-3xl font-bold text-amber-400">{linkedRecord.life_path_western}</span>
                              <div>
                                <h4 className="text-white font-semibold">Life Path Number</h4>
                                <p className="text-gray-400 text-sm">Your core purpose and natural tendencies</p>
                              </div>
                            </div>
                            <p className="text-gray-300 text-sm">{getLifePathInsight(linkedRecord.life_path_western)}</p>
                          </div>
                        )}

                        {linkedRecord.expression_western && (
                          <div className="mb-4">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-2xl font-bold text-purple-400">{linkedRecord.expression_western}</span>
                              <div>
                                <h4 className="text-white font-semibold">Expression Number</h4>
                                <p className="text-gray-400 text-sm">Your natural talents and abilities</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {linkedRecord.master_numbers && (
                          <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                            <h4 className="text-amber-300 font-semibold mb-2">✨ Master Numbers Present</h4>
                            <p className="text-gray-300 text-sm mb-2">{linkedRecord.master_numbers}</p>
                            <p className="text-gray-400 text-xs">Master numbers indicate heightened potential and spiritual significance in your path.</p>
                          </div>
                        )}

                        {linkedRecord.element && (
                          <div className="mt-4">
                            <h4 className="text-white font-semibold mb-1">Element: <span className="text-blue-400">{linkedRecord.element}</span></h4>
                            <p className="text-gray-400 text-sm">
                              {linkedRecord.element === 'Fire' && 'Dynamic, passionate, and driven by action'}
                              {linkedRecord.element === 'Earth' && 'Practical, stable, and focused on tangible results'}
                              {linkedRecord.element === 'Air' && 'Intellectual, communicative, and ideas-oriented'}
                              {linkedRecord.element === 'Water' && 'Intuitive, emotional, and relationship-focused'}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
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