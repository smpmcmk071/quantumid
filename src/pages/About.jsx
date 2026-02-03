import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Music, Star, Sparkles, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-12 h-12 text-yellow-400" />
            <h1 className="text-5xl font-bold text-white">QuantumVibe</h1>
            <Music className="w-12 h-12 text-purple-400" />
          </div>
          <p className="text-purple-200 text-xl">
            Discover music aligned with your cosmic energy through numerology and astrology
          </p>
        </div>

        <Card className="bg-slate-900/50 backdrop-blur-sm border-purple-500/30 mb-8">
          <CardHeader>
            <CardTitle className="text-white text-2xl">What is QuantumVibe?</CardTitle>
          </CardHeader>
          <CardContent className="text-purple-200 space-y-4">
            <p>
              QuantumVibe is a revolutionary music recommendation system that goes beyond algorithms 
              and listening history. We analyze your birth date, name, and astrological profile to 
              discover music that resonates with your unique energetic signature.
            </p>
            <p>
              By combining ancient wisdom from numerology and astrology with modern music data from 
              Last.fm and MusicBrainz, we create deeply personalized recommendations that align with 
              who you truly are at a cosmic level.
            </p>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-slate-900/50 backdrop-blur-sm border-purple-500/30">
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

          <Card className="bg-slate-900/50 backdrop-blur-sm border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="w-6 h-6 text-pink-400" />
                Astrological Mapping
              </CardTitle>
            </CardHeader>
            <CardContent className="text-purple-200 space-y-2">
              <p>
                Music carries its own astrological signature through key, tempo, mood, and release date. 
                We map these qualities to zodiac signs, planetary influences, and houses.
              </p>
              <p className="text-sm text-purple-300">
                • Musical Key → Zodiac Sign<br />
                • Tempo → Planetary Energy<br />
                • Mood → House Placement<br />
                • Release Date → Numerological Resonance
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-slate-900/50 backdrop-blur-sm border-purple-500/30 mb-8">
          <CardHeader>
            <CardTitle className="text-white text-2xl">How It Works</CardTitle>
          </CardHeader>
          <CardContent className="text-purple-200 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 text-white font-bold">1</div>
              <div>
                <h3 className="font-semibold text-white mb-1">Create Your Cosmic Profile</h3>
                <p>Enter your birth date, time, location, and full name to generate your numerological and astrological profile.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 text-white font-bold">2</div>
              <div>
                <h3 className="font-semibold text-white mb-1">Search for Music</h3>
                <p>Search for any track by artist and song name. We fetch data from Last.fm and analyze its cosmic properties.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 text-white font-bold">3</div>
              <div>
                <h3 className="font-semibold text-white mb-1">Get Your Match Score</h3>
                <p>We calculate a compatibility score based on zodiac alignment, planetary resonance, house placement, and numerological harmony.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 text-white font-bold">4</div>
              <div>
                <h3 className="font-semibold text-white mb-1">Discover Your Soundtrack</h3>
                <p>Build a personalized library of music that truly resonates with your soul's frequency.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link to={createPageUrl('UserMusicProfileSetup')}>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-8 py-6">
              <Sparkles className="w-5 h-5 mr-2" />
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}