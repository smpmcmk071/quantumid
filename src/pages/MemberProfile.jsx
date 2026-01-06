import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, User, Target, Sparkles, TrendingUp, Plus, Trash2 } from 'lucide-react';

export default function MemberProfile() {
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState('');

  useEffect(() => {
    loadMember();
  }, []);

  const loadMember = async () => {
    setLoading(true);
    const urlParams = new URLSearchParams(window.location.search);
    const memberId = urlParams.get('id');
    
    if (memberId) {
      const members = await base44.entities.TeamMember.filter({ id: memberId });
      if (members.length > 0) {
        const m = members[0];
        setMember(m);
        setSkills(m.skills ? m.skills.split(',').map(s => s.trim()).filter(Boolean) : []);
        setGoals(m.development_goals ? m.development_goals.split('|||').filter(Boolean) : []);
      }
    }
    setLoading(false);
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      const updatedSkills = [...skills, newSkill.trim()];
      setSkills(updatedSkills);
      setNewSkill('');
      saveSkills(updatedSkills);
    }
  };

  const removeSkill = (index) => {
    const updatedSkills = skills.filter((_, i) => i !== index);
    setSkills(updatedSkills);
    saveSkills(updatedSkills);
  };

  const saveSkills = async (updatedSkills) => {
    await base44.entities.TeamMember.update(member.id, {
      skills: updatedSkills.join(', ')
    });
  };

  const addGoal = () => {
    if (newGoal.trim()) {
      const updatedGoals = [...goals, newGoal.trim()];
      setGoals(updatedGoals);
      setNewGoal('');
      saveGoals(updatedGoals);
    }
  };

  const removeGoal = (index) => {
    const updatedGoals = goals.filter((_, i) => i !== index);
    setGoals(updatedGoals);
    saveGoals(updatedGoals);
  };

  const saveGoals = async (updatedGoals) => {
    await base44.entities.TeamMember.update(member.id, {
      development_goals: updatedGoals.join('|||')
    });
  };

  const getArchetypeColor = (archetype) => {
    const colors = {
      visionary: 'text-amber-400 bg-amber-500/20 border-amber-500/30',
      strategist: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
      creator: 'text-purple-400 bg-purple-500/20 border-purple-500/30',
      harmonizer: 'text-green-400 bg-green-500/20 border-green-500/30'
    };
    return colors[archetype] || 'text-gray-400 bg-gray-500/20 border-gray-500/30';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 p-6 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
            <CardContent className="py-12 text-center">
              <User className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">Member not found</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">{member.full_name}</h1>
          <p className="text-gray-400">{member.role} • {member.seniority}</p>
        </div>

        {/* Archetype & Profile */}
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Archetype Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={`p-4 rounded-lg border ${getArchetypeColor(member.archetype_primary)}`}>
              <p className="text-sm opacity-75 mb-1">Primary Archetype</p>
              <h3 className="text-xl font-bold capitalize">{member.archetype_primary}</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-3 bg-slate-700/30 rounded-lg">
                <p className="text-gray-400 text-xs mb-1">Life Path</p>
                <p className="text-teal-400 text-2xl font-bold">{member.life_path_western}</p>
              </div>
              <div className="p-3 bg-slate-700/30 rounded-lg">
                <p className="text-gray-400 text-xs mb-1">Expression</p>
                <p className="text-purple-400 text-2xl font-bold">{member.expression_western}</p>
              </div>
            </div>

            {member.master_numbers && (
              <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/30">
                <p className="text-amber-300 font-semibold">✨ Master Numbers: {member.master_numbers}</p>
                <p className="text-gray-400 text-sm mt-1">High-potential leadership and collaboration capabilities</p>
              </div>
            )}

            {member.strengths && (
              <div>
                <h4 className="text-green-400 font-semibold mb-2">Strengths</h4>
                <p className="text-gray-300 text-sm">{member.strengths}</p>
              </div>
            )}

            {member.weaknesses && (
              <div>
                <h4 className="text-amber-400 font-semibold mb-2">Development Areas</h4>
                <p className="text-gray-300 text-sm">{member.weaknesses}</p>
              </div>
            )}

            {member.work_style_challenges && (
              <div>
                <h4 className="text-orange-400 font-semibold mb-2">Work Style Challenges</h4>
                <p className="text-gray-300 text-sm">{member.work_style_challenges}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Skills */}
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-400" />
              Skills & Experience
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Add a skill..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                className="bg-slate-900 border-slate-700 text-white"
              />
              <Button onClick={addSkill} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {skills.map((skill, idx) => (
                <div key={idx} className="px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 rounded-lg flex items-center gap-2">
                  <span className="text-blue-300 text-sm">{skill}</span>
                  <button
                    onClick={() => removeSkill(idx)}
                    className="text-blue-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {skills.length === 0 && (
                <p className="text-gray-500 text-sm">No skills added yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Development Goals */}
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              Development Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Textarea
                placeholder="Add a development goal related to team dynamics or archetypes..."
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                className="bg-slate-900 border-slate-700 text-white h-20"
              />
              <Button onClick={addGoal} className="bg-purple-600 hover:bg-purple-700 self-start">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-3">
              {goals.map((goal, idx) => (
                <div key={idx} className="p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                  <div className="flex items-start justify-between">
                    <p className="text-gray-300 text-sm flex-1">{goal}</p>
                    <button
                      onClick={() => removeGoal(idx)}
                      className="text-gray-400 hover:text-red-400 transition-colors ml-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {goals.length === 0 && (
                <p className="text-gray-500 text-sm">No development goals set yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}