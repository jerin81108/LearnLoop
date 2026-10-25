import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Target,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Stethoscope,
  Mic,
  Code2,
  Users,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  Shield,
  Layers,
  ChevronRight,
  Play,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    user,
    activeGoal,
    navigateTo,
    recentSimulations,
    codingSubmissions,
    diagnosticHistory,
    studyPods,
  } = useApp();

  // Calculate demonstrated readiness score
  const skills = activeGoal?.skills || [];
  const assessedSkills = skills.filter((s) => s.confidence !== 'unassessed');
  const avgScore =
    assessedSkills.length > 0
      ? Math.round(assessedSkills.reduce((acc, s) => acc + s.currentScore, 0) / assessedSkills.length)
      : 0;
  const totalEvidenceCitations = skills.reduce((acc, s) => acc + s.evidenceCount, 0);

  // Derive recommended next action
  const lowestAssessedSkill = [...skills]
    .filter((s) => s.confidence !== 'unassessed')
    .sort((a, b) => a.currentScore - b.currentScore)[0];

  const unassessedSkill = skills.find((s) => s.confidence === 'unassessed');

  let nextActionTitle = 'Complete Adaptive Diagnostic';
  let nextActionDesc = 'Identify your baseline strengths and evidence gaps across target skills.';
  let nextActionRoute = 'diagnostic';
  let nextActionTag = 'Diagnostic';

  if (unassessedSkill) {
    nextActionTitle = `Diagnose ${unassessedSkill.name}`;
    nextActionDesc = `You have no evidence recorded for "${unassessedSkill.name}". Complete a short 3-minute diagnostic drill.`;
    nextActionRoute = 'diagnostic';
    nextActionTag = 'Skill Gap';
  } else if (lowestAssessedSkill && lowestAssessedSkill.currentScore < 75) {
    nextActionTitle = `Interactive Simulation: ${lowestAssessedSkill.name}`;
    nextActionDesc = `Your current demonstrated score is ${lowestAssessedSkill.currentScore}%. Target is ${lowestAssessedSkill.targetScore}%. Practice with an AI interviewer.`;
    nextActionRoute = 'voice-setup';
    nextActionTag = 'Targeted Practice';
  } else if (recentSimulations.length > 0) {
    nextActionTitle = 'Peer Study Pod Group Defense';
    nextActionDesc = 'Defend your architectural trade-offs in your matched peer pod.';
    nextActionRoute = 'study-pods';
    nextActionTag = 'Peer Challenge';
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* 1. HERO: Active Goal & Readiness Overview */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-950/60 via-slate-900/80 to-slate-950 p-6 sm:p-8 backdrop-blur-xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="badge badge-indigo">
                <Target className="w-3.5 h-3.5" />
                Active Focus Goal
              </span>
              <span className="badge badge-slate text-[11px] font-mono">
                {activeGoal?.domain ? activeGoal.domain.replace('_', ' ').toUpperCase() : 'TECHNICAL INTERVIEW'}
              </span>
              {activeGoal?.deadline && (
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Target Date: {activeGoal.deadline}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {activeGoal?.title || 'Personalized Readiness Goal'}
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              {activeGoal?.description}
            </p>

            <div className="flex items-center gap-2 text-xs text-indigo-300 pt-1">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Target Outcome: {activeGoal?.targetOutcome}</span>
            </div>
          </div>

          {/* Readiness Evidence Gauge Card */}
          <div className="flex sm:flex-col items-center justify-center p-5 rounded-2xl bg-slate-900/90 border border-white/10 shadow-2xl shrink-0 min-w-[220px]">
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-extrabold font-mono text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-emerald-300 to-teal-200">
                {avgScore}%
              </div>
              <div className="text-xs font-semibold text-slate-300 mt-1 uppercase tracking-wider">
                Demonstrated Score
              </div>
              <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-center gap-1">
                <Shield className="w-3 h-3 text-emerald-400" />
                <span>{totalEvidenceCitations} verified citations</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 w-full text-center">
              <span className="text-[10px] text-slate-400 leading-tight block">
                Evidence-derived from {assessedSkills.length} assessed dimensions. Never an arbitrary claim.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. NEXT RECOMMENDED ACTION BANNER */}
      <div className="glass-card p-5 border-l-4 border-l-indigo-500 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-indigo-500/15 text-indigo-400 shrink-0 mt-0.5">
            <Play className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="badge badge-indigo text-[10px] uppercase tracking-wide">
                {nextActionTag}
              </span>
              <span className="text-xs text-slate-400">Next Recommended Action</span>
            </div>
            <h3 className="text-base font-bold text-white mt-1">{nextActionTitle}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{nextActionDesc}</p>
          </div>
        </div>

        <button
          onClick={() => navigateTo(nextActionRoute)}
          className="btn btn-primary text-xs py-2.5 px-4 shrink-0 w-full md:w-auto"
        >
          Launch Exercise <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 3. SKILL MAP & EVIDENCE RADAR SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              Verified Skill Map & Confidence
            </h2>
            <p className="text-xs text-slate-400">
              Scores reflect demonstrated performance during simulated interviews, code rounds, and diagnostics.
            </p>
          </div>
          <button
            onClick={() => navigateTo('diagnostic')}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 bg-transparent border-none cursor-pointer"
          >
            Run Full Diagnostic <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((skill) => {
            const isUnassessed = skill.confidence === 'unassessed';
            let badgeClass = 'badge-slate';
            let badgeText = 'Unassessed';
            let barColor = 'bg-slate-700';

            if (skill.confidence === 'high') {
              badgeClass = 'badge-emerald';
              badgeText = 'High Confidence';
              barColor = 'bg-emerald-400';
            } else if (skill.confidence === 'medium') {
              badgeClass = 'badge-indigo';
              badgeText = 'Medium Confidence';
              barColor = 'bg-indigo-400';
            } else if (skill.confidence === 'low') {
              badgeClass = 'badge-amber';
              badgeText = 'Low Confidence';
              barColor = 'bg-amber-400';
            }

            return (
              <div key={skill.id} className="glass-card p-4 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-sm text-slate-100">{skill.name}</span>
                    <span className={`badge ${badgeClass} text-[10px]`}>{badgeText}</span>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-2">
                    {skill.subSkills.map((sub, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-white/5 text-slate-400"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-white/5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">
                      {isUnassessed ? 'No prior drills' : 'Demonstrated Ability'}
                    </span>
                    <span className="font-bold text-white">
                      {isUnassessed ? '--' : `${skill.currentScore}%`}
                    </span>
                  </div>

                  <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                      style={{ width: `${isUnassessed ? 0 : skill.currentScore}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                    <span>Target: {skill.targetScore}%</span>
                    <span>
                      {skill.evidenceCount > 0
                        ? `${skill.evidenceCount} evidence items`
                        : 'Requires evaluation'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. PRACTICE ENTRY POINTS: VOICE, CODING, STUDY PODS */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          Active Practice Modes
        </h2>

        <div className="grid gap-4 md:grid-cols-3">
          {/* Mode 1: Voice Simulation */}
          <div
            onClick={() => navigateTo('voice-setup')}
            className="glass-card p-5 space-y-4 cursor-pointer group hover:border-indigo-500/50 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <Mic className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white group-hover:text-indigo-300 transition-colors">
                Conversational Voice Simulation
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Turn-by-turn spoken interviews with live speech-to-text transcript, natural follow-ups, and audio synthesis feedback.
              </p>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs font-semibold text-indigo-400">
              <span>Start Voice Session</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Mode 2: Coding Round */}
          <div
            onClick={() => navigateTo('coding')}
            className="glass-card p-5 space-y-4 cursor-pointer group hover:border-emerald-500/50 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
                <Code2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white group-hover:text-emerald-300 transition-colors">
                Sandboxed Coding Round
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Algorithmic problem solving with safe in-browser test runner, edge case stress tests, and complexity verification.
              </p>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs font-semibold text-emerald-400">
              <span>Open Code Editor</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Mode 3: Peer Study Pods */}
          <div
            onClick={() => navigateTo('study-pods')}
            className="glass-card p-5 space-y-4 cursor-pointer group hover:border-violet-500/50 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-violet-500/15 text-violet-400 flex items-center justify-center group-hover:bg-violet-600 group-hover:text-white transition-all">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white group-hover:text-violet-300 transition-colors">
                Peer Study Pods
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Matched with peers having complementary strengths and gaps. Collaborative challenge defense with zero transcript leak.
              </p>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs font-semibold text-violet-400">
              <span>View Matched Pods</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* 5. RECENT ACTIVITY & EVIDENCE TRACE */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-400" />
          Recent Verified Practice History
        </h2>

        {recentSimulations.length === 0 && codingSubmissions.length === 0 ? (
          <div className="p-8 rounded-2xl border border-dashed border-white/10 text-center space-y-3 bg-slate-900/40">
            <HelpCircle className="w-8 h-8 text-slate-500 mx-auto" />
            <div className="text-sm font-medium text-slate-300">No practice rounds completed yet</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Your demonstrated evidence, quotes, and rubric breakdowns will be permanently organized here after each session.
            </p>
            <button
              onClick={() => navigateTo('voice-setup')}
              className="btn btn-secondary text-xs mt-2"
            >
              Start First Practice Session
            </button>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {recentSimulations.slice(0, 4).map((sim) => (
              <div key={sim.id} className="glass-card p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="badge badge-indigo text-[10px]">Voice Simulation</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {sim.score}%
                  </span>
                </div>
                <div className="text-sm font-semibold text-white">{sim.title}</div>
                <p className="text-xs text-slate-400 line-clamp-2">{sim.result.summary}</p>
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{new Date(sim.date).toLocaleDateString()}</span>
                  <span className="text-indigo-400">{sim.result.evidenceCoverage}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
