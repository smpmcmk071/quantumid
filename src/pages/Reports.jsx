import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, TrendingUp, Users, Target, Zap, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function Reports() {
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [classifying, setClassifying] = useState(false);
  const [orgReport, setOrgReport] = useState(null);
  const [memberMatrix, setMemberMatrix] = useState(null);
  const [archetypeBreakdown, setArchetypeBreakdown] = useState(null);
  const [allMembers, setAllMembers] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const user = await base44.auth.me();
    const clients = await base44.entities.Client.filter({ admin_email: user.email });
    
    if (clients.length > 0) {
      const c = clients[0];
      setClient(c);
      
      // Load all team members
      const teams = await base44.entities.Team.filter({ client_id: c.id });
      const memberPromises = teams.map(t => base44.entities.TeamMember.filter({ team_id: t.id }));
      const membersArrays = await Promise.all(memberPromises);
      setAllMembers(membersArrays.flat());
    }
    setLoading(false);
  };

  const generateOrgReport = async () => {
    setGenerating(true);
    
    const response = await base44.functions.invoke('generateOrgReport', {
      clientId: client.id
    });
    
    if (response.data?.success) {
      setOrgReport(response.data.data);
    }
    setGenerating(false);
  };

  const generateMemberMatrix = async () => {
    setGenerating(true);
    
    const response = await base44.functions.invoke('generateMemberMatrix', {
      clientId: client.id
    });
    
    if (response.data?.success) {
      setMemberMatrix(response.data.data);
      setArchetypeBreakdown(response.data.archetypeBreakdown);
    }
    setGenerating(false);
  };

  const generateAllArchetypes = async () => {
    setClassifying(true);
    
    // Find members without archetypes
    const membersToClassify = allMembers.filter(m => !m.archetype_primary && m.life_path_western);
    
    if (membersToClassify.length === 0) {
      alert('All members already have archetypes!');
      setClassifying(false);
      return;
    }

    // Classify each member
    for (const member of membersToClassify) {
      await base44.functions.invoke('classifyArchetype', {
        personId: member.id,
        entityType: 'TeamMember'
      });
    }
    
    // Reload data
    await loadData();
    setClassifying(false);
    alert(`Generated archetypes for ${membersToClassify.length} members!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 p-6 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">Organization Reports</h1>
          <Button
            onClick={generateAllArchetypes}
            disabled={classifying}
            className="bg-amber-600 hover:bg-amber-700"
          >
            {classifying ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Generate All Archetypes
              </>
            )}
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-teal-400" />
                Organization Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-sm mb-4">
                Get a comprehensive analysis of your organization's numerological profile, strengths, and growth areas.
              </p>
              <Button 
                onClick={generateOrgReport} 
                disabled={generating}
                className="w-full bg-teal-600 hover:bg-teal-700"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Report'
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                Member Compatibility Matrix
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-sm mb-4">
                View team member compatibility scores and archetype distribution across your organization.
              </p>
              <Button 
                onClick={generateMemberMatrix} 
                disabled={generating}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Matrix'
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="w-5 h-5 text-blue-400" />
                Team Member Profiles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-sm mb-4">
                View detailed profiles, skills, and development goals for each team member.
              </p>
              <div className="max-h-32 overflow-y-auto space-y-2">
                {allMembers.map(member => (
                  <Link 
                    key={member.id} 
                    to={createPageUrl('MemberProfile') + '?id=' + member.id}
                    className="block p-2 bg-slate-700/30 rounded hover:bg-slate-700/50 transition-colors"
                  >
                    <p className="text-white text-sm">{member.full_name}</p>
                    <p className="text-gray-400 text-xs">{member.role}</p>
                    {member.archetype_primary && (
                      <div className="flex gap-1 mt-1">
                        <span className="px-1.5 py-0.5 rounded text-xs bg-purple-500/20 text-purple-300">
                          Test: {member.archetype_primary}
                        </span>
                        {member.archetype_primary_calculated && member.archetype_primary !== member.archetype_primary_calculated && (
                          <span className="px-1.5 py-0.5 rounded text-xs bg-blue-500/20 text-blue-300">
                            Calc: {member.archetype_primary_calculated}
                          </span>
                        )}
                      </div>
                    )}
                  </Link>
                ))}
                {allMembers.length === 0 && (
                  <p className="text-gray-400 text-sm">No team members yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Organization Report */}
        {orgReport && (
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 mb-6">
            <CardHeader>
              <CardTitle className="text-white">Organization Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-teal-400 font-semibold mb-2">Overall Profile</h3>
                <p className="text-gray-300 whitespace-pre-line">{orgReport.overview}</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-700/30 rounded-lg">
                  <h3 className="text-green-400 font-semibold mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Key Strengths
                  </h3>
                  <p className="text-gray-300 text-sm whitespace-pre-line">{orgReport.strengths}</p>
                </div>
                
                <div className="p-4 bg-slate-700/30 rounded-lg">
                  <h3 className="text-amber-400 font-semibold mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Growth Areas
                  </h3>
                  <p className="text-gray-300 text-sm whitespace-pre-line">{orgReport.growthAreas}</p>
                </div>
              </div>

              <div>
                <h3 className="text-purple-400 font-semibold mb-2">Recommendations</h3>
                <p className="text-gray-300 whitespace-pre-line">{orgReport.recommendations}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Archetype Breakdown */}
        {archetypeBreakdown && (
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 mb-6">
            <CardHeader>
              <CardTitle className="text-white">Archetype Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="p-4 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-lg border border-amber-500/30 text-center">
                  <p className="text-amber-300 text-sm mb-1">Visionary</p>
                  <p className="text-3xl font-bold text-white">{archetypeBreakdown.visionary}</p>
                  <p className="text-amber-200 text-xs mt-1">{archetypeBreakdown.visionaryPercent}%</p>
                </div>
                
                <div className="p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg border border-blue-500/30 text-center">
                  <p className="text-blue-300 text-sm mb-1">Strategist</p>
                  <p className="text-3xl font-bold text-white">{archetypeBreakdown.strategist}</p>
                  <p className="text-blue-200 text-xs mt-1">{archetypeBreakdown.strategistPercent}%</p>
                </div>
                
                <div className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/30 text-center">
                  <p className="text-purple-300 text-sm mb-1">Creator</p>
                  <p className="text-3xl font-bold text-white">{archetypeBreakdown.creator}</p>
                  <p className="text-purple-200 text-xs mt-1">{archetypeBreakdown.creatorPercent}%</p>
                </div>
                
                <div className="p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg border border-green-500/30 text-center">
                  <p className="text-green-300 text-sm mb-1">Harmonizer</p>
                  <p className="text-3xl font-bold text-white">{archetypeBreakdown.harmonizer}</p>
                  <p className="text-green-200 text-xs mt-1">{archetypeBreakdown.harmonizerPercent}%</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm mt-4 text-center">{archetypeBreakdown.balanceNote}</p>
            </CardContent>
          </Card>
        )}

        {/* Member Matrix */}
        {memberMatrix && (
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Member Compatibility Matrix</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left text-gray-400 p-2">Member</th>
                    <th className="text-center text-gray-400 p-2">Life Path</th>
                    <th className="text-center text-gray-400 p-2">Archetype</th>
                    <th className="text-center text-gray-400 p-2">Element</th>
                    <th className="text-center text-gray-400 p-2">Potential</th>
                    <th className="text-left text-gray-400 p-2">Best Paired With</th>
                  </tr>
                </thead>
                <tbody>
                  {memberMatrix.map((member, idx) => (
                    <tr key={idx} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                      <td className="text-white p-2">{member.name}</td>
                      <td className="text-center text-teal-400 p-2">{member.lifePath}</td>
                      <td className="text-center text-purple-400 p-2 capitalize">{member.archetype}</td>
                      <td className="text-center text-amber-400 p-2">{member.element}</td>
                      <td className="text-center p-2">
                        <span className={member.potential === 'High-Potential' ? 'text-yellow-400' : 'text-gray-400'}>
                          {member.potential}
                        </span>
                      </td>
                      <td className="text-gray-300 p-2 text-xs">{member.bestPairedWith}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}