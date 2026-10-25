import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Square,
  Sparkles,
  Send,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  ArrowRight,
  User,
  Bot,
} from 'lucide-react';
import { VoiceScenario, PracticeTurn, SimulationResult } from '../types';
import { getSimulationTurnApi, evaluateFullSimulationApi } from '../services/api';
import { speechRecognizer, speechSynthesizer } from '../utils/speech';

export const LiveVoiceSimulationView: React.FC<{
  scenario: VoiceScenario;
  onFinishSession: (result: SimulationResult, turns: PracticeTurn[]) => void;
}> = ({ scenario, onFinishSession }) => {
  const { addToast } = useApp();

  const [turns, setTurns] = useState<PracticeTurn[]>([
    {
      id: `turn-ai-0`,
      turnNumber: 1,
      speaker: 'ai',
      content: scenario.starterPrompt,
      timestamp: new Date().toISOString(),
    },
  ]);

  const [currentInputText, setCurrentInputText] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isSpeakingAi, setIsSpeakingAi] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isConcluding, setIsConcluding] = useState(false);

  const turnsEndRef = useRef<HTMLDivElement>(null);

  // Auto-speak initial starter question
  useEffect(() => {
    speechSynthesizer.speak(scenario.starterPrompt, () => {
      setIsSpeakingAi(false);
    });
    setIsSpeakingAi(true);

    return () => {
      speechRecognizer.stop();
      speechSynthesizer.stop();
    };
  }, [scenario]);

  // Scroll to bottom on new turn
  useEffect(() => {
    turnsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [turns, interimTranscript, isAiThinking]);

  // Toggle voice dictation
  const handleToggleRecord = () => {
    if (isRecording) {
      speechRecognizer.stop();
      setIsRecording(false);
    } else {
      setSpeechError(null);
      const started = speechRecognizer.start({
        onTranscript: (interim, finalized) => {
          setInterimTranscript(interim);
          if (finalized) {
            setCurrentInputText((prev) => (prev ? prev + ' ' : '') + finalized);
            setInterimTranscript('');
          }
        },
        onError: (errType, msg) => {
          setSpeechError(msg);
          setIsRecording(false);
        },
        onStart: () => setIsRecording(true),
        onEnd: () => setIsRecording(false),
      });

      if (!started) {
        setIsRecording(false);
      }
    }
  };

  // Submit learner's turn
  const handleSubmitTurn = async () => {
    const textToSend = (currentInputText + ' ' + interimTranscript).trim();
    if (!textToSend) {
      addToast('warning', 'Please speak or enter a response before submitting.');
      return;
    }

    if (isRecording) {
      speechRecognizer.stop();
      setIsRecording(false);
    }

    const learnerTurn: PracticeTurn = {
      id: `turn-learner-${Date.now()}`,
      turnNumber: turns.length + 1,
      speaker: 'learner',
      content: textToSend,
      timestamp: new Date().toISOString(),
      inputMethod: isRecording ? 'voice' : 'text_fallback',
    };

    const nextTurns = [...turns, learnerTurn];
    setTurns(nextTurns);
    setCurrentInputText('');
    setInterimTranscript('');
    setIsAiThinking(true);

    try {
      const response = await getSimulationTurnApi(scenario, nextTurns, textToSend);

      // Attach turn evaluation trace
      learnerTurn.evaluation = response.evaluation;

      const aiTurn: PracticeTurn = {
        id: `turn-ai-${Date.now()}`,
        turnNumber: nextTurns.length + 1,
        speaker: 'ai',
        content: response.reply,
        timestamp: new Date().toISOString(),
      };

      setTurns([...nextTurns, aiTurn]);

      // Read out AI reply using SpeechSynthesis
      setIsSpeakingAi(true);
      speechSynthesizer.speak(response.reply, () => {
        setIsSpeakingAi(false);
      });
    } catch (err) {
      addToast('error', 'Failed to generate AI follow-up.');
    } finally {
      setIsAiThinking(false);
    }
  };

  // Conclude simulation session
  const handleEndSimulation = async () => {
    if (isRecording) {
      speechRecognizer.stop();
      setIsRecording(false);
    }
    speechSynthesizer.stop();

    setIsConcluding(true);
    addToast('info', 'Analyzing simulation evidence and compiling rubric report...');

    try {
      const result = await evaluateFullSimulationApi(scenario, turns);
      onFinishSession(result, turns);
    } catch (err) {
      addToast('error', 'Error generating session summary.');
      setIsConcluding(false);
    }
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-12">
      {/* Session Top Bar: Scenario Context & Controls */}
      <div className="glass-panel p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-indigo-500/30">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="badge badge-indigo text-[10px] uppercase font-mono">
              Live Simulation
            </span>
            <span className="text-xs text-slate-400">Role: {scenario.role}</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-white">{scenario.title}</h2>
        </div>

        {/* Action Controls: Pause, SpeechSynthesis stop, End Session */}
        <div className="flex items-center gap-2">
          {isSpeakingAi && (
            <button
              onClick={() => {
                speechSynthesizer.stop();
                setIsSpeakingAi(false);
              }}
              className="btn btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 text-amber-400"
              title="Mute AI voice output"
            >
              <VolumeX className="w-4 h-4" /> Stop Voice Readout
            </button>
          )}

          <button
            onClick={handleEndSimulation}
            disabled={isConcluding}
            className="btn btn-danger text-xs py-1.5 px-3.5 flex items-center gap-1.5"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            {isConcluding ? 'Finalizing Evaluation...' : 'End & Evaluate'}
          </button>
        </div>
      </div>

      {/* Constraints reminder strip */}
      <div className="px-4 py-2 rounded-lg bg-slate-900/80 border border-white/5 text-[11px] text-slate-400 flex items-center justify-between">
        <span>
          <strong>Objective:</strong> {scenario.objective}
        </span>
        <span className="hidden sm:inline font-mono text-slate-500">
          Turn {turns.length} / 8 target
        </span>
      </div>

      {/* Turn-by-turn Conversation Log */}
      <div className="glass-panel p-4 sm:p-6 min-h-[380px] max-h-[520px] overflow-y-auto space-y-4">
        {turns.map((turn) => {
          const isAi = turn.speaker === 'ai';
          return (
            <div
              key={turn.id}
              className={`flex gap-3 max-w-3xl ${isAi ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
            >
              {/* Speaker Avatar */}
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  isAi
                    ? 'bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-md shadow-indigo-500/20'
                    : 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                }`}
              >
                {isAi ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`p-4 rounded-2xl text-sm leading-relaxed space-y-2 ${
                  isAi
                    ? 'bg-slate-900/95 border border-white/10 text-slate-100 rounded-tl-sm'
                    : 'bg-indigo-950/60 border border-indigo-500/40 text-slate-100 rounded-tr-sm'
                }`}
              >
                <div className="flex items-center justify-between gap-4 text-[11px] text-slate-400">
                  <span className="font-semibold text-xs">
                    {isAi ? scenario.role : 'You (Spoken / Written Response)'}
                  </span>
                  <span className="font-mono text-[10px]">
                    {new Date(turn.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <p className="whitespace-pre-wrap">{turn.content}</p>

                {/* Live Turn Evaluation Trace (For Learner Spoken Response) */}
                {!isAi && turn.evaluation && (
                  <div className="pt-2 mt-2 border-t border-white/10 text-xs text-indigo-300 space-y-1">
                    <div className="flex items-center justify-between font-mono text-[10px]">
                      <span>{turn.evaluation.rubricCategory}</span>
                      <span className="text-emerald-400 font-bold">
                        Score: {turn.evaluation.score}%
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 italic">
                      "{turn.evaluation.evidenceSnippet}" — {turn.evaluation.rationale}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Live Interim Transcript Bubble while recording */}
        {isRecording && interimTranscript && (
          <div className="flex gap-3 max-w-3xl ml-auto flex-row-reverse animate-pulse">
            <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0">
              <Mic className="w-5 h-5" />
            </div>
            <div className="p-4 rounded-2xl text-sm bg-rose-950/40 border border-rose-500/30 text-rose-200">
              <span className="text-[10px] uppercase font-mono block text-rose-400 mb-1">
                Transcribing Voice Input...
              </span>
              <p className="italic">"{interimTranscript}"</p>
            </div>
          </div>
        )}

        {/* AI Thinking Animation */}
        {isAiThinking && (
          <div className="flex gap-3 max-w-md mr-auto">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-white/10 flex items-center gap-2 text-xs text-slate-400">
              <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
              <span>Analyzing your response & generating realistic follow-up...</span>
            </div>
          </div>
        )}

        <div ref={turnsEndRef} />
      </div>

      {/* Spoken Response & Text Fallback Input Bar */}
      <div className="glass-panel p-4 space-y-3 border-indigo-500/40">
        {speechError && (
          <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{speechError} (You can type your answer below instead)</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Microphone Record Button */}
          <button
            type="button"
            onClick={handleToggleRecord}
            className={`btn p-3 rounded-xl shrink-0 transition-all ${
              isRecording
                ? 'bg-rose-500 text-white pulse-recording'
                : 'btn-secondary text-indigo-400 hover:text-white'
            }`}
            title={isRecording ? 'Click to stop recording' : 'Click to speak via microphone'}
          >
            {isRecording ? <Mic className="w-5 h-5 animate-pulse" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Text Input with review / edit capability */}
          <input
            type="text"
            value={currentInputText}
            onChange={(e) => setCurrentInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmitTurn();
              }
            }}
            placeholder={
              isRecording
                ? 'Listening to your speech... words will appear here for review.'
                : 'Type or speak your answer here...'
            }
            className="form-input text-sm flex-1"
          />

          {/* Submit Button */}
          <button
            onClick={handleSubmitTurn}
            disabled={isAiThinking || (!currentInputText.trim() && !interimTranscript.trim())}
            className="btn btn-primary p-3 rounded-xl shrink-0"
            title="Submit response turn"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        {/* Input Assistance Bar */}
        <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 px-1">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            You may edit recognized transcript before submitting.
          </span>
          <span className="font-mono text-slate-500">Press Enter or click Send to submit</span>
        </div>
      </div>
    </div>
  );
};
