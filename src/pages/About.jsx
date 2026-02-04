import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Star, Sparkles, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-12 h-12 text-cyan-400" />
            <h1 className="text-5xl font-bold text-white">QuantumID</h1>
          </div>
          <p className="text-purple-200 text-xl">
            Self-sovereign identity powered by numerology, astrology, and blockchain-ready export
          </p>
        </div>

        <Card className="bg-slate-900/50 backdrop-blur-sm border-purple-500/30 mb-8">
          <CardHeader>
            <CardTitle className="text-white text-2xl">What is QuantumID?</CardTitle>
          </CardHeader>
          <CardContent className="text-purple-200 space-y-4">
            <p>
              QuantumID is a self-sovereign identity system that combines numerology, astrology, and 
              cryptography to create a unique, portable digital identity. Unlike traditional databases, 
              your QuantumID is generated client-side and stored nowhere—giving you complete control 
              over your data.
            </p>
            <p>
              By analyzing your birth date, name, and astrological profile, we generate a SHA-256 hash-based 
              identifier linked to planetary codes, numerological values, and protective security hashes. 
              Your data is blockchain-ready for future decentralized systems and personal data portability.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 backdrop-blur-sm border-purple-500/30 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-400" />
              Numerology Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="text-purple-200 space-y-2">
            <p>
              We calculate your Life Path, Expression, Soul Urge, and Personality numbers from 
              your birth date and name. Each number reveals different aspects of your energetic blueprint.
            </p>
            <p className="text-sm text-purple-300">
              • Life Path: Your core essence and life journey<br />
              • Expression: How you express yourself creatively<br />
              • Soul Urge: Your inner desires and motivations<br />
              • Master Numbers: Special spiritual significance
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 backdrop-blur-sm border-purple-500/30 mb-8">
          <CardHeader>
            <CardTitle className="text-white text-2xl">How It Works</CardTitle>
          </CardHeader>
          <CardContent className="text-purple-200 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 text-white font-bold">1</div>
              <div>
                <h3 className="font-semibold text-white mb-1">Build Your Cosmic Profile</h3>
                <p>Enter your birth date, time, location, and full name to generate your numerological and astrological profile with complete details.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 text-white font-bold">2</div>
              <div>
                <h3 className="font-semibold text-white mb-1">Generate Your QuantumID</h3>
                <p>We calculate your unique SHA-256 hash-based ID with planetary codes and protection hashes—never stored on servers.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 text-white font-bold">3</div>
              <div>
                <h3 className="font-semibold text-white mb-1">Add Your Data</h3>
                <p>Capture your job history, family information, hobbies, and other personal details—or import from your resume.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 text-white font-bold">4</div>
              <div>
                <h3 className="font-semibold text-white mb-1">Export & Control</h3>
                <p>Download your complete backup in blockchain-ready format. Your identity, your control, your data.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link to={createPageUrl('UserMusicProfileSetup')}>
            <Button className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-lg px-8 py-6">
              <Shield className="w-5 h-5 mr-2" />
              Create Your QuantumID
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}