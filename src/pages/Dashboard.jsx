import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Users, Briefcase, UserPlus, TrendingUp, Building2, Target } from 'lucide-react';
import TeamBuilder7A_Logo from '../components/TeamBuilder7A_Logo';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [client, setClient] = useState(null);
  const [stats, setStats] = useState({ teams: 0, members: 0, candidates: 0, jobs: 0 });
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    const u = await base44.auth.me();
    setUser(u);

    // Find client by admin email
    const clients = await base44.entities.Client.filter({ admin_email: u.email });
    if (clients.length > 0) {
      const c = clients[0];
      setClient(c);

      // Load stats
      const teams = await base44.entities.Team.filter({ client_id: c.id });
      const allMembers = await Promise.all(
        teams.map(t => base44.entities.TeamMember.filter({ team_id: t.id }))
      );
      const members = allMembers.flat();
      const candidates = await base44.entities.Candidate.filter({ client_id: c.id });
      const jobs = await base44.entities.JobPosting.filter({ client_id: c.id });

      setStats({
        teams: teams.length,
        members: members.length,
        candidates: candidates.length,
        jobs: jobs.filter(j => j.status === 'open').length
      });
    } else {
      setShowOnboarding(true);
    }
  };

  const createClient = async () => {
    if (!companyName?.trim() || !user) return;
    
    setCreating(true);
    try {
      await base44.entities.Client.create({
        company_name: companyName.trim(),
        admin_email: user.email,
        subscription_tier: 'starter',
        is_active: true
      });
      setShowOnboarding(false);
      await loadDashboard();
    } catch (error) {
      alert('Error creating company: ' + error.message);
    }
    setCreating(false);
  };

  if (!client) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6 md:p-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <TeamBuilder7A_Logo size="lg" />
            <p className="text-gray-300 mt-4">Stay Above the Threshold</p>
            <p className="text-gray-400 text-sm">A Product of Threshold7 Analytics</p>
          </div>
          
          <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
            <DialogContent className="bg-slate-800 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white text-center text-2xl">Welcome to TeamBuilder7A</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="text-center">
                  <Building2 className="w-16 h-16 text-teal-400 mx-auto mb-4" />
                  <p className="text-gray-300 mb-4">Let's get you started! What's your company name?</p>
                </div>
                <Input
                  placeholder="Company Name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="bg-slate-900 border-slate-700 text-white"
                  onKeyDown={(e) => e.key === 'Enter' && createClient()}
                />
                <Button 
                  onClick={createClient} 
                  disabled={!companyName?.trim() || creating}
                  className="w-full bg-teal-600 hover:bg-teal-700"
                >
                  {creating ? 'Creating...' : 'Create Company'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">{client.company_name}</h1>
          <p className="text-gray-300">Welcome back, {user?.full_name || user?.email}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Teams</p>
                  <p className="text-3xl font-bold text-white">{stats.teams}</p>
                </div>
                <Users className="w-8 h-8 text-teal-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Team Members</p>
                  <p className="text-3xl font-bold text-white">{stats.members}</p>
                </div>
                <Users className="w-8 h-8 text-teal-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Candidates</p>
                  <p className="text-3xl font-bold text-white">{stats.candidates}</p>
                </div>
                <UserPlus className="w-8 h-8 text-teal-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Open Jobs</p>
                  <p className="text-3xl font-bold text-white">{stats.jobs}</p>
                </div>
                <Briefcase className="w-8 h-8 text-teal-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Link to={createPageUrl('Teams')}>
            <Card className="bg-slate-800 border-slate-700 hover:border-teal-500 transition-all cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Manage Teams
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-sm">View and manage your teams and team members</p>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl('Candidates')}>
            <Card className="bg-slate-800 border-slate-700 hover:border-teal-500 transition-all cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Manage Candidates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-sm">Add candidates and upload resumes</p>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl('Analyzer')}>
            <Card className="bg-slate-800 border-slate-700 hover:border-teal-500 transition-all cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Compatibility Analyzer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-sm">Analyze candidate fit using AI + Science</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}