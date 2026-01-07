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

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    const u = await base44.auth.me();
    setUser(u);
    setBirthDate(u.birth_date || '');
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

      // Auto-classify based on numerology
      const classifyResponse = await base44.functions.invoke('classifyArchetype', {
        personId: user.id,
        entityType: 'User'
      });

      if (classifyResponse.data?.success) {
        await base44.auth.updateMe({
          archetype_primary_calculated: classifyResponse.data.data.primary,
          archetype_secondary_calculated: classifyResponse.data.data.secondary
        });
      }

      loadProfile();
    }
    setCalculating(false);
  };

  const handleTestComplete = async (results) => {
    await base44.auth.updateMe({
      archetype_primary_test: results.primary,
      archetype_secondary_test: results.secondary,
      archetype_test_scores: JSON.stringify(results.scores)
    });

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

  const testArchetype = user.archetype_primary_test;
  const calculatedArchetype = user.archetype_primary_calculated;
  const archetypesMatch = testArchetype && calculatedArchetype && testArchetype === calculatedArchetype;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-8 h-8 text-teal-400" />
          <h1 className="text-3xl font-bold text-white">My Profile</h1>
        </div>

        {/* Basic Info */}
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-gray-300 text-sm mb-2 block">Full Name</label>
              <Input
                value={user.full_name}
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
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="bg-slate-900 border-slate-700 text-white"
                />
                <Button
                  onClick={calculateNumerology}
                  disabled={calculating || !birthDate}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  {calculating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Calculate'
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Numerology */}
        {user.life_path_western && (
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 mb-6">
            <CardHeader>
              <CardTitle className="text-white">Numerology Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Life Path</p>
                  <p className="text-2xl font-bold text-amber-400">{user.life_path_western}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Expression</p>
                  <p className="text-2xl font-bold text-purple-400">{user.expression_western}</p>
                </div>
                {user.master_numbers && (
                  <div>
                    <p className="text-gray-400 text-sm">Master Numbers</p>
                    <p className="text-xl font-bold text-amber-300">✨ {user.master_numbers}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Archetype Analysis */}
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Team Archetype Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!testArchetype && (
              <Button
                onClick={() => setShowTest(true)}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <FlaskConical className="w-4 h-4 mr-2" />
                Take Archetype Assessment
              </Button>
            )}

            {testArchetype && calculatedArchetype && (
              <>
                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="bg-slate-900/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white text-sm">Self-Assessment Result</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className={`text-2xl font-bold capitalize ${getArchetypeColor(testArchetype)}`}>
                        {testArchetype}
                      </p>
                      {user.archetype_secondary_test && (
                        <p className={`text-sm capitalize ${getArchetypeColor(user.archetype_secondary_test)}`}>
                          Secondary: {user.archetype_secondary_test}
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-900/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white text-sm">Numerology-Based Result</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className={`text-2xl font-bold capitalize ${getArchetypeColor(calculatedArchetype)}`}>
                        {calculatedArchetype}
                      </p>
                      {user.archetype_secondary_calculated && (
                        <p className={`text-sm capitalize ${getArchetypeColor(user.archetype_secondary_calculated)}`}>
                          Secondary: {user.archetype_secondary_calculated}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Match Analysis */}
                <Card className={`border-2 ${archetypesMatch ? 'border-green-500 bg-green-500/10' : 'border-amber-500 bg-amber-500/10'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {archetypesMatch ? (
                        <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                      ) : (
                        <AlertCircle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
                      )}
                      <div>
                        <h3 className={`font-semibold mb-1 ${archetypesMatch ? 'text-green-300' : 'text-amber-300'}`}>
                          {archetypesMatch ? 'Perfect Match!' : 'Different Results'}
                        </h3>
                        <p className="text-gray-300 text-sm">
                          {archetypesMatch
                            ? 'Your self-assessment aligns perfectly with your numerology profile. This indicates strong self-awareness and authentic expression of your natural strengths.'
                            : `Your self-assessment shows you as a ${testArchetype}, while your numerology indicates ${calculatedArchetype}. This could mean you've adapted your natural tendencies to fit your environment, or you're expressing different aspects of yourself. Both results are valid - numerology shows your innate nature, while the test reveals how you currently operate.`}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

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