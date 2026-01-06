import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Users, Target, TrendingUp, Brain, Lightbulb, Heart, Trophy } from 'lucide-react';
import TeamBuilder7A_Logo from '../components/TeamBuilder7A_Logo';

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <TeamBuilder7A_Logo size="lg" />
          <p className="text-xl text-gray-300 mt-4 italic">
            Stay Above the Threshold
          </p>
          <p className="text-base text-gray-400 mt-2">
            Expanding your threshold of actionable knowledge
          </p>
        </div>

        {/* Mission */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="w-6 h-6 text-amber-400" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-300">
            <p>
              TeamBuilder7A combines PhD-level team building research with 4,000-year-old numerology to help HR professionals 
              build high-performing teams with scientific precision.
            </p>
            <p>
              We've analyzed decades of research from Patrick Lencioni, Meredith Belbin, Bruce Tuckman, and other team science 
              pioneers, then mapped their findings to numerological archetypes for instant, accurate team composition analysis.
            </p>
          </CardContent>
        </Card>

        {/* The 4 Core Archetypes */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-400" />
              The 4 Core Team Archetypes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-300 mb-4">
              Every high-performing team needs a balance of these four archetypes. Our AI analyzes your organization's 
              numerology to build teams with optimal balance.
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-lg border border-amber-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <h3 className="text-amber-300 font-semibold">Visionary/Leader</h3>
                </div>
                <p className="text-amber-200 text-xs mb-2">Life Path 1, 8, 11, 22</p>
                <p className="text-gray-300 text-sm">
                  Sets direction, drives execution, makes decisions. Natural leadership energy. 
                  Takes charge of goals and ensures results.
                </p>
              </div>

              <div className="p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg border border-blue-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-5 h-5 text-blue-400" />
                  <h3 className="text-blue-300 font-semibold">Strategist/Analyst</h3>
                </div>
                <p className="text-blue-200 text-xs mb-2">Life Path 4, 7</p>
                <p className="text-gray-300 text-sm">
                  Deep thinker, systematic planner, risk analyzer. 
                  Ensures quality through careful analysis and strategic thinking.
                </p>
              </div>

              <div className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-5 h-5 text-purple-400" />
                  <h3 className="text-purple-300 font-semibold">Creator/Innovator</h3>
                </div>
                <p className="text-purple-200 text-xs mb-2">Life Path 3, 5, 33</p>
                <p className="text-gray-300 text-sm">
                  Generates ideas, finds creative solutions, adapts to change. 
                  Brings innovation and flexibility to overcome obstacles.
                </p>
              </div>

              <div className="p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg border border-green-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-5 h-5 text-green-400" />
                  <h3 className="text-green-300 font-semibold">Harmonizer/Builder</h3>
                </div>
                <p className="text-green-200 text-xs mb-2">Life Path 2, 6, 9</p>
                <p className="text-gray-300 text-sm">
                  Unifies the team, resolves conflicts, supports members. 
                  The glue that holds teams together through empathy and collaboration.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Master Numbers */}
        <Card className="bg-gradient-to-br from-amber-900/30 to-purple-900/30 backdrop-blur-sm border-amber-500/30 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-amber-400" />
              Master Numbers: High-Potential Individuals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-300">
            <p>
              People with Master Numbers (11, 22, 33) in their numerology chart are identified as "High-Potential" 
              because these numbers represent amplified spiritual and leadership capabilities.
            </p>
            <div className="grid md:grid-cols-3 gap-3">
              <div className="p-3 bg-white/10 rounded-lg text-center">
                <span className="text-3xl font-bold text-amber-400">11</span>
                <p className="text-sm mt-1">Visionary Intuition</p>
              </div>
              <div className="p-3 bg-white/10 rounded-lg text-center">
                <span className="text-3xl font-bold text-purple-400">22</span>
                <p className="text-sm mt-1">Master Builder</p>
              </div>
              <div className="p-3 bg-white/10 rounded-lg text-center">
                <span className="text-3xl font-bold text-pink-400">33</span>
                <p className="text-sm mt-1">Master Teacher</p>
              </div>
            </div>
            <p className="text-amber-300 font-medium text-center">
              Our AI prioritizes Master Number holders when building teams, distributing them for maximum impact.
            </p>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-green-400" />
              How It Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 text-gray-300">
              <li className="flex gap-3">
                <span className="text-blue-400 font-bold">1.</span>
                <span>Add your team members with their birth dates</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-400 font-bold">2.</span>
                <span>Our system calculates their Life Path number and classifies their archetype</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-400 font-bold">3.</span>
                <span>Use the Team Builder to say "create 3 teams of 5" or "organize all 50 people"</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-400 font-bold">4.</span>
                <span>AI assigns roles and explains why each person fits based on numerology + team science</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-400 font-bold">5.</span>
                <span>Get balanced teams with clear role assignments and reasoning</span>
              </li>
            </ol>
          </CardContent>
        </Card>

        {/* Getting Started */}
        <Card className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-blue-500/30">
          <CardContent className="py-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Ready to Build Better Teams?</h2>
            <p className="text-gray-300 mb-6">
              Start by adding your team members to see their archetypes, then use the Team Builder 
              to create optimally balanced teams in seconds.
            </p>
            <p className="text-gray-400 text-sm mb-2">
              A Product of <span className="text-teal-400 font-semibold">Threshold7 Analytics</span>
            </p>
            <p className="text-gray-400 text-sm">
              Questions? Contact us at <a href="mailto:7day11com@gmail.com" className="text-teal-400 underline">7day11com@gmail.com</a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}