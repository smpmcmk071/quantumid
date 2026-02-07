import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { Button } from '@/components/ui/button';
import { Shield, Download, Zap, Lock, Globe, Sparkles } from 'lucide-react';

export default function Marketing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-sm border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold">
            <span className="text-cyan-400">Quantum</span><span className="text-purple-400">ID</span>
          </div>
          <Link to={createPageUrl('UserQuantumProfile')}>
            <Button className="bg-gradient-to-r from-cyan-600 to-purple-600">Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="mb-8">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Self-Sovereign Identity Powered by the Stars
          </h1>
          <p className="text-xl text-purple-200 max-w-2xl mx-auto mb-8">
            Create your unique QuantumID — a blockchain-ready digital identity that combines numerology, astrology, and cryptography for ultimate self-sovereignty.
          </p>
          <Link to={createPageUrl('UserQuantumProfile')}>
            <Button size="lg" className="bg-gradient-to-r from-cyan-600 to-purple-600 text-white">
              Create Your QuantumID
            </Button>
          </Link>
        </div>

        {/* Hero Image */}
        <div className="mt-12 rounded-2xl overflow-hidden border border-purple-500/30 shadow-2xl">
          <img 
            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=600&fit=crop" 
            alt="Digital Identity" 
            className="w-full h-auto"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>
        
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Feature 1: Calculate */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-8 hover:border-purple-500/50 transition">
            <div className="mb-4">
              <Zap className="w-12 h-12 text-cyan-400" />
            </div>
            <h3 className="text-2xl font-bold mb-3">1. Calculate Your Profile</h3>
            <p className="text-purple-200">
              Enter your birth date, time, and location. Our system calculates your astrological signs, numerology numbers, and life path.
            </p>
            <img 
              src="https://images.unsplash.com/photo-1518611505868-d7b6b08cb42b?w=400&h=300&fit=crop" 
              alt="Calculation" 
              className="mt-6 rounded-lg w-full"
            />
          </div>

          {/* Feature 2: Generate */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-8 hover:border-purple-500/50 transition">
            <div className="mb-4">
              <Shield className="w-12 h-12 text-green-400" />
            </div>
            <h3 className="text-2xl font-bold mb-3">2. Generate QuantumID</h3>
            <p className="text-purple-200">
              Your unique ID is generated using SHA-256 hashing of your astronomical and personal data, creating an unforgeable signature.
            </p>
            <img 
              src="https://images.unsplash.com/photo-1639792033246-71d4d8f53344?w=400&h=300&fit=crop" 
              alt="Generation" 
              className="mt-6 rounded-lg w-full"
            />
          </div>

          {/* Feature 3: Organize */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-8 hover:border-purple-500/50 transition">
            <div className="mb-4">
              <Lock className="w-12 h-12 text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold mb-3">3. Organize Your Data</h3>
            <p className="text-purple-200">
              Capture and secure your job history, family data, important dates, and tax information all in one protected place.
            </p>
            <img 
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop" 
              alt="Organization" 
              className="mt-6 rounded-lg w-full"
            />
          </div>
        </div>
      </section>

      {/* Export Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 bg-gradient-to-r from-slate-800/50 to-purple-800/50 rounded-2xl border border-purple-500/20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-6 flex items-center gap-3">
              <Download className="w-10 h-10 text-cyan-400" />
              Export Your Identity
            </h2>
            <p className="text-lg text-purple-200 mb-6">
              Choose exactly what data you want to export. Your QuantumID is blockchain-ready and can be exported in JSON format for maximum portability.
            </p>
            <ul className="space-y-3 text-purple-200 mb-8">
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                Export QuantumID & Security Hashes
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                Include Job History & Experience
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                Export Family & Personal Data
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                Include Tax Records & Financial Data
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                Blockchain-Ready Format
              </li>
            </ul>
            <Link to={createPageUrl('UserQuantumProfile')}>
              <Button className="bg-gradient-to-r from-cyan-600 to-purple-600">
                Start Exporting
              </Button>
            </Link>
          </div>
          <img 
            src="https://images.unsplash.com/photo-1460925895917-adf4e566c675?w=500&h=600&fit=crop" 
            alt="Export" 
            className="rounded-xl border border-purple-500/30"
          />
        </div>
      </section>

      {/* Security Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-center mb-16">Enterprise-Grade Security</h2>
        
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <img 
            src="https://images.unsplash.com/photo-1516321318423-f06f70550b60?w=500&h=400&fit=crop" 
            alt="Security" 
            className="rounded-xl border border-purple-500/30"
          />
          <div>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <Globe className="w-8 h-8 text-cyan-400 mt-1" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">SHA-256 Encryption</h3>
                  <p className="text-purple-200">Your QuantumID is protected with military-grade SHA-256 hashing, making it virtually impossible to reverse-engineer.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <Lock className="w-8 h-8 text-green-400 mt-1" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Protection Hash</h3>
                  <p className="text-purple-200">An additional random protection hash adds a second layer of security to your identity profile.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <Sparkles className="w-8 h-8 text-purple-400 mt-1" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Blockchain-Ready</h3>
                  <p className="text-purple-200">Your data is prepared for blockchain integration, ensuring permanent, tamper-proof records on decentralized networks.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="text-4xl font-bold mb-6">Ready to Own Your Identity?</h2>
        <p className="text-xl text-purple-200 mb-8 max-w-2xl mx-auto">
          Create your QuantumID today and take full control of your digital self-sovereign identity.
        </p>
        <Link to={createPageUrl('UserQuantumProfile')}>
          <Button size="lg" className="bg-gradient-to-r from-cyan-600 to-purple-600">
            Get Started Now
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900/90 backdrop-blur-sm border-t border-purple-500/20 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-6 text-center text-purple-200">
          <p>© {new Date().getFullYear()} QuantumID - Self-Sovereign Identity Powered by Numerology & Astrology</p>
        </div>
      </footer>
    </div>
  );
}