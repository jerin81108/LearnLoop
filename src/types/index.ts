export type DomainType =
  | 'technical_interview'
  | 'coding'
  | 'communication'
  | 'language_practice'
  | 'sales_scenario'
  | 'product_scenario'
  | 'custom';

export type ExperienceLevel =
  | 'student'
  | 'career_switcher'
  | 'language_learner'
  | 'professional'
  | 'bootcamp_cohort';

export type GoalStatus = 'active' | 'paused' | 'achieved' | 'archived';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  experienceLevel: ExperienceLevel;
  avatarUrl?: string;
  isDemoUser?: boolean;
}

export interface SkillItem {
  id: string;
  name: string;
  subSkills: string[];
  currentScore: number; // 0-100
  targetScore: number;
  confidence: 'high' | 'medium' | 'low' | 'unassessed';
  evidenceCount: number;
  lastAssessedAt?: string;
  category?: string;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string;
  domain: DomainType;
  targetOutcome: string;
  deadline?: string;
  status: GoalStatus;
  createdAt: string;
  updatedAt: string;
  skills: SkillItem[];
}

export interface DiagnosticItem {
  id: string;
  skillName: string;
  subSkillName: string;
  question: string;
  difficulty: 'easy' | 'medium' | 'hard';
  rubricCriteria: string;
  learnerResponse?: string;
  score?: number;
  confidence?: 'high' | 'medium' | 'low';
  evidenceExcerpt?: string;
  strengths?: string[];
  gaps?: string[];
  feedback?: string;
}

export interface DiagnosticSession {
  id: string;
  goalId: string;
  status: 'in_progress' | 'completed';
  startedAt: string;
  completedAt?: string;
  overallScore?: number;
  items: DiagnosticItem[];
  strengths: string[];
  gaps: string[];
  recommendedActions: string[];
  summary?: string;
}

export interface PracticeTurn {
  id: string;
  turnNumber: number;
  speaker: 'ai' | 'learner';
  content: string;
  timestamp: string;
  inputMethod?: 'voice' | 'text_fallback';
  evaluation?: {
    rubricCategory: string;
    score: number;
    evidenceSnippet: string;
    rationale: string;
    confidence: 'high' | 'medium' | 'low';
  };
}

export interface VoiceScenario {
  id: string;
  title: string;
  role: string;
  domain: DomainType;
  objective: string;
  constraints: string;
  suggestedDurationMin: number;
  starterPrompt: string;
}

export interface SimulationResult {
  overallScore: number;
  summary: string;
  confidenceRating: 'high' | 'medium' | 'low';
  evidenceCoverage: string;
  strengths: { title: string; evidence: string; impact: string }[];
  gaps: { title: string; evidence: string; recommendation: string }[];
  rubricBreakdown: { category: string; score: number; evidence: string }[];
  nextRecommendedExercises: string[];
}

export interface CodingTestCase {
  id: number;
  testId?: number;
  input: any;
  expected: any;
  actual?: any;
  passed?: boolean;
  error?: string;
  executionTimeMs?: number;
}

export interface CodingProblem {
  id: string;
  title: string;
  domain: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  constraints: string[];
  examples: { input: string; output: string; explanation?: string }[];
  starterCode: { [lang: string]: string };
  tests: CodingTestCase[];
}

export interface CodingSubmissionResult {
  correctnessScore: number;
  algorithmicSoundness: number;
  codeCleanliness: number;
  timeComplexity: string;
  spaceComplexity: string;
  overallScore: number;
  strengths: string[];
  gaps: string[];
  codeEvidence: string;
  feedback: string;
  suggestedNextAction: string;
}

export interface StudyPodMember {
  id: string;
  name: string;
  role: 'lead' | 'peer' | 'mentor';
  avatar?: string;
  complementaryStrengths: string[];
  complementaryGaps: string[];
}

export interface StudyPodChallenge {
  title: string;
  description: string;
  targetSkills: string[];
  peerTeachingTasks: { role: string; task: string; deliverable: string }[];
  successCriteria: string[];
}

export interface StudyPod {
  id: string;
  name: string;
  domain: DomainType;
  description: string;
  matchRationale: string;
  members: StudyPodMember[];
  challenge: StudyPodChallenge;
  isUserMember: boolean;
  status: 'forming' | 'active' | 'completed';
}

export interface PrivacySettings {
  sharePodProgress: boolean;
  allowPeerMatching: boolean;
  storeTranscripts: boolean;
  collectAudioBlobs: boolean;
  dataRetentionDays: number;
}
