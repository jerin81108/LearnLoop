import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Mic,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  Volume2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { VoiceScenario } from '../types';
import { speechRecognizer, speechSynthesizer } from '../utils/speech';

export const predefinedScenarios: VoiceScenario[] = [
  {
    id: 'sc-system-design',
    title: 'High-Concurrency Caching & Partition Failover',
    role: 'Principal Staff Engineer & Hiring Panel Lead',
    domain: 'technical_interview',
    objective:
      'Evaluate your ability to articulate distributed architecture trade-offs, cache invalidation, and split-brain handling under pressure.',
    constraints:
      'Answer clearly in 2-3 minute spoken turns. Proactively declare assumptions, constraints, and metrics before offering architecture diagrams.',
    suggestedDurationMin: 10,
    starterPrompt:
      'Welcome to the system architecture round. Imagine we are designing an in-memory session caching tier for an e-commerce platform during Black Friday. A downstream Redis cluster partition occurs. How do you detect and recover without serving stale customer order states?',
  },
  {
    id: 'sc-behavioral-star',
    title: 'Behavioral STAR: High-Stakes Technical Disagreement',
    role: 'VP of Engineering / Hiring Director',
    domain: 'communication',
    objective:
      'Assess candidate maturity, conflict resolution, structured STAR articulation, and quantified business impact.',
    constraints:
      'Do not place blame. Focus on specific technical actions, validation prototypes, and how you aligned stakeholders.',
    suggestedDurationMin: 8,
    starterPrompt:
      'Tell me about a specific time when you fundamentally disagreed with a senior peer or lead on a critical software architectural decision. How did you handle that disagreement, and what was the verifiable outcome?',
  },
  {
    id: 'sc-sales-pitch',
    title: 'Enterprise Discovery & Value Proposition Pitch',
    role: 'Enterprise Chief Information Officer (Prospect)',
    domain: 'sales_scenario',
    objective:
      'Demonstrate active listening, objection handling, ROI framing, and disciplined qualification without aggressive pitch tactics.',
    constraints:
      'Ask clarifying discovery questions before prescribing a solution. Acknowledge customer budget constraints.',
    suggestedDurationMin: 10,
    starterPrompt:
      'Thanks for reaching out. We have been burned recently by software vendors promising AI automation that took 9 months to deliver zero ROI. Why shouldn’t my board just keep building custom tools in-house with our existing team?',
  },
  {
    id: 'sc-language-fluency',
    title: 'Pragmatic Fluency & Cross-Cultural Stakeholder Sync',
    role: 'Senior Project Manager & International Team Lead',
    domain: 'language_practice',
    objective:
      'Demonstrate natural conversational pacing, clear diction, spontaneous elaboration, and diplomatic nuance.',
    constraints:
      'Use natural transitional idioms and concise phrasing. Address questions directly before elaborating.',
    suggestedDurationMin: 6,
    starterPrompt:
      'Good morning! We are reviewing the delayed timeline for the international payment gateway rollout. Could you summarize what is causing the bottleneck and what assistance you need from our European team this week?',
  },
];

