import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Compass,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Mic,
  Code2,
  Users,
  Target,
  ArrowRight,
  Lock,
} from 'lucide-react';
import { ExperienceLevel } from '../types';

export const WelcomeAuthView: React.FC = () => {
  const { setUser, navigateTo, addToast } = useApp();
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'demo'>('demo');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('student');

  const handleDemoSignIn = (persona: 'alex' | 'maya' | 'elena') => {
    let chosenUser = {
      id: 'demo-user-1',
      email: 'alex.mercer@learnloop.io',
      fullName: 'Alex Mercer',
      experienceLevel: 'student' as ExperienceLevel,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      isDemoUser: true,
    };

    if (persona === 'maya') {
      chosenUser = {
        id: 'demo-user-2',
        email: 'maya.chen@learnloop.io',
        fullName: 'Maya Chen',
        experienceLevel: 'career_switcher' as ExperienceLevel,
        avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
        isDemoUser: true,
      };
    } else if (persona === 'elena') {
      chosenUser = {
        id: 'demo-user-3',
        email: 'elena.rostova@learnloop.io',
        fullName: 'Elena Rostova',
        experienceLevel: 'language_learner' as ExperienceLevel,
        avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
        isDemoUser: true,
      };
    }

    setUser(chosenUser);
    addToast('success', `Signed in as ${chosenUser.fullName} (Demo Persona)`);
    navigateTo('dashboard');
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      addToast('warning', 'Please enter a valid email address.');
      return;
    }

    const newUser = {
      id: `user-${Date.now()}`,
      email,
      fullName: fullName || email.split('@')[0],
      experienceLevel,
      isDemoUser: false,
    };

    setUser(newUser);
    addToast('success', `Welcome to LearnLoop, ${newUser.fullName}!`);
    navigateTo('dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-xl shadow-indigo-500/25 mb-4">
          <Compass className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
          Learn<span className="text-indigo-400">Loop</span>
        </h1>
        <p className="mt-2 text-sm text-slate-400 max-w-sm mx-auto">
          The evidence-based learning & readiness platform. Make capability visible through demonstrated practice.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl z-10 px-4">
        <div className="glass-panel p-6 sm:p-8">
          {/* Mode Switcher Tabs */}
          <div className="flex border-b border-white/10 pb-4 mb-6 gap-3">
            <button
              onClick={() => setAuthMode('demo')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer border ${
                authMode === 'demo'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-900/60 text-slate-400 border-white/5 hover:text-white'
              }`}
            >
              Instant Demo Personas
            </button>
            <button
              onClick={() => setAuthMode('signin')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer border ${
                authMode === 'signin' || authMode === 'signup'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-900/60 text-slate-400 border-white/5 hover:text-white'
              }`}
            >
              Sign In / Custom Account
            </button>
          </div>

          {authMode === 'demo' ? (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0 text-indigo-400" />
                <span>
                  Zero setup required. Select a pre-configured learner profile with simulated skill history and evidence citations.
                </span>
              </div>

              <div className="grid gap-3 pt-2">
                {/* Persona 1: Student / Placement */}
                <div
                  onClick={() => handleDemoSignIn('alex')}
                  className="glass-card p-4 flex items-center justify-between cursor-pointer group hover:border-indigo-500/50"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
                      alt="Alex Mercer"
                      className="w-12 h-12 rounded-xl object-cover ring-2 ring-indigo-500/30"
                    />
                    <div>
                      <div className="font-semibold text-white group-hover:text-indigo-300 transition-colors">
                        Alex Mercer
                      </div>
                      <div className="text-xs text-slate-400">Campus Graduate • Software Placement</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="badge badge-emerald text-[10px]">78% Readiness</span>
                        <span className="text-[11px] text-slate-400">21 verified citations</span>
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                </div>

                {/* Persona 2: Career Switcher */}
                <div
                  onClick={() => handleDemoSignIn('maya')}
                  className="glass-card p-4 flex items-center justify-between cursor-pointer group hover:border-indigo-500/50"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100"
                      alt="Maya Chen"
                      className="w-12 h-12 rounded-xl object-cover ring-2 ring-violet-500/30"
                    />
                    <div>
                      <div className="font-semibold text-white group-hover:text-violet-300 transition-colors">
                        Maya Chen
                      </div>
                      <div className="text-xs text-slate-400">Career Switcher • Product Management & System Design</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="badge badge-indigo text-[10px]">65% Readiness</span>
                        <span className="text-[11px] text-slate-400">14 verified citations</span>
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                </div>

                {/* Persona 3: Language Learner */}
                <div
                  onClick={() => handleDemoSignIn('elena')}
                  className="glass-card p-4 flex items-center justify-between cursor-pointer group hover:border-indigo-500/50"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100"
                      alt="Elena Rostova"
                      className="w-12 h-12 rounded-xl object-cover ring-2 ring-emerald-500/30"
                    />
                    <div>
                      <div className="font-semibold text-white group-hover:text-emerald-300 transition-colors">
                        Elena Rostova
                      </div>
                      <div className="text-xs text-slate-400">Professional • Executive Fluency & Interview Clarity</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="badge badge-amber text-[10px]">Unassessed Gaps</span>
                        <span className="text-[11px] text-slate-400">Ready for diagnostic</span>
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCustomSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Jordan Rivera"
                  className="form-input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jordan@example.com"
                  className="form-input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Target Learner Category
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
                  className="form-select"
                >
                  <option value="student">Student / Recent Graduate (Placements)</option>
                  <option value="career_switcher">Career Switcher (Tech/Product/Sales)</option>
                  <option value="language_learner">Language Learner (Fluency & Clarity)</option>
                  <option value="bootcamp_cohort">College / Bootcamp Cohort Member</option>
                  <option value="professional">Mid-Career Professional</option>
                </select>
              </div>

              <div className="pt-2">
                <button type="submit" className="btn btn-primary w-full py-3">
                  Get Started With Evidence Practice
                </button>
              </div>
            </form>
          )}

          {/* Privacy Promise Callout */}
          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Transcripts stored safely with strict RLS
            </span>
            <span className="flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              Private Practice
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
