import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Target,
  Stethoscope,
  Mic,
  Code2,
  Users,
  Settings,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

interface SidebarProps {
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpenMobile, onCloseMobile }) => {
  const { currentRoute, navigateTo, activeGoal } = useApp();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Learner Dashboard',
      description: 'Skill map & next actions',
      icon: LayoutDashboard,
      badge: 'Hub',
    },
    {
      id: 'goals',
      label: 'Goals & Taxonomy',
      description: 'Set & clarify outcomes',
      icon: Target,
    },
    {
      id: 'diagnostic',
      label: 'Adaptive Diagnostic',
      description: 'Find ability & skill gaps',
      icon: Stethoscope,
      badge: 'Adaptive',
    },
    {
      id: 'voice-setup',
      label: 'Voice Simulation',
      description: 'Spoken mock interviews',
      icon: Mic,
      badge: 'Live Audio',
    },
    {
      id: 'coding',
      label: 'Coding Round',
      description: 'Algorithmic sandbox',
      icon: Code2,
    },
    {
      id: 'study-pods',
      label: 'Peer Study Pods',
      description: 'Complementary matching',
      icon: Users,
      badge: 'Peer',
    },
    {
      id: 'profile',
      label: 'Privacy & Settings',
      description: 'Mic test & RLS privacy',
      icon: Settings,
    },
  ];

  return (
    <aside className={`app-sidebar ${isOpenMobile ? 'sidebar-open' : ''}`}>
      <div className="space-y-6">
        {/* Navigation Section */}
        <div>
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 font-mono">
              Navigation
            </span>
            {isOpenMobile && (
              <button
                onClick={onCloseMobile}
                className="lg:hidden text-xs text-slate-400 hover:text-white bg-transparent border-none cursor-pointer p-1"
                aria-label="Close navigation"
              >
                ✕ Close
              </button>
            )}
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                currentRoute === item.id ||
                (item.id === 'voice-setup' &&
                  (currentRoute === 'voice-live' || currentRoute === 'voice-results')) ||
                (item.id === 'diagnostic' && currentRoute === 'diagnostic-results');

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    navigateTo(item.id);
                    onCloseMobile?.();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-950/70 to-slate-900 border-indigo-500/40 text-white shadow-sm'
                      : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-1.5 rounded-lg ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                          : 'bg-slate-900 text-slate-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium leading-none">{item.label}</div>
                      <div className="text-[11px] text-slate-500 mt-1">{item.description}</div>
                    </div>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                        isActive
                          ? 'bg-indigo-500/30 text-indigo-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Demonstrated Evidence Summary Card in Sidebar */}
        {activeGoal && (
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                Evidence Score
              </span>
              <span className="font-mono font-bold text-emerald-400 text-xs">
                {Math.round(
                  (activeGoal.skills || []).reduce((acc, s) => acc + s.currentScore, 0) /
                    ((activeGoal.skills || []).length || 1)
                )}
                %
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.round(
                    (activeGoal.skills || []).reduce((acc, s) => acc + s.currentScore, 0) /
                      ((activeGoal.skills || []).length || 1)
                  )}%`,
                }}
              />
            </div>
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>Verified citations</span>
              <span className="font-mono text-slate-200">
                {(activeGoal.skills || []).reduce((acc, s) => acc + s.evidenceCount, 0)} points
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info: Evidence Principle */}
      <div className="pt-4 border-t border-white/10 text-[11px] text-slate-500 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
        <span>Evidence-Backed • No Hallucinated Claims</span>
      </div>
    </aside>
  );
};