export const VoiceSimulationSetupView: React.FC<{
  onSelectScenario: (scenario: VoiceScenario) => void;
}> = ({ onSelectScenario }) => {
  const { activeGoal, navigateTo, addToast } = useApp();
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(predefinedScenarios[0].id);
  const [isMicTesting, setIsMicTesting] = useState(false);
  const [micTestPassed, setMicTestPassed] = useState(false);
  const [micTestError, setMicTestError] = useState<string | null>(null);

  const selectedScenario =
    predefinedScenarios.find((s) => s.id === selectedScenarioId) || predefinedScenarios[0];

  const handleTestMic = () => {
    setIsMicTesting(true);
    setMicTestError(null);

    const started = speechRecognizer.start({
      onTranscript: (interim, finalized) => {
        if (interim || finalized) {
          setMicTestPassed(true);
          speechRecognizer.stop();
          setIsMicTesting(false);
          addToast('success', 'Microphone detected clear audio speech input!');
        }
      },
      onError: (err, msg) => {
        setMicTestError(msg);
        setIsMicTesting(false);
      },
      onEnd: () => {
        setIsMicTesting(false);
      },
    });

    if (!started) {
      setIsMicTesting(false);
    }
  };

  const handleTestTTS = () => {
    speechSynthesizer.speak(
      'Welcome to LearnLoop voice simulation. Speech synthesis is operational and ready for your session.'
    );
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div>
        <span className="badge badge-indigo text-xs">
          <Mic className="w-3.5 h-3.5" /> Conversational Simulation Setup
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
          Select Practice Simulation Scenario
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Engage in a live spoken simulation. LearnLoop analyzes your transcript, speech structure, and trade-offs to extract concrete evidence.
        </p>
      </div>

      {/* Scenario Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {predefinedScenarios.map((scenario) => {
          const isSelected = scenario.id === selectedScenarioId;
          return (
            <div
              key={scenario.id}
              onClick={() => setSelectedScenarioId(scenario.id)}
              className={`glass-card p-5 space-y-3 cursor-pointer transition-all ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-950/30 shadow-xl shadow-indigo-500/10 ring-1 ring-indigo-500/50'
                  : 'hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="badge badge-indigo text-[10px] font-mono">
                  {scenario.domain?.replace('_', ' ').toUpperCase() || 'GENERAL'}
                </span>
                <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3 text-slate-500" /> ~{scenario.suggestedDurationMin} mins
                </span>
              </div>

              <h3 className="font-bold text-white text-base leading-snug">{scenario.title}</h3>
              <p className="text-xs text-slate-300 line-clamp-2">{scenario.objective}</p>

              <div className="text-[11px] text-indigo-300 font-medium pt-1">
                Role: <strong>{scenario.role}</strong>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Scenario Details & Hardware Diagnostics */}
      <div className="glass-panel p-6 space-y-6 border-indigo-500/30">
        <div className="border-b border-white/10 pb-4 space-y-2">
          <div className="text-xs font-mono uppercase text-indigo-400 font-semibold">
            Active Scenario Configuration
          </div>
          <h2 className="text-xl font-bold text-white">{selectedScenario.title}</h2>
          <p className="text-sm text-slate-300 leading-relaxed">{selectedScenario.objective}</p>
          <div className="p-3 rounded-lg bg-slate-900 border border-white/5 text-xs text-slate-400">
            <strong className="text-slate-300">Constraints & Protocol:</strong>{' '}
            {selectedScenario.constraints}
          </div>
        </div>

        {/* Hardware Checks */}
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Mic Check */}
          <div className="p-4 rounded-xl bg-slate-900 border border-white/5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Mic className="w-4 h-4 text-indigo-400" /> Speech Recognition Mic Check
              </span>
              {micTestPassed && (
                <span className="badge badge-emerald text-[10px]">Verified Working</span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              Verify your microphone before starting. Spoken words will be converted to text in real-time.
            </p>
            {micTestError && (
              <div className="text-xs text-rose-300 bg-rose-950/40 p-2 rounded border border-rose-500/30">
                {micTestError}
              </div>
            )}
            <button
              onClick={handleTestMic}
              className={`btn text-xs py-1.5 px-3 w-full ${
                isMicTesting ? 'bg-rose-600 text-white pulse-recording' : 'btn-secondary'
              }`}
            >
              {isMicTesting ? 'Say something now...' : 'Test Microphone'}
            </button>
          </div>

          {/* Audio TTS Check */}
          <div className="p-4 rounded-xl bg-slate-900 border border-white/5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-emerald-400" /> AI Voice Readout Check
              </span>
              <span className="badge badge-slate text-[10px]">SpeechSynthesis</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Test speaker playback to ensure you hear the AI interviewer's follow-up questions.
            </p>
            <button
              onClick={handleTestTTS}
              className="btn btn-secondary text-xs py-1.5 px-3 w-full"
            >
              Play Sample Voice
            </button>
          </div>
        </div>

        {/* Privacy Note: No audio blobs stored */}
        <div className="flex items-center gap-2 text-xs text-slate-400 pt-2 border-t border-white/5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Privacy Guarantee: We evaluate live transcripts only. Raw microphone audio is never uploaded or stored.
          </span>
        </div>

        {/* Launch Button */}
        <div className="pt-2">
          <button
            onClick={() => onSelectScenario(selectedScenario)}
            className="btn btn-primary w-full py-3.5 text-sm font-bold flex items-center justify-center gap-2"
          >
            Launch Live Voice Simulation <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
