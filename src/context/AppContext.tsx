import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  Goal,
  SkillItem,
  DiagnosticSession,
  PracticeTurn,
  SimulationResult,
  CodingProblem,
  CodingSubmissionResult,
  StudyPod,
  PrivacySettings,
  DomainType,
  ExperienceLevel,
} from '../types';
import { localStore, isSupabaseConfigured, supabase } from '../services/supabase';
import { checkServerHealth } from '../services/api';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface AppContextType {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  isDemoMode: boolean;
  setIsDemoMode: (isDemo: boolean) => void;
  systemCapabilities: {
    groqConfigured: boolean;
    supabaseConfigured: boolean;
    speechSupported: boolean;
  };

  // Goals
  goals: Goal[];
  activeGoal: Goal | null;
  setActiveGoal: (goal: Goal | null) => void;
  createGoal: (goal: Partial<Goal>) => Promise<Goal>;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  pauseGoal: (id: string) => void;

  // Diagnostics
  activeDiagnostic: DiagnosticSession | null;
  setActiveDiagnostic: (session: DiagnosticSession | null) => void;
  diagnosticHistory: DiagnosticSession[];
  saveDiagnosticSession: (session: DiagnosticSession) => void;

  // Practice & Simulation
  recentSimulations: { id: string; title: string; score: number; date: string; result: SimulationResult }[];
  saveSimulationResult: (title: string, result: SimulationResult) => void;

  // Coding Round
  codingSubmissions: { problemId: string; result: CodingSubmissionResult; date: string }[];
  saveCodingSubmission: (problemId: string, result: CodingSubmissionResult) => void;

  // Study Pods
  studyPods: StudyPod[];
  toggleJoinPod: (podId: string) => void;

  // Privacy Settings
  privacySettings: PrivacySettings;
  updatePrivacySettings: (settings: Partial<PrivacySettings>) => void;

  // Notifications
  toasts: Toast[];
  addToast: (type: Toast['type'], message: string) => void;
  removeToast: (id: string) => void;

  // Active Screen / Navigation
  currentRoute: string;
  navigateTo: (route: string) => void;
}

const defaultUser: UserProfile = {
  id: 'demo-user-1',
  email: 'alex.mercer@learnloop.io',
  fullName: 'Alex Mercer',
  experienceLevel: 'student',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  isDemoUser: true,
};

const initialDefaultSkills: SkillItem[] = [
  {
    id: 's-1',
    name: 'Algorithmic Problem Solving',
    subSkills: ['Edge Case Identification', 'Time-Space Complexity', 'Data Structures'],
    currentScore: 78,
    targetScore: 85,
    confidence: 'high',
    evidenceCount: 6,
    lastAssessedAt: '2026-10-24T10:00:00Z',
  },
  {
    id: 's-2',
    name: 'Technical Communication & Clarification',
    subSkills: ['Requirement Scoping', 'Trade-off Articulation', 'Active Listening'],
    currentScore: 82,
    targetScore: 90,
    confidence: 'high',
    evidenceCount: 8,
    lastAssessedAt: '2026-10-25T08:30:00Z',
  },
  {
    id: 's-3',
    name: 'System Architecture & Modularity',
    subSkills: ['Component Decoupling', 'Failure Modes & Resilience', 'Data Modeling'],
    currentScore: 64,
    targetScore: 80,
    confidence: 'medium',
    evidenceCount: 3,
    lastAssessedAt: '2026-10-23T14:20:00Z',
  },
  {
    id: 's-4',
    name: 'Behavioral & Leadership Presence',
    subSkills: ['STAR Method Structure', 'Conflict Resolution', 'Impact Quantification'],
    currentScore: 71,
    targetScore: 85,
    confidence: 'medium',
    evidenceCount: 4,
    lastAssessedAt: '2026-10-22T16:00:00Z',
  },
  {
    id: 's-5',
    name: 'Language & Pragmatic Fluency',
    subSkills: ['Clarity of Diction', 'Spontaneous Elaboration', 'Professional Tone'],
    currentScore: 0,
    targetScore: 75,
    confidence: 'unassessed',
    evidenceCount: 0,
  },
];

