/*
  # Jayesh Life Management System - Complete Database Schema

  ## Overview
  This migration creates a comprehensive database schema for managing all aspects of personal, professional, and financial life.

  ## New Tables

  ### 1. User Profile
  - `profiles` - User profile information with photo, bio, and metadata
  
  ### 2. Portfolio & Skills
  - `skills` - Technical and soft skills tracking
  - `certifications` - Professional certifications
  - `timeline_events` - Career timeline milestones
  
  ### 3. Cognizant Journey
  - `journey_logs` - Daily logs and experiences
  - `people_met` - Database of people encountered with details
  - `achievements` - Professional achievements and milestones
  
  ### 4. Learning & Work
  - `tasks` - Task management with deadlines and completion tracking
  - `learning_logs` - Daily learning tracker with topics and time
  - `roadmaps` - Multiple life domain roadmaps
  - `roadmap_milestones` - Individual milestones for each roadmap
  
  ### 5. Personality Development
  - `personality_traits` - Daily ratings for general traits
  - `olq_scores` - 15 OLQ tracking with weekly scores
  - `ai_suggestions` - Motivational content and improvement advice
  
  ### 6. Diary & Memory
  - `diary_entries` - Daily diary with mood, images, and reflections
  - `weekly_summaries` - Auto-generated weekly summaries
  
  ### 7. Finance
  - `salary_info` - Monthly salary breakdown
  - `savings_sip` - Savings and SIP tracking
  - `expenses` - Detailed expense tracking by category
  - `financial_goals` - Short and long-term financial targets
  
  ### 8. Riding & Travel
  - `rides` - Weekend ride logs with distance and photos
  - `places_explored` - Chennai places visited
  - `bike_maintenance` - Maintenance logs and mileage
  
  ### 9. Goals & Achievements
  - `goals` - Goals across all life domains
  - `future_letters` - Letters to future self
  - `badges` - Achievement badges earned
  - `streaks` - Daily streak tracking
  
  ## Security
  - RLS enabled on all tables
  - Policies restrict access to authenticated user's own data
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL UNIQUE,
  full_name text NOT NULL DEFAULT '',
  photo_url text DEFAULT '',
  bio text DEFAULT '',
  quote text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Skills table
CREATE TABLE IF NOT EXISTS skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'technical',
  proficiency int DEFAULT 50,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own skills"
  ON skills FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Certifications table
CREATE TABLE IF NOT EXISTS certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  title text NOT NULL,
  issuer text NOT NULL,
  issue_date date NOT NULL,
  credential_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own certifications"
  ON certifications FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Timeline events table
CREATE TABLE IF NOT EXISTS timeline_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  event_date date NOT NULL,
  category text DEFAULT 'career',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own timeline events"
  ON timeline_events FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Journey logs table
CREATE TABLE IF NOT EXISTS journey_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  log_date date NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  what_learned text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE journey_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own journey logs"
  ON journey_logs FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- People met table
CREATE TABLE IF NOT EXISTS people_met (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  position text DEFAULT '',
  level_rank text DEFAULT '',
  linkedin_url text DEFAULT '',
  notes text DEFAULT '',
  met_date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE people_met ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own people contacts"
  ON people_met FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  achievement_date date NOT NULL,
  category text DEFAULT 'work',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own achievements"
  ON achievements FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  task_name text NOT NULL,
  assigned_date date NOT NULL,
  deadline date NOT NULL,
  status text DEFAULT 'pending',
  completion_date date,
  what_learned text DEFAULT '',
  achievement_points int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own tasks"
  ON tasks FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Learning logs table
CREATE TABLE IF NOT EXISTS learning_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  log_date date NOT NULL,
  topic text NOT NULL,
  time_spent int DEFAULT 0,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE learning_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own learning logs"
  ON learning_logs FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Roadmaps table
CREATE TABLE IF NOT EXISTS roadmaps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  category text NOT NULL,
  progress int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own roadmaps"
  ON roadmaps FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Roadmap milestones table
CREATE TABLE IF NOT EXISTS roadmap_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id uuid REFERENCES roadmaps ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  target_date date,
  completed boolean DEFAULT false,
  completed_date date,
  order_index int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE roadmap_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own milestones"
  ON roadmap_milestones FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Personality traits table
CREATE TABLE IF NOT EXISTS personality_traits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  trait_date date NOT NULL,
  confidence int DEFAULT 5,
  discipline int DEFAULT 5,
  calmness int DEFAULT 5,
  emotional_control int DEFAULT 5,
  social_skills int DEFAULT 5,
  leadership int DEFAULT 5,
  decision_making int DEFAULT 5,
  riding_confidence int DEFAULT 5,
  fear_management int DEFAULT 5,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE personality_traits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own personality traits"
  ON personality_traits FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- OLQ scores table
CREATE TABLE IF NOT EXISTS olq_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  score_date date NOT NULL,
  effective_intelligence int DEFAULT 5,
  reasoning_ability int DEFAULT 5,
  organizing_ability int DEFAULT 5,
  power_of_expression int DEFAULT 5,
  social_adaptability int DEFAULT 5,
  cooperation int DEFAULT 5,
  sense_of_responsibility int DEFAULT 5,
  initiative int DEFAULT 5,
  self_confidence int DEFAULT 5,
  speed_of_decision int DEFAULT 5,
  ability_to_influence_group int DEFAULT 5,
  liveliness int DEFAULT 5,
  determination int DEFAULT 5,
  courage int DEFAULT 5,
  stamina int DEFAULT 5,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE olq_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own OLQ scores"
  ON olq_scores FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- AI suggestions table
CREATE TABLE IF NOT EXISTS ai_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  suggestion_date date NOT NULL,
  daily_quote text DEFAULT '',
  life_lesson text DEFAULT '',
  motivational_line text DEFAULT '',
  improvement_suggestion text DEFAULT '',
  is_edited boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own AI suggestions"
  ON ai_suggestions FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Diary entries table
CREATE TABLE IF NOT EXISTS diary_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  entry_date date NOT NULL,
  content text NOT NULL,
  mood text DEFAULT 'neutral',
  what_learned text DEFAULT '',
  what_made_happy text DEFAULT '',
  what_to_improve text DEFAULT '',
  images jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own diary entries"
  ON diary_entries FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Weekly summaries table
CREATE TABLE IF NOT EXISTS weekly_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  week_start_date date NOT NULL,
  week_end_date date NOT NULL,
  summary text NOT NULL,
  highlights text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE weekly_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own weekly summaries"
  ON weekly_summaries FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Salary info table
CREATE TABLE IF NOT EXISTS salary_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  month_year date NOT NULL,
  gross_salary decimal(10,2) DEFAULT 0,
  in_hand_salary decimal(10,2) DEFAULT 0,
  tax_deduction decimal(10,2) DEFAULT 0,
  other_deductions decimal(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE salary_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own salary info"
  ON salary_info FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Savings and SIP table
CREATE TABLE IF NOT EXISTS savings_sip (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  month_year date NOT NULL,
  monthly_savings decimal(10,2) DEFAULT 0,
  savings_percentage decimal(5,2) DEFAULT 0,
  sip_amount decimal(10,2) DEFAULT 0,
  emergency_fund decimal(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE savings_sip ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own savings SIP"
  ON savings_sip FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  expense_date date NOT NULL,
  amount decimal(10,2) NOT NULL,
  category text NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own expenses"
  ON expenses FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Financial goals table
CREATE TABLE IF NOT EXISTS financial_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  goal_name text NOT NULL,
  target_amount decimal(10,2) NOT NULL,
  current_amount decimal(10,2) DEFAULT 0,
  target_date date NOT NULL,
  time_horizon text DEFAULT '1year',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own financial goals"
  ON financial_goals FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Rides table
CREATE TABLE IF NOT EXISTS rides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  ride_date date NOT NULL,
  distance decimal(10,2) DEFAULT 0,
  route_map text DEFAULT '',
  photos jsonb DEFAULT '[]',
  notes text DEFAULT '',
  food_review text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE rides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own rides"
  ON rides FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Places explored table
CREATE TABLE IF NOT EXISTS places_explored (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  place_name text NOT NULL,
  visit_date date NOT NULL,
  location text DEFAULT '',
  rating int DEFAULT 5,
  notes text DEFAULT '',
  photos jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE places_explored ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own places explored"
  ON places_explored FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Bike maintenance table
CREATE TABLE IF NOT EXISTS bike_maintenance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  maintenance_date date NOT NULL,
  mileage decimal(10,2) DEFAULT 0,
  service_type text NOT NULL,
  cost decimal(10,2) DEFAULT 0,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bike_maintenance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own bike maintenance"
  ON bike_maintenance FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Goals table
CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  goal_name text NOT NULL,
  category text NOT NULL,
  description text DEFAULT '',
  target_date date,
  status text DEFAULT 'active',
  progress int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own goals"
  ON goals FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Future letters table
CREATE TABLE IF NOT EXISTS future_letters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  written_date date NOT NULL,
  open_date date NOT NULL,
  content text NOT NULL,
  is_locked boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE future_letters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own future letters"
  ON future_letters FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Badges table
CREATE TABLE IF NOT EXISTS badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  badge_name text NOT NULL,
  badge_type text NOT NULL,
  description text DEFAULT '',
  earned_date date NOT NULL,
  icon text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own badges"
  ON badges FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Streaks table
CREATE TABLE IF NOT EXISTS streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  streak_type text NOT NULL,
  current_streak int DEFAULT 0,
  longest_streak int DEFAULT 0,
  last_activity_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, streak_type)
);

ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own streaks"
  ON streaks FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
