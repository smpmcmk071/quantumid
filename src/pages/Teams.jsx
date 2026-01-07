import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, Plus, Loader2, UserPlus, Trash2, Pencil, FlaskConical, X } from 'lucide-react';
import ArchetypeTest from '../components/candidates/ArchetypeTest';

export default function Teams() {
  const [client, setClient] = useState(null);
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [showArchetypeTest, setShowArchetypeTest] = useState(false);
  const [testingMember, setTestingMember] = useState(null);

  const [newTeam, setNewTeam] = useState({ team_name: '', department: '', description: '' });
  const [newMember, setNewMember] = useState({
    full_name: '',
    email: '',
    birth_date: '',
    role: '',
    seniority: 'mid',
    work_style_challenges: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedTeam) {
      loadTeamMembers();
    }
  }, [selectedTeam]);

  const loadData = async () => {
    setLoading(true);
    const user = await base44.auth.me();
    const clients = await base44.entities.Client.filter({ admin_email: user.email });
    
    if (clients.length > 0) {
      const c = clients[0];
      setClient(c);
      const t = await base44.entities.Team.filter({ client_id: c.id });
      setTeams(t);
      if (t.length > 0) setSelectedTeam(t[0]);
    }
    setLoading(false);
  };

  const loadTeamMembers = async () => {
    if (!selectedTeam) return;
    const members = await base44.entities.TeamMember.filter({ team_id: selectedTeam.id });
    
    // Auto-classify members without archetypes
    for (const member of members) {
      if (!member.archetype_primary && member.life_path_western) {
        await base44.functions.invoke('classifyArchetype', {
          personId: member.id,
          entityType: 'TeamMember'
        });
      }
    }
    
    // Reload after classification
    const updatedMembers = await base44.entities.TeamMember.filter({ team_id: selectedTeam.id });
    setTeamMembers(updatedMembers);
  };

  const createTeam = async () => {
    if (!client) {
      alert('No client found');
      return;
    }
    if (!newTeam.team_name?.trim()) {
      alert('Please enter a team name');
      return;
    }
    
    try {
      console.log('Creating team:', { ...newTeam, client_id: client.id });
      const created = await base44.entities.Team.create({ 
        team_name: newTeam.team_name.trim(),
        department: newTeam.department?.trim() || '',
        description: newTeam.description?.trim() || '',
        client_id: client.id, 
        is_active: true 
      });
      console.log('Team created:', created);
      setNewTeam({ team_name: '', department: '', description: '' });
      setShowAddTeam(false);
      await loadData();
    } catch (error) {
      console.error('Error creating team:', error);
      alert('Error: ' + (error.message || 'Failed to create team'));
    }
  };

  const addMember = async () => {
    if (!selectedTeam || !newMember.full_name || !newMember.birth_date) {
      alert('Please fill in name and birth date');
      return;
    }

    setCalculating(true);

    try {
      if (editingMember) {
        // Update existing member
        await base44.entities.TeamMember.update(editingMember.id, {
          full_name: newMember.full_name,
          email: newMember.email || '',
          birth_date: newMember.birth_date,
          role: newMember.role || '',
          seniority: newMember.seniority,
          work_style_challenges: newMember.work_style_challenges || ''
        });
        setEditingMember(null);
      } else {
        // Calculate numerology for new member
        const response = await base44.functions.invoke('calculateNumerology', {
          type: 'name',
          name: newMember.full_name,
          birthDate: newMember.birth_date
        });

        if (response.data?.success) {
          const calc = response.data.data;
          const lifePathWestern = calc.lifePath?.reduced || 0;
          const lifePathChaldean = calc.lifePathChaldean?.reduced || 0;
          const expressionWestern = calc.expression?.reduced || 0;
          const soulUrgeWestern = calc.soulUrge?.reduced || 0;
          const personalityWestern = calc.personality?.reduced || 0;
          const birthdayNumber = calc.birthday?.reduced || 0;
          const masterNumbers = calc.masterNumbers?.join(', ') || '';
          const element = calc.astrology?.element || 'Earth';

          const createdMember = await base44.entities.TeamMember.create({
            team_id: selectedTeam.id,
            full_name: newMember.full_name,
            email: newMember.email || '',
            birth_date: newMember.birth_date,
            role: newMember.role || '',
            seniority: newMember.seniority,
            life_path_western: lifePathWestern,
            life_path_chaldean: lifePathChaldean,
            expression_western: expressionWestern,
            soul_urge_western: soulUrgeWestern,
            personality_western: personalityWestern,
            birthday_number: birthdayNumber,
            master_numbers: masterNumbers,
            element: element,
            strengths: '',
            weaknesses: '',
            work_style_challenges: newMember.work_style_challenges || ''
          });

          // Auto-classify archetype
          await base44.functions.invoke('classifyArchetype', {
            personId: createdMember.id,
            entityType: 'TeamMember'
          });
        } else {
          alert('Failed to calculate profile: ' + (response.data?.error || 'Unknown error'));
          return;
        }
      }

      setNewMember({ full_name: '', email: '', birth_date: '', role: '', seniority: 'mid', work_style_challenges: '' });
      setShowAddMember(false);
      await loadTeamMembers();
    } catch (error) {
      alert('Error: ' + (error.message || 'Unknown error'));
    } finally {
      setCalculating(false);
    }
  };

  const editMember = (member) => {
    setEditingMember(member);
    setNewMember({
      full_name: member.full_name,
      email: member.email || '',
      birth_date: member.birth_date,
      role: member.role || '',
      seniority: member.seniority,
      work_style_challenges: member.work_style_challenges || ''
    });
    setShowAddMember(true);
  };

  const deleteMember = async (memberId) => {
    if (!confirm('Remove this team member?')) return;
    await base44.entities.TeamMember.delete(memberId);
    loadTeamMembers();
  };

  const startArchetypeTest = (member) => {
    setTestingMember(member);
    setShowArchetypeTest(true);
  };

  const handleTestComplete = async (results) => {
    if (!testingMember) return;
    
    await base44.entities.TeamMember.update(testingMember.id, {
      archetype_primary: results.primary,
      archetype_secondary: results.secondary
    });
    
    setShowArchetypeTest(false);
    setTestingMember(null);
    loadTeamMembers();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">Team Management</h1>
          <Dialog open={showAddTeam} onOpenChange={setShowAddTeam}>
            <DialogTrigger asChild>
              <Button className="bg-teal-600 hover:bg-teal-700">
                <Plus className="w-4 h-4 mr-2" />
                New Team
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">Create New Team</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Team Name *"
                  value={newTeam.team_name}
                  onChange={(e) => setNewTeam({ ...newTeam, team_name: e.target.value })}
                  className="bg-slate-900 border-slate-700 text-white"
                />
                <Input
                  placeholder="Department"
                  value={newTeam.department}
                  onChange={(e) => setNewTeam({ ...newTeam, department: e.target.value })}
                  className="bg-slate-900 border-slate-700 text-white"
                />
                <Textarea
                  placeholder="Description"
                  value={newTeam.description}
                  onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                  className="bg-slate-900 border-slate-700 text-white"
                />
                <Button 
                  onClick={createTeam} 
                  disabled={!newTeam.team_name}
                  className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50"
                >
                  Create Team
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Teams List */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">Teams ({teams.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
              {teams.map(team => (
                <div
                  key={team.id}
                  onClick={() => setSelectedTeam(team)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedTeam?.id === team.id
                      ? 'bg-teal-600 text-white'
                      : 'bg-slate-900 text-gray-300 hover:bg-slate-700'
                  }`}
                >
                  <p className="font-semibold">{team.team_name}</p>
                  {team.department && <p className="text-sm opacity-75">{team.department}</p>}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Team Members */}
          <div className="lg:col-span-2">
            {selectedTeam ? (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white">{selectedTeam.team_name}</CardTitle>
                      <p className="text-gray-400 text-sm">{teamMembers.length} members</p>
                    </div>
                    <Dialog open={showAddMember} onOpenChange={setShowAddMember}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
                          <UserPlus className="w-4 h-4 mr-2" />
                          Add Member
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-slate-800 border-slate-700 max-w-md">
                        <DialogHeader className="pb-2">
                          <DialogTitle className="text-white text-base">{editingMember ? 'Edit' : 'Add'} Team Member</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-2">
                          <Input
                            placeholder="Full Name *"
                            value={newMember.full_name}
                            onChange={(e) => setNewMember({ ...newMember, full_name: e.target.value })}
                            className="bg-slate-900 border-slate-700 text-white h-8 text-sm"
                          />
                          <Input
                            placeholder="Email"
                            type="email"
                            value={newMember.email}
                            onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                            className="bg-slate-900 border-slate-700 text-white h-8 text-sm"
                          />
                          <Input
                            type="date"
                            placeholder="Birth Date *"
                            value={newMember.birth_date}
                            onChange={(e) => setNewMember({ ...newMember, birth_date: e.target.value })}
                            className="bg-slate-900 border-slate-700 text-white h-8 text-sm"
                          />
                          <Input
                            placeholder="Role"
                            value={newMember.role}
                            onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                            className="bg-slate-900 border-slate-700 text-white h-8 text-sm"
                          />
                          <Input
                            placeholder="Work Style Challenges"
                            value={newMember.work_style_challenges || ''}
                            onChange={(e) => setNewMember({ ...newMember, work_style_challenges: e.target.value })}
                            className="bg-slate-900 border-slate-700 text-white h-8 text-sm"
                          />
                          <Select value={newMember.seniority} onValueChange={(v) => setNewMember({ ...newMember, seniority: v })}>
                            <SelectTrigger className="bg-slate-900 border-slate-700 text-white h-8 text-sm">
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
                            onClick={addMember}
                            disabled={calculating || !newMember.full_name || !newMember.birth_date}
                            className="w-full bg-teal-600 hover:bg-teal-700 h-8 text-sm mt-2"
                          >
                            {calculating ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                {editingMember ? 'Updating...' : 'Calculating...'}
                              </>
                            ) : (
                              editingMember ? 'Update Member' : 'Add Member'
                            )}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
                    {teamMembers.map(member => (
                      <div key={member.id} className="p-2 bg-slate-900 rounded border border-slate-700 hover:border-slate-600 transition-colors">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-white font-medium text-sm">{member.full_name}</h3>
                            <p className="text-gray-400 text-xs">{member.role} • {member.seniority}</p>
                            <div className="flex gap-2 mt-1 text-xs">
                              <span className="text-amber-400">LP: {member.life_path_western}</span>
                              <span className="text-purple-400">Expr: {member.expression_western}</span>
                            </div>
                            {member.master_numbers && (
                              <p className="text-amber-300 text-xs mt-0.5">✨ {member.master_numbers}</p>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => startArchetypeTest(member)}
                              className="text-purple-400 hover:text-purple-300 h-6 w-6 p-0"
                              title="Archetype Test"
                            >
                              <FlaskConical className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => editMember(member)}
                              className="text-blue-400 hover:text-blue-300 h-6 w-6 p-0"
                            >
                              <Pencil className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteMember(member.id)}
                              className="text-red-400 hover:text-red-300 h-6 w-6 p-0"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="py-12 text-center">
                  <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">Select a team to view members</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        </div>

        {/* Archetype Test Dialog */}
        {showArchetypeTest && testingMember && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto p-4">
          <div className="max-w-2xl mx-auto my-8">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">
                    Archetype Assessment: {testingMember.full_name}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setShowArchetypeTest(false);
                      setTestingMember(null);
                    }}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <p className="text-gray-400 text-sm mt-2">
                  Answer these questions to determine the team member's archetype
                </p>
              </CardHeader>
              <CardContent>
                <ArchetypeTest
                  candidateName={testingMember.full_name}
                  onComplete={handleTestComplete}
                />
              </CardContent>
            </Card>
          </div>
        </div>
        )}
        </div>
        );
        }