const initialDefaultGoal: Goal = {
  id: 'goal-primary-1',
  userId: 'demo-user-1',
  title: 'Senior Software Engineer Placement & System Interview',
  description: 'Master technical problem solving, live architecture explanation, and behavioral STAR presence for upcoming campus recruitment.',
  domain: 'technical_interview',
  targetOutcome: 'Pass Tier-1 tech company technical rounds with verifiable performance evidence.',
  deadline: '2026-12-15',
  status: 'active',
  createdAt: '2026-10-15T09:00:00Z',
  updatedAt: '2026-10-25T08:00:00Z',
  skills: initialDefaultSkills,
};

const initialStudyPods: StudyPod[] = [
  {
    id: 'pod-algo-1',
    name: 'Distributed Systems & Microservices Pod',
    domain: 'technical_interview',
    description: 'Collaborative practice pod for distributed systems, failure modes, and high-throughput interview drills.',
    matchRationale:
      'Matched with Maya (Strengths in Resilient Queueing, Gap in Data Modeling) and Kevin (Strengths in API Contracts, Gap in Complexities). You complement their gaps.',
    members: [
      {
        id: 'mem-1',
        name: 'Maya Chen',
        role: 'lead',
        complementaryStrengths: ['Queueing Systems', 'Message Brokers'],
        complementaryGaps: ['Data Modeling', 'Edge-case Analysis'],
      },
      {
        id: 'mem-2',
        name: 'Kevin Vance',
        role: 'peer',
        complementaryStrengths: ['API Contracts', 'Documentation'],
        complementaryGaps: ['Complexity Bounds', 'Concurrency'],
      },
      {
        id: 'mem-3',
        name: 'Alex Mercer (You)',
        role: 'peer',
        complementaryStrengths: ['Technical Clarification', 'Algorithmic Problem Solving'],
        complementaryGaps: ['Distributed State Sync'],
      },
    ],
    challenge: {
      title: 'Peer Review: Idempotent Payment Webhook Service',
      description: 'Design and cross-review an event-driven webhook handler that tolerates network partitions and deduplicates requests.',
      targetSkills: ['Idempotency', 'Dead-Letter Queues', 'Peer Review Rigor'],
      peerTeachingTasks: [
        {
          role: 'Architect',
          task: 'Present idempotency key schema and atomic lock sequence',
          deliverable: 'RFC diagram and lock pseudocode',
        },
        {
          role: 'Adversary / Reviewer',
          task: 'Simulate race conditions and packet duplicate edge cases',
          deliverable: 'Written critique with 3 concrete failover scenarios',
        },
      ],
      successCriteria: [
        'Zero double-charge vulnerability in design',
        'Peer feedback provided with evidence references',
      ],
    },
    isUserMember: true,
    status: 'active',
  },
  {
    id: 'pod-speech-2',
    name: 'Executive & Technical Communication Lab',
    domain: 'communication',
    description: 'Weekly simulated stakeholder briefing and impromptu design defense for engineers and product managers.',
    matchRationale:
      'Matched based on your target to enhance STAR structure and executive presence under time constraints.',
    members: [
      {
        id: 'mem-4',
        name: 'Sara Lindqvist',
        role: 'lead',
        complementaryStrengths: ['Executive Presence', 'Storytelling'],
        complementaryGaps: ['Technical Deep-Dives'],
      },
      {
        id: 'mem-5',
        name: 'Rohan Sharma',
        role: 'peer',
        complementaryStrengths: ['Data Presentation', 'Metric Framing'],
        complementaryGaps: ['Impromptu Handling'],
      },
    ],
    challenge: {
      title: 'Post-Mortem Defense Simulation',
      description: 'Deliver a 5-minute incident review to hostile executive stakeholders without deflecting responsibility.',
      targetSkills: ['Composure Under Pressure', 'Root Cause Framing', 'Remediation Roadmaps'],
      peerTeachingTasks: [
        {
          role: 'Incident Commander',
          task: 'Deliver opening chronological narrative and root cause',
          deliverable: '5-minute verbal briefing with slide artifact',
        },
        {
          role: 'VP Stakeholder',
          task: 'Ask challenging questions about testing oversights',
          deliverable: 'Real-time oral follow-up interrogation',
        },
      ],
      successCriteria: [
        'No defensive or evasive statements detected',
        'All action items assigned clear owners and SLAs',
      ],
    },
    isUserMember: false,
    status: 'forming',
  },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => localStore.get('USER', defaultUser));
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [currentRoute, setCurrentRoute] = useState<string>('dashboard');

  const [systemCapabilities, setSystemCapabilities] = useState({
    groqConfigured: false,
    supabaseConfigured: isSupabaseConfigured,
    speechSupported: typeof window !== 'undefined' && 'speechSynthesis' in window,
  });

  // Goals
  const [goals, setGoals] = useState<Goal[]>(() => localStore.get('GOALS', [initialDefaultGoal]));
  const [activeGoal, setActiveGoal] = useState<Goal | null>(() => {
    const storedId = localStore.get<string | null>('ACTIVE_GOAL_ID', null);
    const found = goals.find((g) => g.id === storedId);
    return found || goals[0] || null;
  });

  // Diagnostics
  const [activeDiagnostic, setActiveDiagnostic] = useState<DiagnosticSession | null>(null);
  const [diagnosticHistory, setDiagnosticHistory] = useState<DiagnosticSession[]>(() =>
    localStore.get('DIAGNOSTICS', [])
  );

  // Simulations
  const [recentSimulations, setRecentSimulations] = useState<
    { id: string; title: string; score: number; date: string; result: SimulationResult }[]
  >(() => localStore.get('PRACTICE_SESSIONS', []));

  // Coding
  const [codingSubmissions, setCodingSubmissions] = useState<
    { problemId: string; result: CodingSubmissionResult; date: string }[]
  >(() => localStore.get('CODING_SUBMISSIONS', []));

  // Study Pods
  const [studyPods, setStudyPods] = useState<StudyPod[]>(() =>
    localStore.get('STUDY_PODS', initialStudyPods)
  );

  // Privacy Settings
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>(() =>
    localStore.get('PRIVACY', {
      sharePodProgress: true,
      allowPeerMatching: true,
      storeTranscripts: true,
      collectAudioBlobs: false, // Default to transcripts only, preserving audio privacy
      dataRetentionDays: 90,
    })
  );

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Health check on mount
  useEffect(() => {
    checkServerHealth().then((health) => {
      setSystemCapabilities((prev) => ({
        ...prev,
        groqConfigured: Boolean(health.capabilities?.groqConfigured),
      }));
    });
  }, []);

  // Sync to localStore
  useEffect(() => {
    if (user) localStore.set('USER', user);
  }, [user]);

  useEffect(() => {
    localStore.set('GOALS', goals);
    if (activeGoal) {
      localStore.set('ACTIVE_GOAL_ID', activeGoal.id);
    }
  }, [goals, activeGoal]);

  useEffect(() => {
    localStore.set('DIAGNOSTICS', diagnosticHistory);
  }, [diagnosticHistory]);

  useEffect(() => {
    localStore.set('PRACTICE_SESSIONS', recentSimulations);
  }, [recentSimulations]);

  useEffect(() => {
    localStore.set('CODING_SUBMISSIONS', codingSubmissions);
  }, [codingSubmissions]);

  useEffect(() => {
    localStore.set('STUDY_PODS', studyPods);
  }, [studyPods]);

  useEffect(() => {
    localStore.set('PRIVACY', privacySettings);
  }, [privacySettings]);

  const addToast = (type: Toast['type'], message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const createGoal = async (goalData: Partial<Goal>): Promise<Goal> => {
    const newGoal: Goal = {
      id: `goal-${Date.now()}`,
      userId: user?.id || 'demo-user-1',
      title: goalData.title || 'New Goal',
      description: goalData.description || 'Targeted career practice goal',
      domain: goalData.domain || 'technical_interview',
      targetOutcome: goalData.targetOutcome || 'Achieve demonstrated proficiency.',
      deadline: goalData.deadline || undefined,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      skills: goalData.skills || initialDefaultSkills,
    };

    setGoals((prev) => [newGoal, ...prev]);
    setActiveGoal(newGoal);
    addToast('success', `Goal "${newGoal.title}" created successfully!`);
    return newGoal;
  };

  const updateGoal = (id: string, updates: Partial<Goal>) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updates, updatedAt: new Date().toISOString() } : g))
    );
    if (activeGoal?.id === id) {
      setActiveGoal((prev) => (prev ? { ...prev, ...updates, updatedAt: new Date().toISOString() } : null));
    }
    addToast('info', 'Goal updated.');
  };

  const pauseGoal = (id: string) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, status: g.status === 'active' ? 'paused' : 'active' } : g))
    );
    if (activeGoal?.id === id) {
      setActiveGoal((prev) =>
        prev ? { ...prev, status: prev.status === 'active' ? 'paused' : 'active' } : null
      );
    }
  };

  const saveDiagnosticSession = (session: DiagnosticSession) => {
    setDiagnosticHistory((prev) => [session, ...prev]);

    // Update active goal skill scores based on diagnostic
    if (activeGoal && session.items.length > 0) {
      const updatedSkills = activeGoal.skills.map((skill) => {
        const matchingItems = session.items.filter((item) => item.skillName === skill.name);
        if (matchingItems.length > 0) {
          const avgScore = Math.round(
            matchingItems.reduce((acc, curr) => acc + (curr.score || 70), 0) / matchingItems.length
          );
          return {
            ...skill,
            currentScore: avgScore,
            confidence: matchingItems[0].confidence || 'medium',
            evidenceCount: skill.evidenceCount + matchingItems.length,
            lastAssessedAt: new Date().toISOString(),
          };
        }
        return skill;
      });

      updateGoal(activeGoal.id, { skills: updatedSkills });
    }

    addToast('success', 'Diagnostic results analyzed and skill map updated.');
  };

  const saveSimulationResult = (title: string, result: SimulationResult) => {
    const entry = {
      id: `sim-${Date.now()}`,
      title,
      score: result.overallScore,
      date: new Date().toISOString(),
      result,
    };
    setRecentSimulations((prev) => [entry, ...prev]);

    // Update skill map with evidence
    if (activeGoal) {
      const updatedSkills = activeGoal.skills.map((skill) => {
        if (
          skill.name.toLowerCase().includes('communication') ||
          skill.name.toLowerCase().includes('problem')
        ) {
          return {
            ...skill,
            currentScore: Math.min(100, Math.round((skill.currentScore + result.overallScore) / 2)),
            confidence: 'high' as const,
            evidenceCount: skill.evidenceCount + result.rubricBreakdown.length,
            lastAssessedAt: new Date().toISOString(),
          };
        }
        return skill;
      });
      updateGoal(activeGoal.id, { skills: updatedSkills });
    }

    addToast('success', `Simulation completed. Score: ${result.overallScore}%`);
  };

  const saveCodingSubmission = (problemId: string, result: CodingSubmissionResult) => {
    const entry = {
      problemId,
      result,
      date: new Date().toISOString(),
    };
    setCodingSubmissions((prev) => [entry, ...prev]);

    // Update algorithmic skill
    if (activeGoal) {
      const updatedSkills = activeGoal.skills.map((skill) => {
        if (skill.name.toLowerCase().includes('algorithmic') || skill.name.toLowerCase().includes('problem')) {
          return {
            ...skill,
            currentScore: Math.round((skill.currentScore + result.overallScore) / 2),
            confidence: 'high' as const,
            evidenceCount: skill.evidenceCount + 2,
            lastAssessedAt: new Date().toISOString(),
          };
        }
        return skill;
      });
      updateGoal(activeGoal.id, { skills: updatedSkills });
    }

    addToast('success', `Coding round evaluated. Score: ${result.overallScore}%`);
  };

  const toggleJoinPod = (podId: string) => {
    setStudyPods((prev) =>
      prev.map((pod) => {
        if (pod.id === podId) {
          const nextState = !pod.isUserMember;
          addToast(nextState ? 'success' : 'info', nextState ? `Joined ${pod.name}!` : `Left ${pod.name}`);
          return { ...pod, isUserMember: nextState };
        }
        return pod;
      })
    );
  };

  const updatePrivacySettings = (settings: Partial<PrivacySettings>) => {
    setPrivacySettings((prev) => ({ ...prev, ...settings }));
    addToast('info', 'Privacy preferences updated.');
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        isDemoMode,
        setIsDemoMode,
        systemCapabilities,
        goals,
        activeGoal,
        setActiveGoal,
        createGoal,
        updateGoal,
        pauseGoal,
        activeDiagnostic,
        setActiveDiagnostic,
        diagnosticHistory,
        saveDiagnosticSession,
        recentSimulations,
        saveSimulationResult,
        codingSubmissions,
        saveCodingSubmission,
        studyPods,
        toggleJoinPod,
        privacySettings,
        updatePrivacySettings,
        toasts,
        addToast,
        removeToast,
        currentRoute,
        navigateTo: setCurrentRoute,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
