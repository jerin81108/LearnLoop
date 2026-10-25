import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Lock,
  Layers,
  Award,
  UserPlus,
  UserCheck,
  HelpCircle,
  FileCheck,
} from 'lucide-react';
import { StudyPod } from '../types';

export const StudyPodsView: React.FC = () => {
  const { studyPods, toggleJoinPod, privacySettings, navigateTo } = useApp();
  const [selectedPodId, setSelectedPodId] = useState<string>(studyPods[0]?.id || '');

  const selectedPod = studyPods.find((p) => p.id === selectedPodId) || studyPods[0];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <span className="badge badge-indigo text-xs">
            <Users className="w-3.5 h-3.5" /> Peer Study Pods
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Complementary Study Pod Matching
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            LearnLoop matches you with 3-5 peers whose strengths balance your evidence gaps. Practice peer-teaching and collaborative defense.
          </p>
        </div>

        {/* Privacy Indicator */}
        <div className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-slate-400 flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            {privacySettings.sharePodProgress
              ? 'Pod Progress Shared (Transcripts Private)'
              : 'Pod Progress Hidden'}
          </span>
        </div>
      </div>

      {/* Pods Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {studyPods.map((pod) => {
          const isSelected = pod.id === selectedPodId;
          return (
            <div
              key={pod.id}
              onClick={() => setSelectedPodId(pod.id)}
              className={`glass-card p-5 space-y-3 cursor-pointer transition-all ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-950/20 ring-1 ring-indigo-500/40'
                  : 'hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="badge badge-indigo text-[10px] font-mono">
                  {pod.domain?.replace('_', ' ').toUpperCase() || 'GENERAL'}
                </span>
                <span
                  className={`badge ${
                    pod.isUserMember ? 'badge-emerald' : 'badge-slate'
                  } text-[10px]`}
                >
                  {pod.isUserMember ? 'Joined Pod' : 'Available'}
                </span>
              </div>

              <h3 className="font-bold text-white text-base">{pod.name}</h3>
              <p className="text-xs text-slate-300 line-clamp-2">{pod.description}</p>

              {/* Match Rationale Snippet */}
              <div className="p-2.5 rounded-lg bg-slate-900/90 border border-white/5 text-[11px] text-indigo-300">
                <strong>Why Matched:</strong> {pod.matchRationale}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-slate-400">
                <span>{pod.members.length} active peers</span>
                <span className="text-indigo-400 font-semibold flex items-center gap-1">
                  View Pod Details <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Pod Deep-Dive */}
      {selectedPod && (
        <div className="glass-panel p-6 sm:p-8 space-y-6 border-indigo-500/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="badge badge-indigo text-[10px] font-mono">Active Pod</span>
                <span className="text-xs text-slate-400">ID: {selectedPod.id}</span>
              </div>
              <h2 className="text-2xl font-bold text-white mt-1">{selectedPod.name}</h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">{selectedPod.description}</p>
            </div>

            <button
              onClick={() => toggleJoinPod(selectedPod.id)}
              className={`btn text-xs py-2.5 px-5 flex items-center gap-2 shrink-0 ${
                selectedPod.isUserMember ? 'btn-secondary text-slate-300' : 'btn-accent'
              }`}
            >
              {selectedPod.isUserMember ? (
                <>
                  <UserCheck className="w-4 h-4 text-emerald-400" /> Member of Pod (Leave)
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" /> Join This Study Pod
                </>
              )}
            </button>
          </div>

          {/* Transparent Match Rationale Callout */}
          <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 space-y-1.5">
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Algorithmic Matching Rationale
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              {selectedPod.matchRationale}
            </p>
          </div>

          {/* Members Matrix & Complementary Strengths */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-xs">
              Pod Members & Complementary Matrix
            </h3>

            <div className="grid gap-3 sm:grid-cols-3">
              {selectedPod.members.map((member) => (
                <div key={member.id} className="p-4 rounded-xl bg-slate-900 border border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-white">{member.name}</span>
                    <span className="badge badge-slate text-[10px] uppercase font-mono">
                      {member.role}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="text-emerald-400 font-semibold text-[11px]">Complementary Strengths:</div>
                    <div className="flex flex-wrap gap-1">
                      {member.complementaryStrengths.map((str, sIdx) => (
                        <span key={sIdx} className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/20 text-emerald-300">
                          {str}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1 text-xs pt-1">
                    <div className="text-amber-400 font-semibold text-[11px]">Working On Gaps:</div>
                    <div className="flex flex-wrap gap-1">
                      {member.complementaryGaps.map((gap, gIdx) => (
                        <span key={gIdx} className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950/40 border border-amber-500/20 text-amber-300">
                          {gap}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Structured Group Challenge */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                <Award className="w-4 h-4" /> Active Group Defense Challenge
              </span>
              <span className="badge badge-emerald text-[10px]">Open Collaborative Task</span>
            </div>

            <h4 className="text-base font-bold text-white">{selectedPod.challenge.title}</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedPod.challenge.description}
            </p>

            {/* Peer-Teaching Tasks */}
            <div className="space-y-2 pt-2">
              <div className="text-xs font-semibold text-slate-400">Assigned Peer-Teaching Roles:</div>
              <div className="grid gap-3 sm:grid-cols-2">
                {selectedPod.challenge.peerTeachingTasks.map((task, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-white/5 space-y-1 text-xs">
                    <div className="font-semibold text-indigo-300">{task.role}</div>
                    <div className="text-slate-200">{task.task}</div>
                    <div className="text-[11px] text-slate-500">Deliverable: {task.deliverable}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Success criteria */}
            <div className="space-y-1.5 pt-2 border-t border-white/5">
              <div className="text-xs font-semibold text-slate-400">Success Criteria:</div>
              <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                {selectedPod.challenge.successCriteria.map((sc, scIdx) => (
                  <li key={scIdx}>{sc}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
