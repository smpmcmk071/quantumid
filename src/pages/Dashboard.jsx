import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Users, Briefcase, UserPlus, TrendingUp, Building2, Target } from 'lucide-react';
import TeamBuilder7A_Logo from '../components/TeamBuilder7A_Logo';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [client, setClient] = useState(null);
  const [stats, setStats] = useState({ teams: 0, members: 0, candidates: 0, jobs: 0 });

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
    }
  };

  if (!client) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6 md:p-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <TeamBuilder7A_Logo size="lg" />
            <p className="text-gray-300 mt-4">HR Intelligence Powered by Numerology</p>
          </div>
          
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="py-12 text-center">
              <Building2 className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">Welcome to TeamBuilder7A</h2>
              <p className="text-gray-300 mb-6">You don't have a client account yet. Contact support to set up your organization.</p>
              <Button onClick={() => base44.auth.logout()} variant="outline" className="border-white/20 text-white">
                Logout
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <TeamBuilder7A_Logo size="md" />
          <h1 className="text-3xl font-bold text-white mt-4">{client.company_name}</h1>
          <p className="text-gray-300">Welcome back, {user?.full_name || user?.email}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Teams</p>
                  <p className="text-3xl font-bold text-white">{stats.teams}</p>
                </div>
                <Users className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Team Members</p>
                  <p className="text-3xl font-bold text-white">{stats.members}</p>
                </div>
                <Users className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Candidates</p>
                  <p className="text-3xl font-bold text-white">{stats.candidates}</p>
                </div>
                <UserPlus className="w-8 h-8 text-amber-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Open Jobs</p>
                  <p className="text-3xl font-bold text-white">{stats.jobs}</p>
                </div>
                <Briefcase className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Link to={createPageUrl('Teams')}>
            <Card className="bg-gradient-to-br from-blue-500/20 to-blue-700/20 border-blue-500/30 hover:border-blue-400 transition-all cursor-pointer">
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
            <Card className="bg-gradient-to-br from-amber-500/20 to-amber-700/20 border-amber-500/30 hover:border-amber-400 transition-all cursor-pointer">
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
            <Card className="bg-gradient-to-br from-purple-500/20 to-purple-700/20 border-purple-500/30 hover:border-purple-400 transition-all cursor-pointer">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Compatibility Analyzer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-sm">Analyze candidate fit using AI + Numerology</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}