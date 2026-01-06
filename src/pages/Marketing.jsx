import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Sparkles, Users, Target, TrendingUp, Zap, Shield, Clock } from 'lucide-react';
import TeamBuilder7A_Logo from '../components/TeamBuilder7A_Logo';

export default function Marketing() {
  const plans = [
    {
      name: 'Starter',
      price: '$199',
      period: '/month',
      description: 'Perfect for small teams getting started',
      features: [
        'Up to 3 teams',
        'Up to 50 total team members',
        'AI-powered team building',
        'Numerology analysis',
        'Candidate matching (10/month)',
        'Basic reports',
        'Email support'
      ],
      cta: 'Start Free Trial',
      popular: false
    },
    {
      name: 'Professional',
      price: '$499',
      period: '/month',
      description: 'For growing organizations',
      features: [
        'Up to 10 teams',
        'Up to 200 total team members',
        'AI-powered team building',
        'Advanced numerology insights',
        'Unlimited candidate matching',
        'Job posting & ranking',
        'Advanced reports & analytics',
        'Priority email support',
        'Onboarding assistance'
      ],
      cta: 'Start Free Trial',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'For large organizations',
      features: [
        'Unlimited teams',
        'Unlimited team members',
        'AI-powered team building',
        'Full numerology suite',
        'Unlimited candidate matching',
        'Job posting & ranking',
        'Custom reports & analytics',
        'Dedicated account manager',
        'White-label options',
        'API access',
        'Custom integrations'
      ],
      cta: 'Contact Sales',
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-16">
          <TeamBuilder7A_Logo size="lg" />
          <h1 className="text-4xl md:text-6xl font-bold text-white mt-8 mb-4">
            Build High-Performing Teams
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-2">
            Using 4,000 Years of Numerology + Modern Team Science
          </p>
          <p className="text-lg text-teal-400 font-semibold">
            Stay Above the Threshold
          </p>
          <p className="text-gray-400 mt-2">A Product of Threshold7 Analytics</p>
        </div>

        {/* Value Props */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="pt-6 text-center">
              <Target className="w-12 h-12 text-teal-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">AI-Powered Matching</h3>
              <p className="text-gray-300">Match candidates to teams and roles with 95%+ accuracy using numerology + skills</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="pt-6 text-center">
              <Zap className="w-12 h-12 text-amber-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Instant Team Building</h3>
              <p className="text-gray-300">Create balanced teams in seconds - just say the size and number</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="pt-6 text-center">
              <TrendingUp className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Proven Results</h3>
              <p className="text-gray-300">Based on 50+ years of team science research + ancient wisdom</p>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Section */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-white text-center mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-gray-300 text-center mb-12">
            All plans include 14-day free trial. No credit card required.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, idx) => (
              <Card 
                key={idx}
                className={`relative ${
                  plan.popular 
                    ? 'bg-gradient-to-br from-teal-500/20 to-blue-500/20 border-teal-400/50 shadow-xl scale-105' 
                    : 'bg-white/10 backdrop-blur-sm border-white/20'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-teal-500 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                      <Sparkles className="w-4 h-4" />
                      Most Popular
                    </span>
                  </div>
                )}
                
                <CardHeader>
                  <CardTitle className="text-2xl text-white">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-gray-400">{plan.period}</span>
                  </div>
                  <p className="text-gray-400 text-sm mt-2">{plan.description}</p>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-300">
                        <Check className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className={`w-full ${
                      plan.popular 
                        ? 'bg-teal-500 hover:bg-teal-600' 
                        : 'bg-slate-700 hover:bg-slate-600'
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Why TeamBuilder7A */}
        <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30 mb-16">
          <CardHeader>
            <CardTitle className="text-3xl text-white text-center">
              Why TeamBuilder7A?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6 text-gray-300">
              <div className="flex gap-3">
                <Shield className="w-6 h-6 text-teal-400 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-white mb-1">Science-Backed</h4>
                  <p>Built on research from Lencioni, Belbin, Tuckman, and 4,000 years of numerology</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Clock className="w-6 h-6 text-teal-400 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-white mb-1">Save 100+ Hours/Year</h4>
                  <p>Eliminate trial-and-error team building. Get it right the first time.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Users className="w-6 h-6 text-teal-400 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-white mb-1">4 Core Archetypes</h4>
                  <p>Every team needs Visionaries, Strategists, Creators, and Harmonizers - we ensure balance</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Target className="w-6 h-6 text-teal-400 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-white mb-1">AI-Powered Insights</h4>
                  <p>Every recommendation comes with detailed reasoning - know exactly why each person fits</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Build Better Teams?
          </h2>
          <p className="text-gray-300 mb-8">
            Start your 14-day free trial today. No credit card required.
          </p>
          <Button className="bg-teal-500 hover:bg-teal-600 text-lg px-8 py-6">
            Start Free Trial
          </Button>
          <p className="text-gray-400 text-sm mt-4">
            Questions? Email <a href="mailto:7day11com@gmail.com" className="text-teal-400 underline">7day11com@gmail.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}