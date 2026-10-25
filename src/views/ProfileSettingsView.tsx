import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Settings,
  Shield,
  ShieldCheck,
  Mic,
  Volume2,
  Database,
  Cpu,
  Lock,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  Key,
} from 'lucide-react';
import { speechRecognizer, speechSynthesizer } from '../utils/speech';

export const ProfileSettingsView: React.FC = () => {
  const {
    user,
    setUser,
    privacySettings,
    updatePrivacySettings,
    systemCapabilities,
    addToast,
    navigateTo,
  } = useApp();

  const [micStatus, setMicStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [micMessage, setMicMessage] = useState<string>('');

  const handleTestMicrophone = () => {
    setMicStatus('testing');
    setMicMessage('Listening... please say a short phrase.');

    const started = speechRecognizer.start({
      onTranscript: (interim, finalized) => {
        if (interim || finalized) {
          setMicStatus('success');
          setMicMessage(`Recognized: "${finalized || interim}"`);
          speechRecognizer.stop();
        }
      },
      onError: (err, msg) => {
        setMicStatus('error');
        setMicMessage(msg);
      },
      onEnd: () => {
        if (micStatus === 'testing') {
          setMicStatus('idle');
        }
      },
    });

    if (!started) {
      setMicStatus('error');
      setMicMessage('Web Speech API is not supported in this browser.');
    }
  };

  const handleTestAudioPlayback = () => {
    speechSynthesizer.speak(
      'Text-to-speech audio synthesis is operational. LearnLoop uses native browser speech synthesis to read interview responses.'
    );
    addToast('info', 'Playing test speech synthesis...');
  };

  const handleExportData = () => {
    try {
      const data = {
        exportedAt: new Date().toISOString(),
        user,
        privacySettings,
        goals: JSON.parse(localStorage.getItem('learnloop_goals') || '[]'),
        diagnostics: JSON.parse(localStorage.getItem('learnloop_diagnostics') || '[]'),
        practiceSessions: JSON.parse(localStorage.getItem('learnloop_practice_sessions') || '[]'),
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `learnloop-evidence-export-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      addToast('success', 'Learner evidence data exported.');
    } catch (e) {
      addToast('error', 'Failed to export data.');
    }
  };

  const handleResetData = () => {
    if (window.confirm('Reset all demo practice history and restore initial sample state?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div>
        <span className="badge badge-indigo text-xs">
          <Settings className="w-3.5 h-3.5" /> Learner Profile & Security
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
          Profile, Privacy & System Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Configure learner privacy, manage transcript retention, run audio hardware diagnostics, and review Supabase backend connection.
        </p>
      </div>

      {/* 1. LEARNER PROFILE CARD */}
      <div className="glass-panel p-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          Learner Profile
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={
                user?.avatarUrl ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
              }
              alt={user?.fullName || 'User'}
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-500/30"
            />
            <div>
              <div className="text-lg font-bold text-white">{user?.fullName}</div>
              <div className="text-xs text-slate-400">{user?.email}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="badge badge-indigo text-[10px] font-mono">
                  {user?.experienceLevel.replace('_', ' ').toUpperCase()}
                </span>
                {user?.isDemoUser && (
                  <span className="badge badge-slate text-[10px]">Demo Persona</span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => navigateTo('welcome')}
            className="btn btn-secondary text-xs py-2 px-3.5"
          >
            Switch Persona / Sign Out
          </button>
        </div>
      </div>

      {/* 2. PRIVACY & DATA RETENTION CONTROLS */}
      <div className="glass-panel p-6 space-y-6 border-indigo-500/30">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
            <ShieldCheck className="w-4 h-4" /> Learner Privacy & Access Boundary
          </div>
          <p className="text-xs text-slate-400">
            Per LearnLoop core principles, your practice simulations and transcripts remain strictly private to you.
          </p>
        </div>

        <div className="space-y-4">
          {/* Toggle: Share Pod Progress */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-white/5">
            <div className="space-y-0.5 max-w-lg">
              <div className="text-sm font-semibold text-slate-200">
                Share High-Level Progress in Study Pods
              </div>
              <p className="text-xs text-slate-400">
                Shares your aggregated skill competency scores with matched peers. Private transcripts and audio recordings are never shared.
              </p>
            </div>
            <input
              type="checkbox"
              checked={privacySettings.sharePodProgress}
              onChange={(e) => updatePrivacySettings({ sharePodProgress: e.target.checked })}
              className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
            />
          </div>

          {/* Toggle: Allow Peer Matching */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-white/5">
            <div className="space-y-0.5 max-w-lg">
              <div className="text-sm font-semibold text-slate-200">
                Enable Complementary Peer Matching
              </div>
              <p className="text-xs text-slate-400">
                Allows LearnLoop to suggest study pods where your strengths match other learners' gaps.
              </p>
            </div>
            <input
              type="checkbox"
              checked={privacySettings.allowPeerMatching}
              onChange={(e) => updatePrivacySettings({ allowPeerMatching: e.target.checked })}
              className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
            />
          </div>

          {/* Toggle: Store Transcripts */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-white/5">
            <div className="space-y-0.5 max-w-lg">
              <div className="text-sm font-semibold text-slate-200">
                Store Practice Transcripts for Evidence Citations
              </div>
              <p className="text-xs text-slate-400">
                Retains recognized text transcripts so that future rubric evaluations can cite specific quote examples.
              </p>
            </div>
            <input
              type="checkbox"
              checked={privacySettings.storeTranscripts}
              onChange={(e) => updatePrivacySettings({ storeTranscripts: e.target.checked })}
              className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
            />
          </div>

          {/* Audio Blobs Disclaimer */}
          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-300 flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">Raw Audio Privacy Guarantee:</strong> Microphone audio is processed directly through the browser Web Speech API. Raw audio files are never stored or transmitted.
            </div>
          </div>
        </div>
      </div>

      {/* 3. HARDWARE & SPEECH DIAGNOSTICS */}
      <div className="glass-panel p-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Mic className="w-4 h-4 text-indigo-400" />
          Speech & Audio Hardware Diagnostic Tools
        </h2>
        <p className="text-xs text-slate-400">
          Verify that your browser and microphone settings are ready for turn-by-turn conversational practice.
        </p>

        <div className="grid sm:grid-cols-2 gap-4 pt-2">
          {/* Mic Tool */}
          <div className="p-4 rounded-xl bg-slate-900 border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-300">Microphone Input Check</span>
              {micStatus === 'success' && (
                <span className="badge badge-emerald text-[10px]">Verified</span>
              )}
            </div>

            <p className="text-xs text-slate-400">
              Click below and speak into your microphone to verify speech-to-text recognition.
            </p>

            {micMessage && (
              <div
                className={`p-2.5 rounded text-xs ${
                  micStatus === 'success'
                    ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300'
                    : micStatus === 'error'
                    ? 'bg-rose-950/40 border border-rose-500/30 text-rose-300'
                    : 'bg-indigo-950/40 border border-indigo-500/30 text-indigo-300'
                }`}
              >
                {micMessage}
              </div>
            )}

            <button
              onClick={handleTestMicrophone}
              className={`btn text-xs py-2 px-3 w-full ${
                micStatus === 'testing' ? 'bg-rose-600 text-white pulse-recording' : 'btn-secondary'
              }`}
            >
              {micStatus === 'testing' ? 'Listening... Speak Now' : 'Run Microphone Diagnostic'}
            </button>
          </div>

          {/* TTS Playback Tool */}
          <div className="p-4 rounded-xl bg-slate-900 border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-300">Speech Synthesis Check</span>
              <span className="badge badge-indigo text-[10px]">Native TTS</span>
            </div>

            <p className="text-xs text-slate-400">
              Test browser audio playback for the AI interviewer voice prompts.
            </p>

            <button
              onClick={handleTestAudioPlayback}
              className="btn btn-secondary text-xs py-2 px-3 w-full flex items-center justify-center gap-1.5"
            >
              <Volume2 className="w-4 h-4 text-emerald-400" /> Play Test Voice Audio
            </button>
          </div>
        </div>
      </div>

      {/* 4. BACKEND PERSISTENCE & ENVIRONMENT SETUP GUIDE */}
      <div className="glass-panel p-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-indigo-400" />
          Backend Persistence & AI Inference Status
        </h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-indigo-400" /> Groq AI Engine
              </span>
              <span
                className={`badge ${
                  systemCapabilities.groqConfigured ? 'badge-emerald' : 'badge-indigo'
                } text-[10px]`}
              >
                {systemCapabilities.groqConfigured ? 'Live Groq API' : 'Deterministic Engine'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {systemCapabilities.groqConfigured
                ? 'Server is connected to Groq Llama 3.3 70B for real-time natural language generation.'
                : 'Using built-in deterministic curriculum & evaluation engine. Add GROQ_API_KEY to .env for live LLM inference.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-emerald-400" /> Supabase PostgreSQL
              </span>
              <span
                className={`badge ${
                  systemCapabilities.supabaseConfigured ? 'badge-emerald' : 'badge-slate'
                } text-[10px]`}
              >
                {systemCapabilities.supabaseConfigured ? 'Supabase Connected' : 'Local Persistence'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {systemCapabilities.supabaseConfigured
                ? 'Connected to remote Supabase instance with Row-Level Security.'
                : 'Operating in Local Persistence / Demo Mode. All schema migrations located in supabase/schema.sql.'}
            </p>
          </div>
        </div>

        {/* Local Setup Quick Guide */}
        <div className="p-4 rounded-xl bg-slate-950 border border-white/5 text-xs text-slate-300 space-y-2 font-mono">
          <div className="text-indigo-400 font-bold uppercase tracking-wider text-[11px]">
            To Connect Production Supabase & Groq:
          </div>
          <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px]">
            <li>Copy <code className="text-slate-200">.env.example</code> to <code className="text-slate-200">.env</code></li>
            <li>Run SQL migration from <code className="text-slate-200">supabase/schema.sql</code> in your Supabase SQL Editor</li>
            <li>Set <code className="text-slate-200">GROQ_API_KEY</code> and <code className="text-slate-200">VITE_SUPABASE_URL</code> in <code className="text-slate-200">.env</code></li>
            <li>Restart server: <code className="text-slate-200">npm run dev</code></li>
          </ol>
        </div>
      </div>

      {/* 5. DATA EXPORT & RESET */}
      <div className="glass-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white">Data Portability & State Management</h3>
          <p className="text-xs text-slate-400">
            Export all verified practice records as JSON or reset your local environment.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportData}
            className="btn btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" /> Export JSON Evidence
          </button>
          <button
            onClick={handleResetData}
            className="btn btn-danger text-xs py-2 px-3.5 flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" /> Reset Local State
          </button>
        </div>
      </div>
    </div>
  );
};
