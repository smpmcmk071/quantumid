import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Users, Target, TrendingUp, Sparkles, ChevronRight, X } from 'lucide-react';

export default function Marketing() {
  const [showDemo, setShowDemo] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-20 sm:py-32">
          <div className="text-center">
            <h1 className="text-5xl sm:text-7xl font-bold text-white mb-6">
              Build High-Performing Teams
              <span className="block text-teal-400 mt-2">with Science</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-10">
              TeamBuilder7A combines numerology, behavioral science, and AI to help HR professionals 
              create perfectly balanced teams that exceed performance thresholds.
            </p>
            <div className="flex gap-4 justify-center">
              <Button className="bg-teal-600 hover:bg-teal-700 text-lg px-8 py-6">
                Get Started Free
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                className="bg-purple-600 hover:bg-purple-700 text-white text-lg px-8 py-6"
                onClick={() => setShowDemo(true)}
              >
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-white text-center mb-16">
          Everything You Need to Build Elite Teams
        </h2>
        
        <div className="grid md:grid-cols-2 gap-12">
          {/* Feature 1 */}
          <div>
            <Card className="bg-slate-800/50 border-slate-700 mb-6">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-3">
                  <Users className="w-6 h-6 text-teal-400" />
                  Team Archetype Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">
                  Discover each team member's natural archetype: Visionary, Strategist, Creator, or Harmonizer. 
                  Build balanced teams that complement each other's strengths.
                </p>
                <img 
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop" 
                  alt="Team collaboration"
                  className="w-full h-48 object-cover rounded-lg"
                />
              </CardContent>
            </Card>
          </div>

          {/* Feature 2 */}
          <div>
            <Card className="bg-slate-800/50 border-slate-700 mb-6">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-3">
                  <Target className="w-6 h-6 text-purple-400" />
                  Candidate Compatibility Scoring
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">
                  AI-powered compatibility analysis matches candidates to teams and roles. 
                  See team fit, job fit, and numerology scores in seconds.
                </p>
                <img 
                  src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=250&fit=crop" 
                  alt="Data analysis"
                  className="w-full h-48 object-cover rounded-lg"
                />
              </CardContent>
            </Card>
          </div>

          {/* Feature 3 */}
          <div>
            <Card className="bg-slate-800/50 border-slate-700 mb-6">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-amber-400" />
                  Numerology Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">
                  Calculate Life Path, Expression, and Soul Urge numbers automatically. 
                  Identify high-potential individuals with Master Numbers (11, 22, 33).
                </p>
                <img 
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop" 
                  alt="Analytics dashboard"
                  className="w-full h-48 object-cover rounded-lg"
                />
              </CardContent>
            </Card>
          </div>

          {/* Feature 4 */}
          <div>
            <Card className="bg-slate-800/50 border-slate-700 mb-6">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-blue-400" />
                  AI-Powered Team Builder
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">
                  Let AI assemble optimal teams based on your requirements. 
                  Get detailed reasoning for each member's role assignment.
                </p>
                <img 
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=250&fit=crop" 
                  alt="Team meeting"
                  className="w-full h-48 object-cover rounded-lg"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-slate-800/30 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-5xl font-bold text-teal-400 mb-2">4</p>
              <p className="text-gray-300">Core Team Archetypes</p>
            </div>
            <div>
              <p className="text-5xl font-bold text-purple-400 mb-2">100%</p>
              <p className="text-gray-300">AI-Powered Analysis</p>
            </div>
            <div>
              <p className="text-5xl font-bold text-amber-400 mb-2">∞</p>
              <p className="text-gray-300">Team Combinations</p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-white text-center mb-16">
          How It Works
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Add Your Team</h3>
              <p className="text-gray-300">
                Import team members and candidates with their birth dates. Our system calculates their numerological profile automatically.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Archetype Assessment</h3>
              <p className="text-gray-300">
                Team members complete a quick assessment to determine their primary and secondary archetypes.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Build & Analyze</h3>
              <p className="text-gray-300">
                Use AI to build optimal teams, analyze compatibility, and get detailed insights on team dynamics.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-teal-600 to-blue-600 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Build High-Performing Teams?
          </h2>
          <p className="text-xl text-white/90 mb-10">
            Join forward-thinking HR professionals who use science and AI to build exceptional teams.
          </p>
          <Button className="bg-white text-teal-600 hover:bg-gray-100 text-lg px-10 py-6 font-semibold">
            Start Free Trial
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400 mb-2">
            For more information, contact us at{' '}
            <a href="mailto:spmaher1969@icloud.com" className="text-teal-400 hover:text-teal-300 underline">
              spmaher1969@icloud.com
            </a>
          </p>
          <p className="text-gray-400">
            © {new Date().getFullYear()} TeamBuilder7A - A Product of Threshold7 Analytics
          </p>
          <p className="text-teal-400 mt-2 font-semibold">Stay Above the Threshold.</p>
        </div>
      </div>

      {/* Demo Modal */}
      <Dialog open={showDemo} onOpenChange={setShowDemo}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white text-2xl">TeamBuilder7A Demo Tour</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Feature 1 */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold">1</div>
                <h3 className="text-xl font-semibold text-white">Add Your Team Members</h3>
              </div>
              <p className="text-gray-300 ml-11">
                Upload resumes or manually add team members and candidates with their birth dates. AI automatically extracts skills and experience.
              </p>
              <img 
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=400&fit=crop" 
                alt="Team management" 
                className="w-full rounded-lg border border-slate-700"
              />
            </div>

            {/* Feature 2 */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">2</div>
                <h3 className="text-xl font-semibold text-white">Team Archetype Analysis</h3>
              </div>
              <p className="text-gray-300 ml-11">
                Each team member completes a quick assessment to discover their archetype: Visionary, Strategist, Creator, or Harmonizer.
              </p>
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=400&fit=crop" 
                alt="Archetype test" 
                className="w-full rounded-lg border border-slate-700"
              />
            </div>

            {/* Feature 3 */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold">3</div>
                <h3 className="text-xl font-semibold text-white">Numerology Profiles</h3>
              </div>
              <p className="text-gray-300 ml-11">
                Automatically calculate Life Path, Expression, Soul Urge, and other numerological insights from birth dates and names.
              </p>
              <img 
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop" 
                alt="Numerology" 
                className="w-full rounded-lg border border-slate-700"
              />
            </div>

            {/* Feature 4 */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">4</div>
                <h3 className="text-xl font-semibold text-white">AI-Powered Compatibility</h3>
              </div>
              <p className="text-gray-300 ml-11">
                Match candidates to teams and roles with AI-powered compatibility scoring based on numerology, skills, and team dynamics.
              </p>
              <img 
                src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=400&fit=crop" 
                alt="Compatibility" 
                className="w-full rounded-lg border border-slate-700"
              />
            </div>

            {/* Feature 5 */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">5</div>
                <h3 className="text-xl font-semibold text-white">Optimal Team Builder</h3>
              </div>
              <p className="text-gray-300 ml-11">
                Let AI assemble perfectly balanced teams based on numerology, archetypes, and astrological factors including Chinese Zodiac compatibility.
              </p>
              <img 
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop" 
                alt="Team builder" 
                className="w-full rounded-lg border border-slate-700"
              />
            </div>


          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}