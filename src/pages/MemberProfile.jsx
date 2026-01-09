import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, User } from 'lucide-react';
import { createPageUrl } from './utils';
import { Link } from 'react-router-dom';
import NumerologyAnalysisView from '../components/NumerologyAnalysisView';

export default function MemberProfile() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const memberId = params.get('id');
  const type = params.get('type') || 'TeamMember';

  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadPerson();
  }, [memberId, type]);

  const loadPerson = async () => {
    setLoading(true);
    try {
      if (type === 'TeamMember') {
        const members = await base44.entities.TeamMember.list();
        const member = members.find(m => m.id === memberId);
        setPerson(member);
      } else if (type === 'Candidate') {
        const candidates = await base44.entities.Candidate.list();
        const candidate = candidates.find(c => c.id === memberId);
        setPerson(candidate);
      }
    } catch (error) {
      console.error('Error loading person:', error);
    }
    setLoading(false);
  };

  const handleGenerateAnalysis = async (personId, entityType) => {
    setGenerating(true);
    try {
      const response = await base44.functions.invoke('generateNumerologyAnalysis', {
        personId,
        entityType
      });
      
      if (response.data?.success) {
        await loadPerson();
      } else {
        alert('Failed to generate analysis');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 p-6 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
      </div>
    );
  }

  if (!person) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 p-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-gray-400">Person not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link 
            to={createPageUrl(type === 'TeamMember' ? 'Teams' : 'Candidates')} 
            className="inline-flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to {type === 'TeamMember' ? 'Teams' : 'Candidates'}
          </Link>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">{person.full_name}</h1>
            <p className="text-gray-400">{person.role || 'Candidate'}</p>
          </div>
        </div>

        <div className="grid gap-6 mb-6">
          {/* Basic Numerology Summary */}
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Numerology Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-sm text-gray-400 mb-2">Life Path</h3>
                  <p className="text-2xl font-bold text-amber-400">{person.life_path_western}</p>
                </div>
                <div>
                  <h3 className="text-sm text-gray-400 mb-2">Expression</h3>
                  <p className="text-2xl font-bold text-purple-400">{person.expression_western}</p>
                </div>
                <div>
                  <h3 className="text-sm text-gray-400 mb-2">Soul Urge</h3>
                  <p className="text-2xl font-bold text-pink-400">{person.soul_urge_western}</p>
                </div>
                <div>
                  <h3 className="text-sm text-gray-400 mb-2">Personality</h3>
                  <p className="text-2xl font-bold text-blue-400">{person.personality_western}</p>
                </div>
                <div>
                  <h3 className="text-sm text-gray-400 mb-2">Master Numbers</h3>
                  <p className="text-lg font-semibold text-teal-400">{person.master_numbers || 'None'}</p>
                </div>
                <div>
                  <h3 className="text-sm text-gray-400 mb-2">Karmic Lessons</h3>
                  <p className="text-lg font-semibold text-orange-400">{person.karmic_lessons || 'None'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Astrology Summary */}
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Astrological Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <h3 className="text-sm text-gray-400 mb-1">Sun Sign</h3>
                  <p className="text-lg font-semibold text-white">{person.sun_sign}</p>
                </div>
                <div>
                  <h3 className="text-sm text-gray-400 mb-1">Moon Sign</h3>
                  <p className="text-lg font-semibold text-white">{person.moon_sign}</p>
                </div>
                <div>
                  <h3 className="text-sm text-gray-400 mb-1">Ascendant</h3>
                  <p className="text-lg font-semibold text-white">{person.ascendant}</p>
                </div>
                <div>
                  <h3 className="text-sm text-gray-400 mb-1">Chinese Zodiac</h3>
                  <p className="text-lg font-semibold text-white">{person.chinese_zodiac}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analysis Section */}
        <NumerologyAnalysisView 
          person={person}
          entityType={type}
          onGenerate={handleGenerateAnalysis}
          generating={generating}
        />
      </div>
    </div>
  );
}