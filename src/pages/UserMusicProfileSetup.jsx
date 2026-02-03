import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, Music, Star } from 'lucide-react';

export default function UserMusicProfileSetup() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    birth_date: '',
    birth_time: '',
    birth_location: '',
    full_name: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const currentUser = await base44.auth.me();
      if (!currentUser) {
        base44.auth.redirectToLogin();
        return;
      }
      setUser(currentUser);

      const profiles = await base44.entities.UserMusicProfile.filter({ user_id: currentUser.id });
      if (profiles.length > 0) {
        const p = profiles[0];
        setProfile(p);
        setFormData({
          birth_date: p.birth_date || '',
          birth_time: p.birth_time || '',
          birth_location: p.birth_location || '',
          full_name: p.full_name || ''
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.birth_date || !formData.full_name) {
      alert('Please fill in at least Birth Date and Full Name');
      return;
    }

    setSaving(true);
    try {
      // Calculate numerology and astrology
      const response = await base44.functions.invoke('calculateNumerology', {
        type: 'name',
        name: formData.full_name,
        birthDate: formData.birth_date
      });

      if (response.data?.success) {
        const calc = response.data.data;

        const profileData = {
          user_id: user.id,
          birth_date: formData.birth_date,
          birth_time: formData.birth_time || null,
          birth_location: formData.birth_location || null,
          full_name: formData.full_name,
          life_path_number: calc.lifePath?.reduced || 0,
          expression_number: calc.expression?.reduced || 0,
          soul_urge_number: calc.soulUrge?.reduced || 0,
          personality_number: calc.personality?.reduced || 0,
          birthday_number: calc.birthday?.reduced || 0,
          master_numbers: (calc.masterNumbers || []).join(', '),
          karmic_debt: (calc.karmicDebt?.numbers || []).join(', '),
          karmic_lessons: (calc.karmicLessons?.lessons || []).join(', '),
          element: calc.astrology?.element || '',
          dominant_element: calc.astrology?.dominantElement || '',
          chinese_zodiac: calc.astrology?.chineseZodiac || '',
          chinese_animal: calc.astrology?.chineseAnimal || '',
          chinese_element: calc.astrology?.chineseElement || '',
          sun_sign: calc.astrology?.sign || '',
          moon_sign: calc.astrology?.moonSign || '',
          rising_sign: calc.astrology?.ascendant || ''
        };

        if (profile) {
          await base44.entities.UserMusicProfile.update(profile.id, profileData);
        } else {
          await base44.entities.UserMusicProfile.create(profileData);
        }

        await loadProfile();
        alert('Profile saved successfully!');
      } else {
        alert('Failed to calculate numerology');
      }
    } catch (error) {
      alert('Error saving profile: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-300" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-10 h-10 text-yellow-400" />
            <h1 className="text-4xl font-bold text-white">QuantumVibe</h1>
            <Music className="w-10 h-10 text-purple-400" />
          </div>
          <p className="text-purple-200 text-lg">Cosmic Music Recommendations Based on Your Unique Energy</p>
        </div>

        <Card className="bg-slate-900/50 backdrop-blur-sm border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              Your Cosmic Profile
            </CardTitle>
            <CardDescription className="text-purple-200">
              Enter your birth details to unlock personalized music recommendations aligned with your numerology and astrology
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="full_name" className="text-purple-200">Full Name *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="bg-slate-800 border-purple-500/30 text-white mt-2"
                placeholder="Your full name for numerology"
              />
            </div>

            <div>
              <Label htmlFor="birth_date" className="text-purple-200">Birth Date * (YYYY-MM-DD)</Label>
              <Input
                id="birth_date"
                value={formData.birth_date}
                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                className="bg-slate-800 border-purple-500/30 text-white mt-2"
                placeholder="1990-05-15"
              />
            </div>

            <div>
              <Label htmlFor="birth_time" className="text-purple-200">Birth Time (optional)</Label>
              <Input
                id="birth_time"
                value={formData.birth_time}
                onChange={(e) => setFormData({ ...formData, birth_time: e.target.value })}
                className="bg-slate-800 border-purple-500/30 text-white mt-2"
                placeholder="14:30 or 'morning'"
              />
            </div>

            <div>
              <Label htmlFor="birth_location" className="text-purple-200">Birth Location (optional)</Label>
              <Input
                id="birth_location"
                value={formData.birth_location}
                onChange={(e) => setFormData({ ...formData, birth_location: e.target.value })}
                className="bg-slate-800 border-purple-500/30 text-white mt-2"
                placeholder="City, Country"
              />
            </div>

            {profile && (
              <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <h3 className="text-purple-300 font-semibold mb-2">Your Cosmic Numbers</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-purple-400">Life Path:</span>
                    <span className="text-yellow-300 ml-2 font-bold">{profile.life_path_number}</span>
                  </div>
                  <div>
                    <span className="text-purple-400">Expression:</span>
                    <span className="text-pink-300 ml-2 font-bold">{profile.expression_number}</span>
                  </div>
                  <div>
                    <span className="text-purple-400">Soul Urge:</span>
                    <span className="text-blue-300 ml-2 font-bold">{profile.soul_urge_number}</span>
                  </div>
                  <div>
                    <span className="text-purple-400">Sun Sign:</span>
                    <span className="text-orange-300 ml-2 font-bold">{profile.sun_sign}</span>
                  </div>
                </div>
              </div>
            )}

            <Button
              onClick={handleSave}
              disabled={saving || !formData.birth_date || !formData.full_name}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Calculating Your Cosmic Profile...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  {profile ? 'Update Profile' : 'Create Profile & Discover Music'}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}