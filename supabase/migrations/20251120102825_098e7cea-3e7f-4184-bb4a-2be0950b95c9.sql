-- Create enum for achievement categories
CREATE TYPE public.achievement_category AS ENUM ('trading', 'consistency', 'profit', 'streak');

-- Create enum for milestone types
CREATE TYPE public.milestone_type AS ENUM ('profit_target', 'trade_count', 'win_rate', 'streak');

-- Create user_profiles table for gamification
CREATE TABLE public.user_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  level integer NOT NULL DEFAULT 1,
  experience_points integer NOT NULL DEFAULT 0,
  total_achievements_unlocked integer NOT NULL DEFAULT 0,
  current_streak_days integer NOT NULL DEFAULT 0,
  longest_streak integer NOT NULL DEFAULT 0,
  last_trade_date date,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create achievements table (predefined achievements)
CREATE TABLE public.achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  category public.achievement_category NOT NULL,
  requirement_type text NOT NULL,
  requirement_value integer NOT NULL,
  xp_reward integer NOT NULL,
  badge_color text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create user_achievements table (tracking user's unlocked achievements)
CREATE TABLE public.user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id uuid NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  progress integer NOT NULL DEFAULT 0,
  unlocked_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Create milestones table
CREATE TABLE public.milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  milestone_type public.milestone_type NOT NULL,
  target_value numeric NOT NULL,
  current_value numeric NOT NULL DEFAULT 0,
  is_completed boolean NOT NULL DEFAULT false,
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view their own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for achievements (everyone can read)
CREATE POLICY "Anyone can view achievements"
  ON public.achievements FOR SELECT
  USING (true);

-- RLS Policies for user_achievements
CREATE POLICY "Users can view their own achievements"
  ON public.user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements"
  ON public.user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own achievements"
  ON public.user_achievements FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for milestones
CREATE POLICY "Users can view their own milestones"
  ON public.milestones FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own milestones"
  ON public.milestones FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own milestones"
  ON public.milestones FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own milestones"
  ON public.milestones FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for user_profiles updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for milestones updated_at
CREATE TRIGGER update_milestones_updated_at
  BEFORE UPDATE ON public.milestones
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically create user profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;

-- Create trigger to create user profile on auth.users insert
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_profile();

-- Seed predefined achievements
INSERT INTO public.achievements (name, description, icon, category, requirement_type, requirement_value, xp_reward, badge_color) VALUES
  -- Trading Milestones
  ('First Trade', 'Log your first trade', 'Trophy', 'trading', 'total_trades', 1, 10, '#CD7F32'),
  ('10 Trades Strong', 'Complete 10 trades', 'Target', 'trading', 'total_trades', 10, 50, '#CD7F32'),
  ('Century Club', 'Complete 100 trades', 'Award', 'trading', 'total_trades', 100, 200, '#C0C0C0'),
  ('Trade Master', 'Complete 500 trades', 'Crown', 'trading', 'total_trades', 500, 500, '#FFD700'),
  
  -- Profit & Performance
  ('First Win', 'Win your first trade', 'TrendingUp', 'profit', 'winning_trades', 1, 25, '#CD7F32'),
  ('Profit Maker', 'Achieve $100 profit', 'DollarSign', 'profit', 'total_profit', 100, 100, '#C0C0C0'),
  ('Big Win', 'Single trade with 50+ pips', 'Zap', 'profit', 'single_trade_pips', 50, 150, '#FFD700'),
  ('Profit King', 'Achieve $1000 total profit', 'Gem', 'profit', 'total_profit', 1000, 300, '#FFD700'),
  
  -- Consistency & Streaks
  ('Week Warrior', 'Trade 5 days in a row', 'Calendar', 'streak', 'consecutive_days', 5, 75, '#C0C0C0'),
  ('Monthly Master', 'Trade 20 days in a month', 'CalendarCheck', 'consistency', 'monthly_trades', 20, 250, '#FFD700'),
  ('Unstoppable', '10 day trading streak', 'Flame', 'streak', 'consecutive_days', 10, 200, '#FFD700'),
  ('Win Streak', '5 winning trades in a row', 'Sparkles', 'streak', 'win_streak', 5, 150, '#FFD700'),
  
  -- Win Rate Excellence
  ('50% Club', 'Achieve 50% win rate with 20+ trades', 'BarChart3', 'consistency', 'win_rate_with_min', 50, 100, '#C0C0C0'),
  ('High Performer', 'Achieve 60% win rate with 50+ trades', 'TrendingUp', 'consistency', 'win_rate_with_min', 60, 300, '#FFD700'),
  ('Elite Trader', 'Achieve 70% win rate with 100+ trades', 'Star', 'consistency', 'win_rate_with_min', 70, 500, '#E5E4E2');