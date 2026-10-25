-- ==============================================================================
-- LearnLoop Database Schema & Row-Level Security (RLS)
-- Evidence-Based Learning & Readiness Platform
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  experience_level TEXT CHECK (experience_level IN ('student', 'career_switcher', 'language_learner', 'professional', 'bootcamp_cohort')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. LEARNER PRIVACY SETTINGS
CREATE TABLE IF NOT EXISTS public.learner_privacy_settings (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  share_pod_progress BOOLEAN DEFAULT TRUE,
  allow_peer_matching BOOLEAN DEFAULT TRUE,
  store_transcripts BOOLEAN DEFAULT TRUE,
  collect_audio_blobs BOOLEAN DEFAULT FALSE, -- Privacy: transcripts preferred over raw audio
  data_retention_days INT DEFAULT 90,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SKILL TAXONOMY
CREATE TABLE IF NOT EXISTS public.skill_taxonomy (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  domain TEXT NOT NULL, -- e.g. 'technical_interview', 'coding', 'communication', 'sales', 'product'
  category TEXT NOT NULL,
  skill_name TEXT NOT NULL,
  sub_skill_name TEXT NOT NULL,
  description TEXT,
  rubric_criteria JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. GOALS
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  domain TEXT NOT NULL,
  target_outcome TEXT,
  target_deadline DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'achieved', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. GOAL SKILLS (Learner's live skill map for an active goal)
CREATE TABLE IF NOT EXISTS public.goal_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skill_taxonomy(id) ON DELETE CASCADE,
  target_level INT DEFAULT 80, -- Target mastery percentage (0-100)
  current_score INT DEFAULT 0, -- Demonstrated score (0-100)
  confidence TEXT DEFAULT 'low' CHECK (confidence IN ('low', 'medium', 'high', 'unassessed')),
  evidence_count INT DEFAULT 0,
  last_assessed_at TIMESTAMPTZ,
  UNIQUE(goal_id, skill_id)
);

-- 6. DIAGNOSTIC SESSIONS
CREATE TABLE IF NOT EXISTS public.diagnostic_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  overall_score INT,
  summary TEXT,
  strengths JSONB DEFAULT '[]'::jsonb,
  gaps JSONB DEFAULT '[]'::jsonb,
  recommended_actions JSONB DEFAULT '[]'::jsonb,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 7. DIAGNOSTIC ITEMS
CREATE TABLE IF NOT EXISTS public.diagnostic_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.diagnostic_sessions(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES public.skill_taxonomy(id),
  question TEXT NOT NULL,
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  learner_response TEXT,
  score INT, -- 0-100
  criteria TEXT,
  evidence_snippet TEXT,
  confidence TEXT DEFAULT 'medium' CHECK (confidence IN ('low', 'medium', 'high')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. PRACTICE SESSIONS (Voice Simulations & Coding Rounds)
CREATE TABLE IF NOT EXISTS public.practice_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL CHECK (session_type IN ('voice_simulation', 'coding_round')),
  scenario_title TEXT NOT NULL,
  scenario_role TEXT,
  objective TEXT,
  constraints TEXT,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'paused', 'completed', 'abandoned')),
  overall_score INT,
  summary TEXT,
  strengths JSONB DEFAULT '[]'::jsonb,
  gaps JSONB DEFAULT '[]'::jsonb,
  confidence_rating TEXT DEFAULT 'medium',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 9. PRACTICE TURNS (For Conversational Voice Simulation)
CREATE TABLE IF NOT EXISTS public.practice_turns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.practice_sessions(id) ON DELETE CASCADE,
  turn_number INT NOT NULL,
  speaker TEXT NOT NULL CHECK (speaker IN ('ai', 'learner')),
  content TEXT NOT NULL,
  input_method TEXT DEFAULT 'voice' CHECK (input_method IN ('voice', 'text_fallback')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. EVALUATIONS (Evidence-backed rubric score per turn/exercise)
CREATE TABLE IF NOT EXISTS public.evaluations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.practice_sessions(id) ON DELETE CASCADE,
  turn_id UUID REFERENCES public.practice_turns(id) ON DELETE SET NULL,
  skill_id UUID REFERENCES public.skill_taxonomy(id),
  rubric_category TEXT NOT NULL, -- e.g., 'clarity', 'technical_depth', 'structure', 'algorithmic_soundness'
  score INT NOT NULL, -- 0-100
  criteria TEXT NOT NULL,
  evidence_excerpt TEXT NOT NULL, -- direct quote or code excerpt
  explanation TEXT NOT NULL, -- explanation tying score to evidence
  confidence TEXT DEFAULT 'medium' CHECK (confidence IN ('low', 'medium', 'high')),
  next_suggested_action TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. CODING SUBMISSIONS
CREATE TABLE IF NOT EXISTS public.coding_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.practice_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  problem_id TEXT NOT NULL,
  problem_title TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'javascript',
  code TEXT NOT NULL,
  test_results JSONB DEFAULT '[]'::jsonb,
  correctness_score INT DEFAULT 0,
  time_complexity TEXT,
  space_complexity TEXT,
  reasoning_explanation TEXT,
  evidence_feedback JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. STUDY PODS
CREATE TABLE IF NOT EXISTS public.study_pods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  goal_domain TEXT NOT NULL,
  description TEXT,
  match_rationale TEXT NOT NULL,
  max_members INT DEFAULT 5,
  status TEXT DEFAULT 'active' CHECK (status IN ('forming', 'active', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. STUDY POD MEMBERS
CREATE TABLE IF NOT EXISTS public.study_pod_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pod_id UUID NOT NULL REFERENCES public.study_pods(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'peer' CHECK (role IN ('lead', 'peer', 'mentor')),
  complementary_strengths JSONB DEFAULT '[]'::jsonb,
  complementary_gaps JSONB DEFAULT '[]'::jsonb,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(pod_id, user_id)
);

-- 14. POD CHALLENGES
CREATE TABLE IF NOT EXISTS public.pod_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pod_id UUID NOT NULL REFERENCES public.study_pods(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  peer_teaching_tasks JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  due_at TIMESTAMPTZ
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_goals_user ON public.goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goal_skills_goal ON public.goal_skills(goal_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_sessions_user ON public.diagnostic_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_user ON public.practice_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_turns_session ON public.practice_turns(session_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_session ON public.evaluations(session_id);
CREATE INDEX IF NOT EXISTS idx_study_pod_members_user ON public.study_pod_members(user_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learner_privacy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_taxonomy ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostic_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostic_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_turns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coding_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_pods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_pod_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pod_challenges ENABLE ROW LEVEL SECURITY;

-- 1. Profiles: users can select/update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Privacy settings: private to the user
CREATE POLICY "Users manage own privacy settings" ON public.learner_privacy_settings FOR ALL USING (auth.uid() = user_id);

-- 3. Skill Taxonomy: readable by all authenticated users
CREATE POLICY "All authenticated users can read skill taxonomy" ON public.skill_taxonomy FOR SELECT TO authenticated USING (true);

-- 4. Goals: private to user
CREATE POLICY "Users can CRUD own goals" ON public.goals FOR ALL USING (auth.uid() = user_id);

-- 5. Goal skills: private to user
CREATE POLICY "Users can CRUD own goal skills" ON public.goal_skills FOR ALL USING (auth.uid() = user_id);

-- 6. Diagnostic sessions & items: private to user
CREATE POLICY "Users can CRUD own diagnostic sessions" ON public.diagnostic_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own diagnostic items" ON public.diagnostic_items FOR ALL USING (
  EXISTS (SELECT 1 FROM public.diagnostic_sessions s WHERE s.id = diagnostic_items.session_id AND s.user_id = auth.uid())
);

-- 7. Practice sessions & turns & evaluations: private to user
CREATE POLICY "Users can CRUD own practice sessions" ON public.practice_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own practice turns" ON public.practice_turns FOR ALL USING (
  EXISTS (SELECT 1 FROM public.practice_sessions s WHERE s.id = practice_turns.session_id AND s.user_id = auth.uid())
);
CREATE POLICY "Users can CRUD own evaluations" ON public.evaluations FOR ALL USING (
  EXISTS (SELECT 1 FROM public.practice_sessions s WHERE s.id = evaluations.session_id AND s.user_id = auth.uid())
);

-- 8. Coding submissions: private to user
CREATE POLICY "Users can CRUD own coding submissions" ON public.coding_submissions FOR ALL USING (auth.uid() = user_id);

-- 9. Study pods: visible to members or if actively forming for matching
CREATE POLICY "Pod members can view their pods" ON public.study_pods FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.study_pod_members m WHERE m.pod_id = study_pods.id AND m.user_id = auth.uid())
  OR status = 'forming'
);

-- 10. Study pod members: members of the same pod can see peer summary (no private practice transcripts)
CREATE POLICY "Members can view co-members of same pod" ON public.study_pod_members FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.study_pod_members m WHERE m.pod_id = study_pod_members.pod_id AND m.user_id = auth.uid())
);
CREATE POLICY "Users can join pods" ON public.study_pod_members FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 11. Pod challenges: visible to pod members
CREATE POLICY "Pod members can view and update challenges" ON public.pod_challenges FOR ALL USING (
  EXISTS (SELECT 1 FROM public.study_pod_members m WHERE m.pod_id = pod_challenges.pod_id AND m.user_id = auth.uid())
);
