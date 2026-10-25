import React from 'react';
import { useApp } from '../context/AppContext';
import {
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
  HelpCircle,
  RotateCcw,
  Mic,
  Code2,
} from 'lucide-react';

export const DiagnosticResultsView: React.FC = () => {
  const { activeDiagnostic, activeGoal, navigateTo } = useApp();

  if (!activeDiagnostic) {
    return (
      <div className="p-12 glass-panel text-center max-w-lg mx-auto space-y-4">
        <HelpCircle className="w-10 h-10 text-slate-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">No Diagnostic Results Found</h2>
        <p className="text-xs text-slate-400">
          Run an adaptive diagnostic to evaluate your active skills and receive evidence-backed findings.
        </p>
        <button
          onClick={() => navigateTo('diagnostic')}
          className="btn btn-primary text-xs py-2.5 px-4"
        >
          Start Diagnostic
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <span className="badge badge-emerald text-xs">
            <CheckCircle2 className="w-3.5 h-3.5" /> Diagnostic Assessment Completed
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Diagnostic Evidence & Skill Report
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Goal: <strong>{activeGoal?.title}</strong> • Assessed on{' '}
            {new Date(activeDiagnostic.completedAt || Date.now()).toLocaleDateString()}
          </p>
        </div>

        <button
          onClick={() => navigateTo('voice-setup')}
          className="btn btn-primary text-xs py-2.5 px-4 flex items-center gap-2"
        >
          <Mic className="w-4 h-4" /> Start Spoken Practice Round
        </button>
      </div>

      {/* Transparent Disclaimer Callout */}
      <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-300 flex items-start gap-3">
        <Shield className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-white">Estimate Based on Completed Exercises:</strong> This
          diagnostic represents an estimate of ability demonstrated during this specific assessment.
          LearnLoop avoids unsupported claims like "job ready" and continuously updates your skill map
          as you complete realistic simulation rounds.
        </div>
      </div>

      {/* Score Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="glass-card p-5 space-y-1 text-center">
          <div className="text-3xl font-mono font-extrabold text-emerald-400">
            {activeDiagnostic.overallScore}%
          </div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Demonstrated Score
          </div>
          <div className="text-[11px] text-slate-500">Across {activeDiagnostic.items.length} items</div>
        </div>

        <div className="glass-card p-5 space-y-1 text-center">
          <div className="text-3xl font-mono font-extrabold text-indigo-400">
            {activeDiagnostic.items.filter((i) => (i.score || 0) >= 70).length}
          </div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Validated Strengths
          </div>
          <div className="text-[11px] text-slate-500">Above proficiency bar</div>
        </div>

        <div className="glass-card p-5 space-y-1 text-center">
          <div className="text-3xl font-mono font-extrabold text-amber-400">
            {activeDiagnostic.items.filter((i) => (i.score || 0) < 70).length}
          </div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Identified Gaps
          </div>
          <div className="text-[11px] text-slate-500">Targeted for next drills</div>
        </div>
      </div>

      {/* Item-by-item Evidence Breakdown */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          Dimension-by-Dimension Evidence Breakdown
        </h2>

        <div className="grid gap-4">
          {activeDiagnostic.items.map((item, idx) => (
            <div key={item.id || idx} className="glass-panel p-5 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-base">{item.skillName}</span>
                  <span className="badge badge-slate text-[10px] font-mono">
                    {item.subSkillName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Score:</span>
                  <span className="font-mono font-bold text-sm text-emerald-400">
                    {item.score}%
                  </span>
                  <span className="badge badge-indigo text-[10px] uppercase">
                    Confidence: {item.confidence}
                  </span>
                </div>
              </div>

              {/* Question & Learner Response Excerpt */}
              <div className="space-y-2">
                <div className="text-xs text-slate-400 font-medium">Scenario Prompt:</div>
                <div className="text-xs text-slate-200 bg-slate-900/80 p-3 rounded-lg border border-white/5 font-sans">
                  {item.question}
                </div>

                {item.evidenceExcerpt && (
                  <div className="space-y-1 pt-1">
                    <div className="text-xs text-slate-400 font-medium">Extracted Evidence Citation:</div>
                    <div className="evidence-quote">{item.evidenceExcerpt}</div>
                  </div>
                )}
              </div>

              {/* Strengths & Gaps lists */}
              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                {item.strengths && item.strengths.length > 0 && (
                  <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-1">
                    <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Demonstrable Strengths
                    </div>
                    <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                      {item.strengths.map((str, sIdx) => (
                        <li key={sIdx}>{str}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {item.gaps && item.gaps.length > 0 && (
                  <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 space-y-1">
                    <div className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" /> Identified Competency Gaps
                    </div>
                    <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                      {item.gaps.map((gap, gIdx) => (
                        <li key={gIdx}>{gap}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
        <button
          onClick={() => navigateTo('dashboard')}
          className="btn btn-secondary text-xs py-2.5 px-4"
        >
          Return to Dashboard
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateTo('coding')}
            className="btn btn-secondary text-xs py-2.5 px-4 flex items-center gap-2"
          >
            <Code2 className="w-4 h-4 text-emerald-400" /> Sandboxed Coding Round
          </button>
          <button
            onClick={() => navigateTo('voice-setup')}
            className="btn btn-primary text-xs py-2.5 px-4 flex items-center gap-2"
          >
            <Mic className="w-4 h-4" /> Launch Voice Simulation
          </button>
        </div>
      </div>
    </div>
  );
};
