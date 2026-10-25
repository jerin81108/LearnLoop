import React from 'react';
import { useApp } from '../context/AppContext';
import {
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Shield,
  Layers,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Code2,
  Users,
} from 'lucide-react';
import { SimulationResult, PracticeTurn, VoiceScenario } from '../types';

export const SimulationResultsView: React.FC<{
  scenario: VoiceScenario;
  result: SimulationResult;
  turns: PracticeTurn[];
}> = ({ scenario, result, turns }) => {
  const { navigateTo } = useApp();

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <span className="badge badge-emerald text-xs">
            <CheckCircle2 className="w-3.5 h-3.5" /> Simulation Completed & Evaluated
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            {scenario.title} — Evidence Report
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Evaluated {turns.filter((t) => t.speaker === 'learner').length} learner turns • Confidence:{' '}
            <strong className="text-emerald-400">{result.confidenceRating.toUpperCase()}</strong>
          </p>
        </div>

        <button
          onClick={() => navigateTo('dashboard')}
          className="btn btn-primary text-xs py-2.5 px-4 flex items-center gap-2"
        >
          View Updated Dashboard <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Summary Score Hero */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="glass-card p-5 space-y-1 text-center">
          <div className="text-4xl font-mono font-extrabold text-emerald-400">
            {result.overallScore}%
          </div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Demonstrated Session Score
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            {result.evidenceCoverage}
          </div>
        </div>

        <div className="glass-card p-5 space-y-1 text-center sm:col-span-2 flex flex-col justify-center text-left">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Executive Session Summary
          </div>
          <p className="text-sm text-slate-200 leading-relaxed pt-1">{result.summary}</p>
        </div>
      </div>

      {/* Rubric Category Breakdown with Evidence */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          Rubric Breakdown Tied to Spoken Evidence
        </h2>

        <div className="grid gap-3 sm:grid-cols-2">
          {result.rubricBreakdown.map((item, idx) => (
            <div key={idx} className="glass-panel p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-slate-100">{item.category}</span>
                <span className="font-mono font-bold text-sm text-emerald-400">
                  {item.score}%
                </span>
              </div>

              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full"
                  style={{ width: `${item.score}%` }}
                />
              </div>

              <div className="text-xs text-slate-400 italic">
                Evidence: "{item.evidence}"
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths & Gaps Supported by Transcript Citations */}
      <div className="grid sm:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="glass-panel p-5 space-y-4 border-emerald-500/30">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <CheckCircle2 className="w-4 h-4" /> Demonstrated Strengths
          </div>

          <div className="space-y-3">
            {result.strengths.map((s, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-white/5 space-y-1.5">
                <div className="font-semibold text-xs text-slate-200">{s.title}</div>
                <div className="evidence-quote">{s.evidence}</div>
                <div className="text-[11px] text-slate-400">Impact: {s.impact}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Gaps */}
        <div className="glass-panel p-5 space-y-4 border-amber-500/30">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <AlertTriangle className="w-4 h-4" /> Evidence Gaps & Next Practice
          </div>

          <div className="space-y-3">
            {result.gaps.map((g, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-white/5 space-y-1.5">
                <div className="font-semibold text-xs text-slate-200">{g.title}</div>
                <div className="evidence-quote">{g.evidence}</div>
                <div className="text-[11px] text-slate-400">
                  Recommendation: {g.recommendation}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Next Recommended Exercises */}
      <div className="glass-card p-5 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" /> Recommended Next Actions
        </h3>
        <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
          {result.nextRecommendedExercises.map((rec, idx) => (
            <li key={idx}>{rec}</li>
          ))}
        </ul>

        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-white/5">
          <button
            onClick={() => navigateTo('coding')}
            className="btn btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5"
          >
            <Code2 className="w-3.5 h-3.5 text-emerald-400" /> Try Coding Round
          </button>
          <button
            onClick={() => navigateTo('study-pods')}
            className="btn btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5 text-violet-400" /> Join Matching Study Pod
          </button>
        </div>
      </div>
    </div>
  );
};
