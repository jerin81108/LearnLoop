import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Target,
  Plus,
  Sparkles,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  Pause,
  Play,
  RotateCcw,
  Tag,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { DomainType, Goal } from '../types';
import { clarifyGoalApi } from '../services/api';

export const GoalSetupView: React.FC = () => {
  const {
    goals,
    activeGoal,
    setActiveGoal,
    createGoal,
    pauseGoal,
    user,
    addToast,
    navigateTo,
  } = useApp();

  const [isCreating, setIsCreating] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [domain, setDomain] = useState<DomainType>('technical_interview');
  const [targetOutcome, setTargetOutcome] = useState('');
  const [deadline, setDeadline] = useState('');
  const [isClarifying, setIsClarifying] = useState(false);

  // Suggested clarification modal / card state
  const [clarifiedResult, setClarifiedResult] = useState<{
    refinedTitle: string;
    description: string;
    targetOutcome: string;
    estimatedWeeks: number;
    skills: { name: string; subSkills: string[]; importance: string }[];
  } | null>(null);

  const handleStartClarification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim()) {
      addToast('warning', 'Please provide a goal title to get started.');
      return;
    }

    setIsClarifying(true);
    try {
      const result = await clarifyGoalApi(
        goalTitle,
        domain,
        user?.experienceLevel || 'student'
      );
      setClarifiedResult(result);
    } catch (err) {
      addToast('error', 'Failed to clarify goal with AI.');
    } finally {
      setIsClarifying(false);
    }
  };

  const handleConfirmAndSaveGoal = async () => {
    if (!clarifiedResult) return;

    const mappedSkills = clarifiedResult.skills.map((s, idx) => ({
      id: `s-${Date.now()}-${idx}`,
      name: s.name,
      subSkills: s.subSkills,
      currentScore: 0,
      targetScore: 85,
      confidence: 'unassessed' as const,
      evidenceCount: 0,
    }));

    await createGoal({
      title: clarifiedResult.refinedTitle,
      description: clarifiedResult.description,
      domain,
      targetOutcome: clarifiedResult.targetOutcome,
      deadline: deadline || undefined,
      skills: mappedSkills,
    });

    setIsCreating(false);
    setClarifiedResult(null);
    setGoalTitle('');
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <Target className="w-7 h-7 text-indigo-400" />
            Learning Goals & Skill Taxonomy
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Define target outcomes. LearnLoop maps your goal to demonstrable skills and builds an adaptive curriculum.
          </p>
        </div>

        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="btn btn-primary text-xs py-2.5 px-4 shrink-0 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create New Goal
          </button>
        )}
      </div>

      {/* CREATE GOAL DRAWER / FORM */}
      {isCreating && (
        <div className="glass-panel p-6 sm:p-8 border-indigo-500/40 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white">Create Goal with AI Clarification</h2>
            </div>
            <button
              onClick={() => {
                setIsCreating(false);
                setClarifiedResult(null);
              }}
              className="text-xs text-slate-400 hover:text-white bg-transparent border-none cursor-pointer"
            >
              Cancel
            </button>
          </div>

          {!clarifiedResult ? (
            <form onSubmit={handleStartClarification} className="space-y-4 max-w-2xl">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  What is your broad target goal?
                </label>
                <input
                  type="text"
                  required
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  placeholder="e.g. Pass FAANG System Design Interview or Master Sales Cold Calling"
                  className="form-input text-base"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Type any broad goal. Our AI curriculum architect will clarify it into measurable, evidence-backed sub-skills.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Goal Domain
                  </label>
                  <select
                    value={domain}
                    onChange={(e) => setDomain(e.target.value as DomainType)}
                    className="form-select"
                  >
                    <option value="technical_interview">Technical & System Interview</option>
                    <option value="coding">Coding & Algorithm Mastery</option>
                    <option value="communication">Technical / Executive Communication</option>
                    <option value="language_practice">Language Fluency & Clarity</option>
                    <option value="sales_scenario">Sales & Client Pitch Scenarios</option>
                    <option value="product_scenario">Product Management & Discovery</option>
                    <option value="custom">Custom Goal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Target Deadline (Optional)
                  </label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isClarifying}
                  className="btn btn-primary w-full py-3 text-sm flex items-center justify-center gap-2"
                >
                  {isClarifying ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin text-white" />
                      Analyzing & Clarifying Goal...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-white" />
                      Clarify & Map Skills
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* AI Clarified Proposal Card */
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
                  <CheckCircle2 className="w-4 h-4" /> Suggested Refinement
                </div>
                <h3 className="text-xl font-bold text-white">{clarifiedResult.refinedTitle}</h3>
                <p className="text-sm text-slate-300">{clarifiedResult.description}</p>
                <div className="text-xs text-indigo-300 pt-1">
                  <strong>Target Outcome:</strong> {clarifiedResult.targetOutcome}
                </div>
                <div className="text-xs text-slate-400">
                  Estimated duration: <strong>{clarifiedResult.estimatedWeeks} weeks</strong> of adaptive practice
                </div>
              </div>

              {/* Skills Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Identified Skill Dimensions & Sub-skills
                </h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  {clarifiedResult.skills.map((skill, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-900 border border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-white">{skill.name}</span>
                        <span className="badge badge-indigo text-[10px] uppercase font-mono">
                          {skill.importance}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {skill.subSkills.map((sub, sIdx) => (
                          <span
                            key={sIdx}
                            className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300"
                          >
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/10">
                <button
                  onClick={handleConfirmAndSaveGoal}
                  className="btn btn-accent flex-1 sm:flex-initial text-xs py-2.5 px-6 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" /> Confirm & Activate Goal
                </button>
                <button
                  onClick={() => setClarifiedResult(null)}
                  className="btn btn-secondary text-xs py-2.5 px-4"
                >
                  Edit Input
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* GOALS LIST */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">Your Tracked Goals ({goals.length})</h2>

        <div className="grid gap-4">
          {goals.map((goal) => {
            const isActive = activeGoal?.id === goal.id;
            const avgScore = Math.round(
              goal.skills.reduce((acc, s) => acc + s.currentScore, 0) / (goal.skills.length || 1)
            );
            const totalEvidence = goal.skills.reduce((acc, s) => acc + s.evidenceCount, 0);

            return (
              <div
                key={goal.id}
                className={`glass-panel p-5 sm:p-6 transition-all ${
                  isActive ? 'border-indigo-500 shadow-lg shadow-indigo-500/10' : 'hover:border-white/20'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {isActive && (
                        <span className="badge badge-indigo text-[10px] uppercase font-mono">
                          Active Focus
                        </span>
                      )}
                      <span className="badge badge-slate text-[10px] font-mono">
                        {goal.domain?.replace('_', ' ') || 'general'}
                      </span>
                      <span
                        className={`badge ${
                          goal.status === 'active' ? 'badge-emerald' : 'badge-amber'
                        } text-[10px]`}
                      >
                        {goal.status}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white">{goal.title}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                      {goal.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                      <span>
                        Skills Mapped: <strong>{goal.skills.length}</strong>
                      </span>
                      <span>
                        Demonstrated Score: <strong className="text-emerald-400">{avgScore}%</strong>
                      </span>
                      <span>
                        Evidence Points: <strong>{totalEvidence} citations</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!isActive ? (
                      <button
                        onClick={() => {
                          setActiveGoal(goal);
                          addToast('success', `Switched active focus to "${goal.title}"`);
                        }}
                        className="btn btn-primary text-xs py-2 px-3.5"
                      >
                        Set as Active Focus
                      </button>
                    ) : (
                      <button
                        onClick={() => navigateTo('dashboard')}
                        className="btn btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5"
                      >
                        View Dashboard <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => pauseGoal(goal.id)}
                      title={goal.status === 'active' ? 'Pause Goal' : 'Resume Goal'}
                      className="p-2 rounded-lg bg-slate-900 border border-white/10 text-slate-400 hover:text-white cursor-pointer"
                    >
                      {goal.status === 'active' ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Skills tags preview */}
                <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap gap-2">
                  {goal.skills.map((s) => (
                    <span
                      key={s.id}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900/90 border border-white/10 text-slate-300 flex items-center gap-1.5"
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          s.confidence === 'unassessed'
                            ? 'bg-slate-600'
                            : s.currentScore >= 75
                            ? 'bg-emerald-400'
                            : 'bg-amber-400'
                        }`}
                      />
                      <span>{s.name}</span>
                      <span className="font-mono text-slate-400 text-[10px]">
                        {s.confidence === 'unassessed' ? 'unassessed' : `${s.currentScore}%`}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
