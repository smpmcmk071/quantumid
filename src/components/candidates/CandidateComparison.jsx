import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, Users, Briefcase, Star, TrendingUp, X } from 'lucide-react';

const ARCHETYPE_COLORS = {
  visionary: 'text-purple-400',
  strategist: 'text-blue-400',
  creator: 'text-amber-400',
  harmonizer: 'text-green-400'
};

const ARCHETYPE_DESCRIPTIONS = {
  visionary: 'Big-picture thinker, innovative, inspirational',
  strategist: 'Analytical, systematic, data-driven',
  creator: 'Action-oriented, hands-on, results-focused',
  harmonizer: 'Collaborative, empathetic, team-focused'
};

export default function CandidateComparison({ candidates, jobs, teams, onClose }) {
  const [candidate1, setCandidate1] = useState(null);
  const [candidate2, setCandidate2] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);

  const compareEnabled = candidate1 && candidate2 && selectedJob && selectedTeam;

  const runComparison = async () => {
    if (!compareEnabled) return;
    
    setLoading(true);
    
    // Calculate team fit scores
    const teamMembers = await base44.entities.TeamMember.filter({ team_id: selectedTeam });
    
    const teamFit1 = calculateTeamFit(candidate1, teamMembers);
    const teamFit2 = calculateTeamFit(candidate2, teamMembers);
    
    // Calculate job fit scores
    const jobFit1 = calculateJobFit(candidate1, selectedJob);
    const jobFit2 = calculateJobFit(candidate2, selectedJob);
    
    // Numerology tiebreaker
    const numeroScore1 = calculateNumerologyScore(candidate1);
    const numeroScore2 = calculateNumerologyScore(candidate2);
    
    // Overall scores
    const total1 = (teamFit1 * 0.4) + (jobFit1 * 0.4) + (numeroScore1 * 0.2);
    const total2 = (teamFit2 * 0.4) + (jobFit2 * 0.4) + (numeroScore2 * 0.2);
    
    setComparison({
      candidate1: {
        ...candidate1,
        teamFit: teamFit1,
        jobFit: jobFit1,
        numeroScore: numeroScore1,
        total: total1
      },
      candidate2: {
        ...candidate2,
        teamFit: teamFit2,
        jobFit: jobFit2,
        numeroScore: numeroScore2,
        total: total2
      },
      winner: total1 > total2 ? 1 : 2,
      reasoning: generateReasoning(total1, total2, teamFit1, teamFit2, jobFit1, jobFit2, numeroScore1, numeroScore2)
    });
    
    setLoading(false);
  };

  const calculateTeamFit = (candidate, teamMembers) => {
    if (!candidate.archetype_primary || teamMembers.length === 0) return 50;
    
    // Count archetype distribution
    const distribution = teamMembers.reduce((acc, member) => {
      if (member.archetype_primary) {
        acc[member.archetype_primary] = (acc[member.archetype_primary] || 0) + 1;
      }
      return acc;
    }, {});
    
    const currentCount = distribution[candidate.archetype_primary] || 0;
    const teamSize = teamMembers.length;
    
    // Balance score: prefer archetypes that are underrepresented
    const balanceScore = 100 - ((currentCount / teamSize) * 100);
    
    // Life path compatibility
    const avgLifePath = teamMembers.reduce((sum, m) => sum + (m.life_path_western || 0), 0) / teamSize;
    const lifePathDiff = Math.abs((candidate.life_path_western || 0) - avgLifePath);
    const lifePathScore = Math.max(0, 100 - (lifePathDiff * 15));
    
    return Math.round((balanceScore * 0.6) + (lifePathScore * 0.4));
  };

  const calculateJobFit = (candidate, job) => {
    if (!job || !candidate) return 50;
    
    const requiredSkills = (job.required_skills || '').toLowerCase().split(',').map(s => s.trim()).filter(s => s);
    const candidateSkills = (candidate.extracted_skills || '').toLowerCase().split(',').map(s => s.trim()).filter(s => s);
    
    if (requiredSkills.length === 0) return 70;
    
    // Skill match score
    const matchedSkills = requiredSkills.filter(req => 
      candidateSkills.some(cand => cand.includes(req) || req.includes(cand))
    );
    const skillScore = (matchedSkills.length / requiredSkills.length) * 100;
    
    // Experience score
    const expScore = Math.min(100, ((candidate.years_experience || 0) / 5) * 100);
    
    // Archetype match with job
    const archetypeScore = candidate.archetype_primary === job.ideal_archetype ? 100 : 70;
    
    return Math.round((skillScore * 0.5) + (expScore * 0.3) + (archetypeScore * 0.2));
  };

  const calculateNumerologyScore = (candidate) => {
    if (!candidate.life_path_western) return 50;
    
    let score = 50;
    
    // Master numbers boost
    if (candidate.master_numbers) {
      const masters = candidate.master_numbers.split(',').map(n => parseInt(n.trim()));
      score += masters.length * 10;
    }
    
    // Expression alignment
    if (candidate.expression_western && candidate.life_path_western) {
      const diff = Math.abs(candidate.expression_western - candidate.life_path_western);
      if (diff <= 2) score += 15;
    }
    
    // High-potential life paths (11, 22, 33, 7, 9)
    if ([7, 9, 11, 22, 33].includes(candidate.life_path_western)) {
      score += 10;
    }
    
    return Math.min(100, score);
  };

  const generateReasoning = (t1, t2, team1, team2, job1, job2, num1, num2) => {
    const winner = t1 > t2 ? 'Candidate A' : 'Candidate B';
    const diff = Math.abs(t1 - t2);
    
    const reasons = [];
    
    if (Math.abs(team1 - team2) > 15) {
      const teamWinner = team1 > team2 ? 'Candidate A' : 'Candidate B';
      reasons.push(`${teamWinner} has significantly better team fit (${Math.round(Math.max(team1, team2))}% vs ${Math.round(Math.min(team1, team2))}%)`);
    }
    
    if (Math.abs(job1 - job2) > 15) {
      const jobWinner = job1 > job2 ? 'Candidate A' : 'Candidate B';
      reasons.push(`${jobWinner} has stronger job qualifications (${Math.round(Math.max(job1, job2))}% vs ${Math.round(Math.min(job1, job2))}%)`);
    }
    
    if (Math.abs(num1 - num2) > 10) {
      const numWinner = num1 > num2 ? 'Candidate A' : 'Candidate B';
      reasons.push(`${numWinner} has superior numerology alignment (${Math.round(Math.max(num1, num2))}% vs ${Math.round(Math.min(num1, num2))}%)`);
    }
    
    if (reasons.length === 0) {
      reasons.push('Both candidates are closely matched across all criteria');
    }
    
    return reasons;
  };

  const ScoreBar = ({ score, color = 'teal' }) => (
    <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
      <div 
        className={`h-full bg-${color}-500 transition-all duration-500`}
        style={{ width: `${score}%` }}
      />
    </div>
  );

  const CandidateCard = ({ candidate, scores }) => (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-xl font-bold text-white mb-1">{candidate.full_name}</h3>
        {candidate.archetype_primary && (
          <div className="flex items-center justify-center gap-2">
            <span className={`${ARCHETYPE_COLORS[candidate.archetype_primary]} font-semibold capitalize`}>
              {candidate.archetype_primary}
            </span>
            {candidate.archetype_secondary && (
              <span className={`${ARCHETYPE_COLORS[candidate.archetype_secondary]} text-sm capitalize`}>
                / {candidate.archetype_secondary}
              </span>
            )}
          </div>
        )}
        <p className="text-gray-400 text-sm mt-1">{candidate.years_experience || 0} years experience</p>
      </div>

      {scores && (
        <>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-300 text-sm flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Team Fit
                </span>
                <span className="text-white font-semibold">{Math.round(scores.teamFit)}%</span>
              </div>
              <ScoreBar score={scores.teamFit} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-300 text-sm flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Job Fit
                </span>
                <span className="text-white font-semibold">{Math.round(scores.jobFit)}%</span>
              </div>
              <ScoreBar score={scores.jobFit} color="blue" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-300 text-sm flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Numerology
                </span>
                <span className="text-white font-semibold">{Math.round(scores.numeroScore)}%</span>
              </div>
              <ScoreBar score={scores.numeroScore} color="purple" />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-gray-300 font-semibold">Overall Score</span>
              <span className="text-2xl font-bold text-teal-400">{Math.round(scores.total)}%</span>
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto p-4">
      <div className="max-w-6xl mx-auto my-8">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-2xl flex items-center gap-2">
                <Trophy className="w-6 h-6 text-teal-400" />
                Candidate Comparison
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Selection */}
            <div className="grid md:grid-cols-4 gap-4">
              <Select value={candidate1?.id} onValueChange={(id) => setCandidate1(candidates.find(c => c.id === id))}>
                <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                  <SelectValue placeholder="Candidate A" />
                </SelectTrigger>
                <SelectContent>
                  {candidates.map(c => (
                    <SelectItem key={c.id} value={c.id} disabled={c.id === candidate2?.id}>
                      {c.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={candidate2?.id} onValueChange={(id) => setCandidate2(candidates.find(c => c.id === id))}>
                <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                  <SelectValue placeholder="Candidate B" />
                </SelectTrigger>
                <SelectContent>
                  {candidates.map(c => (
                    <SelectItem key={c.id} value={c.id} disabled={c.id === candidate1?.id}>
                      {c.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedJob?.id} onValueChange={(id) => setSelectedJob(jobs.find(j => j.id === id))}>
                <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                  <SelectValue placeholder="Select Job" />
                </SelectTrigger>
                <SelectContent>
                  {jobs.map(j => (
                    <SelectItem key={j.id} value={j.id}>{j.job_title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedTeam?.id} onValueChange={(id) => setSelectedTeam(teams.find(t => t.id === id))}>
                <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                  <SelectValue placeholder="Select Team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.team_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={runComparison}
              disabled={!compareEnabled || loading}
              className="w-full bg-teal-600 hover:bg-teal-700"
            >
              {loading ? 'Analyzing...' : 'Compare Candidates'}
            </Button>

            {/* Comparison Results */}
            {comparison && (
              <div className="space-y-6 pt-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className={`bg-slate-900/50 border-2 ${comparison.winner === 1 ? 'border-teal-500' : 'border-slate-700'}`}>
                    <CardContent className="p-6">
                      {comparison.winner === 1 && (
                        <div className="flex items-center justify-center gap-2 mb-4 text-teal-400">
                          <Trophy className="w-5 h-5" />
                          <span className="font-bold">Winner</span>
                        </div>
                      )}
                      <CandidateCard candidate={comparison.candidate1} scores={comparison.candidate1} />
                    </CardContent>
                  </Card>

                  <Card className={`bg-slate-900/50 border-2 ${comparison.winner === 2 ? 'border-teal-500' : 'border-slate-700'}`}>
                    <CardContent className="p-6">
                      {comparison.winner === 2 && (
                        <div className="flex items-center justify-center gap-2 mb-4 text-teal-400">
                          <Trophy className="w-5 h-5" />
                          <span className="font-bold">Winner</span>
                        </div>
                      )}
                      <CandidateCard candidate={comparison.candidate2} scores={comparison.candidate2} />
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-slate-900/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-teal-400" />
                      Analysis Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {comparison.reasoning.map((reason, idx) => (
                        <li key={idx} className="text-gray-300 flex items-start gap-2">
                          <span className="text-teal-400 mt-1">•</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}