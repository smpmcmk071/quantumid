import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Cake, Gift, Heart, Loader2, TrendingUp, ShoppingBag, Sparkles } from 'lucide-react';

export default function BirthdayInsights() {
  const [client, setClient] = useState(null);
  const [teams, setTeams] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const user = await base44.auth.me();
    
    if (user.role !== 'admin') {
      alert('Admin access required');
      return;
    }

    const clients = await base44.entities.Client.filter({ admin_email: user.email });
    if (clients.length > 0) {
      const c = clients[0];
      setClient(c);
      
      const t = await base44.entities.Team.filter({ client_id: c.id });
      setTeams(t);
      
      const members = await base44.entities.TeamMember.list();
      setAllMembers(members);
      
      // Find upcoming birthdays (next 30 days)
      const today = new Date();
      const upcoming = members.filter(m => {
        if (!m.birth_date) return false;
        const [year, month, day] = m.birth_date.split('-');
        const thisYearBday = new Date(today.getFullYear(), parseInt(month) - 1, parseInt(day));
        const daysUntil = Math.ceil((thisYearBday - today) / (1000 * 60 * 60 * 24));
        return daysUntil >= 0 && daysUntil <= 30;
      }).sort((a, b) => {
        const [yearA, monthA, dayA] = a.birth_date.split('-');
        const [yearB, monthB, dayB] = b.birth_date.split('-');
        const thisYearA = new Date(today.getFullYear(), parseInt(monthA) - 1, parseInt(dayA));
        const thisYearB = new Date(today.getFullYear(), parseInt(monthB) - 1, parseInt(dayB));
        return thisYearA - thisYearB;
      });
      
      setUpcomingBirthdays(upcoming);
    }
    setLoading(false);
  };

  const generateInsights = async (member) => {
    setSelectedMember(member);
    setGenerating(true);
    
    try {
      const response = await base44.functions.invoke('generateBirthdayInsights', {
        memberId: member.id,
        locationZip: client?.location_zip || '80498'
      });
      
      if (response.data?.success) {
        setInsights(response.data.data);
      }
    } catch (error) {
      alert('Error generating insights: ' + error.message);
    } finally {
      setGenerating(false);
    }
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

  const getDaysUntilBirthday = (birthDate) => {
    const today = new Date();
    const [year, month, day] = birthDate.split('-');
    const thisYearBday = new Date(today.getFullYear(), parseInt(month) - 1, parseInt(day));
    const daysUntil = Math.ceil((thisYearBday - today) / (1000 * 60 * 60 * 24));
    return daysUntil;
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
        <div className="flex items-center gap-3 mb-6">
          <Cake className="w-8 h-8 text-pink-400" />
          <h1 className="text-3xl font-bold text-white">Birthday <span className="text-yellow-400">Insights</span></h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Upcoming Birthdays */}
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-pink-400" />
                Upcoming (30 days)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-96 overflow-y-auto">
              {upcomingBirthdays.length === 0 ? (
                <p className="text-gray-400 text-sm">No birthdays in the next 30 days</p>
              ) : (
                upcomingBirthdays.map(member => {
                  const daysUntil = getDaysUntilBirthday(member.birth_date);
                  return (
                    <div
                      key={member.id}
                      onClick={() => generateInsights(member)}
                      className="p-3 bg-slate-900 rounded border border-slate-700 hover:border-pink-500 cursor-pointer transition-colors"
                    >
                      <p className="text-white font-semibold">{member.full_name}</p>
                      <p className="text-gray-400 text-xs">{member.role}</p>
                      <p className="text-pink-400 text-sm mt-1">
                        {daysUntil === 0 ? '🎉 Today!' : `in ${daysUntil} days`}
                      </p>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* All Team Members */}
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-white">Select Team Member</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedMember?.id} onValueChange={(id) => {
                const member = allMembers.find(m => m.id === id);
                generateInsights(member);
              }}>
                <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                  <SelectValue placeholder="Choose a team member..." />
                </SelectTrigger>
                <SelectContent>
                  {allMembers.map(member => {
                    let bdayDisplay = '';
                    if (member.birth_date) {
                      const [year, month, day] = member.birth_date.split('-');
                      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                      bdayDisplay = ` (${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`;
                    }
                    return (
                      <SelectItem key={member.id} value={member.id}>
                        {member.full_name} - {member.role}{bdayDisplay}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        {/* Insights Display */}
        {generating && (
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
            <CardContent className="py-12 text-center">
              <Loader2 className="w-12 h-12 animate-spin text-teal-400 mx-auto mb-4" />
              <p className="text-gray-300">Generating personalized insights...</p>
            </CardContent>
          </Card>
        )}

        {!generating && insights && (
          <div className="space-y-6">
            {/* Member Info */}
            <Card className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 border-pink-500">
              <CardHeader>
                <CardTitle className="text-white text-2xl flex items-center gap-3">
                  <Cake className="w-6 h-6 text-pink-400" />
                  {insights.member.name}
                </CardTitle>
                <p className="text-gray-300">{insights.member.role}</p>
                <div className="flex gap-2 mt-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${getArchetypeColor(insights.member.archetype)}`}>
                    {insights.member.archetype}
                  </span>
                  <span className="text-gray-400 text-sm">
                    🎂 {(() => {
                      const [year, month, day] = insights.member.birth_date.split('-');
                      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                      return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
                    })()}
                  </span>
                </div>
              </CardHeader>
            </Card>

            {/* Deep Insights */}
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-400" />
                  What They Truly Want
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-teal-400 font-semibold mb-2">Deep Desire</h3>
                  <p className="text-gray-300">{insights.insights.deep_desire}</p>
                </div>
                <div>
                  <h3 className="text-blue-400 font-semibold mb-2">Recognition Preference</h3>
                  <p className="text-gray-300">{insights.insights.recognition_preference}</p>
                </div>
                <div>
                  <h3 className="text-purple-400 font-semibold mb-2">Core Motivation</h3>
                  <p className="text-gray-300">{insights.insights.core_motivation}</p>
                </div>
              </CardContent>
            </Card>

            {/* Gift Suggestions */}
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Gift className="w-5 h-5 text-amber-400" />
                  Gift Suggestions ($150-200)
                </CardTitle>
                <p className="text-gray-400 text-sm">Based on archetype, numerology, and location</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {insights.gifts.map((gift, idx) => (
                  <div key={idx} className="p-4 bg-slate-900 rounded-lg border border-slate-700">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-white font-semibold text-lg">{idx + 1}. {gift.name}</h3>
                        <span className="text-teal-400 text-sm">{gift.type}</span>
                      </div>
                      <span className="text-amber-400 font-semibold">{gift.price_range}</span>
                    </div>
                    <p className="text-gray-300 text-sm mb-2">{gift.why_perfect}</p>
                    <div className="flex items-center gap-2 text-blue-400 text-sm">
                      <ShoppingBag className="w-4 h-4" />
                      {gift.where_to_buy}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}