import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Compass,
  Mic,
  Cpu,
  Database,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Target,
  User,
  Shield,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    user,
    activeGoal,
    systemCapabilities,
    isDemoMode,
    setIsDemoMode,
    navigateTo,
  } = useApp();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-md px-4 lg:px-8 py-3.5 flex items-center justify-between">
      {/* Brand & Active Goal Indicator */}
      <div className="flex items-center gap-4 lg:gap-8">
        <button
          onClick={() => navigateTo('dashboard')}
          className="flex items-center gap-2.5 text-left group bg-transparent border-none p-0 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <Compass className="w-5 h-5 text-white animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-white">LearnLoop</span>
              <span className="badge badge-indigo text-[10px] py-0.5 px-1.5 uppercase font-mono">
                Evidence AI
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Demonstrated Career Readiness</p>
          </div>
        </button>

        {/* Current Active Goal Badge */}
        {activeGoal && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-indigo-500/30 text-xs">
            <Target className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="text-slate-400">Active Goal:</span>
            <span className="font-medium text-slate-200 truncate max-w-[200px] lg:max-w-[320px]">
              {activeGoal.title}
            </span>
            <button
              onClick={() => navigateTo('goals')}
              className="text-indigo-400 hover:text-indigo-300 text-[11px] underline ml-1 cursor-pointer bg-transparent border-none p-0"
            >
              Switch
            </button>
          </div>
        )}
      </div>

      {/* Right Controls: Capabilities, Demo Toggle, User Profile */}
      <div className="flex items-center gap-3">
        {/* System Capability Pills */}
        <div className="hidden lg:flex items-center gap-2 text-xs">
          {/* Groq AI Status */}
          <div
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full border ${
              systemCapabilities.groqConfigured
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
                : 'bg-indigo-950/40 border-indigo-500/30 text-indigo-300'
            }`}
            title={
              systemCapabilities.groqConfigured
                ? 'Groq LLM inference connected'
                : 'Deterministic evidence evaluation engine active'
            }
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>{systemCapabilities.groqConfigured ? 'Groq Active' : 'AI Engine Ready'}</span>
          </div>

          {/* Web Speech Status */}
          <div
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full border ${
              systemCapabilities.speechSupported
                ? 'bg-slate-900 border-white/10 text-slate-300'
                : 'bg-amber-950/40 border-amber-500/30 text-amber-300'
            }`}
            title={
              systemCapabilities.speechSupported
                ? 'Web Speech API supported in this browser'
                : 'Speech API unavailable - text fallback enabled'
            }
          >
            <Mic className="w-3.5 h-3.5" />
            <span>{systemCapabilities.speechSupported ? 'Speech API' : 'Text Fallback'}</span>
          </div>

          {/* Supabase Status */}
          <div
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full border ${
              systemCapabilities.supabaseConfigured
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
                : 'bg-slate-900 border-white/10 text-slate-400'
            }`}
            title={
              systemCapabilities.supabaseConfigured
                ? 'Connected to Supabase PostgreSQL'
                : 'Demo/Local storage persistence active'
            }
          >
            <Database className="w-3.5 h-3.5" />
            <span>{systemCapabilities.supabaseConfigured ? 'Supabase Live' : 'Local Storage'}</span>
          </div>
        </div>

        {/* Demo Mode Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-xs text-indigo-300 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Demo Mode</span>
        </div>

        {/* User Profile Avatar */}
        {user ? (
          <button
            onClick={() => navigateTo('profile')}
            className="flex items-center gap-2.5 p-1 pl-2 rounded-xl bg-slate-900/80 border border-white/10 hover:border-indigo-500/40 transition-colors cursor-pointer"
          >
            <span className="text-xs font-medium text-slate-200 hidden sm:inline max-w-[100px] truncate">
              {user.fullName}
            </span>
            <img
              src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={user.fullName}
              className="w-8 h-8 rounded-lg object-cover ring-1 ring-white/20"
            />
          </button>
        ) : (
          <button
            onClick={() => navigateTo('welcome')}
            className="btn btn-primary text-xs py-2 px-3.5"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};
