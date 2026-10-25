import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Stethoscope,
  Sparkles,
  ArrowRight,
  Mic,
  MicOff,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  TrendingUp,
  RotateCcw,
} from 'lucide-react';
import { DiagnosticItem, DiagnosticSession, SkillItem } from '../types';
import { getDiagnosticQuestionApi, evaluateDiagnosticAnswerApi } from '../services/api';
import { speechRecognizer } from '../utils/speech';

export const DiagnosticView: React.FC = () => {
  const {
    activeGoal,
    navigateTo,
    addToast,
    saveDiagnosticSession,
    setActiveDiagnostic,
  } = useApp();

  const skillsToAssess: SkillItem[] = activeGoal?.skills || [];

  const [currentSkillIndex, setCurrentSkillIndex] = useState(0);
  const [currentQuestionData, setCurrentQuestionData] = useState<{
    question: string;
    scenario: string;
    difficulty: 'easy' | 'medium' | 'hard';
    rubricCriteria: string;
  } | null>(null);

  const [learnerResponse, setLearnerResponse] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [completedItems, setCompletedItems] = useState<DiagnosticItem[]>([]);

  // Speech Recognition state
  const [isRecording, setIsRecording] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const currentSkill = skillsToAssess[currentSkillIndex];

  // Load question for current skill
  useEffect(() => {
    if (!currentSkill) return;

    let isMounted = true;
    setIsLoadingQuestion(true);
    setLearnerResponse('');
    setSpeechError(null);

    getDiagnosticQuestionApi(
      activeGoal?.title || 'System Interview',
      activeGoal?.domain || 'technical_interview',
      currentSkill.name,
      currentSkill.subSkills[0] || 'Core Mechanics',
      completedItems
    ).then((data) => {
      if (isMounted) {
        setCurrentQuestionData(data);
        setIsLoadingQuestion(false);
      }
    });

    return () => {
      isMounted = false;
      speechRecognizer.stop();
    };
  }, [currentSkillIndex, currentSkill]);

  const handleToggleVoice = () => {
    if (isRecording) {
      speechRecognizer.stop();
      setIsRecording(false);
    } else {
      setSpeechError(null);
      const started = speechRecognizer.start({
        onTranscript: (interim, finalized) => {
          setLearnerResponse(finalized || interim);
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

  const handleSubmitAnswer = async () => {
    if (!learnerResponse.trim()) {
      addToast('warning', 'Please provide an answer before submitting.');
      return;
    }

    if (!currentQuestionData || !currentSkill) return;

    setIsEvaluating(true);
    if (isRecording) {
      speechRecognizer.stop();
      setIsRecording(false);
    }

    try {
      const evaluation = await evaluateDiagnosticAnswerApi(
        currentQuestionData.question,
        currentSkill.name,
        learnerResponse,
        currentQuestionData.rubricCriteria
      );

      const newItem: DiagnosticItem = {
        id: `diag-item-${Date.now()}`,
        skillName: currentSkill.name,
        subSkillName: currentSkill.subSkills[0] || 'Core Competency',
        question: currentQuestionData.question,
        difficulty: currentQuestionData.difficulty,
        rubricCriteria: currentQuestionData.rubricCriteria,
        learnerResponse,
        score: evaluation.score,
        confidence: evaluation.confidence,
        evidenceExcerpt: evaluation.evidenceExcerpt,
        strengths: evaluation.strengths,
        gaps: evaluation.gaps,
        feedback: evaluation.feedback,
      };

      const updatedCompleted = [...completedItems, newItem];
      setCompletedItems(updatedCompleted);

      // Check if finished all skills or step to next
      if (currentSkillIndex + 1 < Math.min(skillsToAssess.length, 4)) {
        setCurrentSkillIndex((prev) => prev + 1);
      } else {
        // Complete diagnostic session
        const totalScore = Math.round(
          updatedCompleted.reduce((acc, it) => acc + (it.score || 0), 0) / updatedCompleted.length
        );

        const allStrengths = updatedCompleted.flatMap((it) => it.strengths || []);
        const allGaps = updatedCompleted.flatMap((it) => it.gaps || []);

        const session: DiagnosticSession = {
          id: `diag-session-${Date.now()}`,
          goalId: activeGoal?.id || 'goal-1',
          status: 'completed',
          startedAt: new Date(Date.now() - 300000).toISOString(),
          completedAt: new Date().toISOString(),
          overallScore: totalScore,
          items: updatedCompleted,
          strengths: allStrengths.slice(0, 3),
          gaps: allGaps.slice(0, 3),
          recommendedActions: [
            'Practice turn-by-turn conversational drills for lower confidence skills',
            'Take a sandboxed coding challenge to verify runtime constraints',
          ],
          summary: `Completed diagnostic across ${updatedCompleted.length} skill dimensions with an average demonstrated score of ${totalScore}%.`,
        };

        saveDiagnosticSession(session);
        setActiveDiagnostic(session);
        navigateTo('diagnostic-results');
      }
    } catch (err) {
      addToast('error', 'Evaluation failed. Please retry.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const totalSteps = Math.min(skillsToAssess.length, 4);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header & Step Tracker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge badge-indigo text-xs">
              <Stethoscope className="w-3.5 h-3.5" /> Adaptive Diagnostic
            </span>
            <span className="text-xs text-slate-400">
              Evaluating: {activeGoal?.title}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">
            Question {currentSkillIndex + 1} of {totalSteps}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {Array.from({ length: totalSteps }).map((_, idx) => (
            <div
              key={idx}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                idx < currentSkillIndex
                  ? 'w-8 bg-emerald-400'
                  : idx === currentSkillIndex
                  ? 'w-10 bg-indigo-500'
                  : 'w-4 bg-slate-800'
              }`}
            />
          ))}
        </div>
      </div>

      {isLoadingQuestion ? (
        <div className="glass-panel p-12 text-center space-y-4">
          <Sparkles className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
          <h3 className="text-base font-semibold text-white">
            Formulating Adaptive Diagnostic Question...
          </h3>
          <p className="text-xs text-slate-400">
            Tailoring question difficulty to prior performance in {currentSkill?.name}.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Question Card */}
          <div className="glass-panel p-6 sm:p-8 space-y-4 border-indigo-500/30">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="badge badge-indigo text-[11px] font-mono">
                  {currentSkill?.name}
                </span>
                <span className="text-xs text-slate-400">
                  Sub-skill: {currentSkill?.subSkills[0]}
                </span>
              </div>
              <span className="badge badge-slate text-[10px] uppercase font-mono">
                Difficulty: {currentQuestionData?.difficulty}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-white/5">
              <p className="text-base sm:text-lg font-medium text-slate-100 leading-relaxed">
                {currentQuestionData?.question}
              </p>
            </div>

            {/* Rubric Criteria Callout */}
            <div className="text-xs text-slate-400 flex items-start gap-2 bg-indigo-950/20 p-3 rounded-lg border border-indigo-500/20">
              <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-indigo-300">Evaluation Criteria:</strong>{' '}
                {currentQuestionData?.rubricCriteria}
              </div>
            </div>
          </div>

          {/* Response Input Area */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Your Answer & Reasoning
              </label>

              {/* Voice Input Toggle Button */}
              <button
                type="button"
                onClick={handleToggleVoice}
                className={`btn text-xs py-1.5 px-3 flex items-center gap-1.5 transition-all ${
                  isRecording
                    ? 'bg-rose-500 text-white pulse-recording'
                    : 'btn-secondary text-slate-300'
                }`}
              >
                {isRecording ? (
                  <>
                    <Mic className="w-3.5 h-3.5 text-white animate-pulse" />
                    <span>Listening... (Click to stop)</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Dictate with Mic</span>
                  </>
                )}
              </button>
            </div>

            {/* Speech Recognition Error Notice */}
            {speechError && (
              <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{speechError}</span>
              </div>
            )}

            <textarea
              rows={6}
              value={learnerResponse}
              onChange={(e) => setLearnerResponse(e.target.value)}
              placeholder="State your approach, trade-off rationale, and operational mitigations. You may speak or type..."
              className="form-textarea text-sm font-sans"
            />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-white/5">
              <span className="text-[11px] text-slate-400">
                {learnerResponse.trim().split(/\s+/).filter(Boolean).length} words • Demonstrable evidence will be extracted from your response.
              </span>

              <button
                onClick={handleSubmitAnswer}
                disabled={isEvaluating || !learnerResponse.trim()}
                className="btn btn-primary w-full sm:w-auto text-xs py-2.5 px-6 flex items-center justify-center gap-2"
              >
                {isEvaluating ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    Evaluating Evidence...
                  </>
                ) : (
                  <>
                    Submit & Continue <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
