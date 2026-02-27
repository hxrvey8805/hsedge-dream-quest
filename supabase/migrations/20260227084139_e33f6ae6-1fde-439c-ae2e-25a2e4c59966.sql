
CREATE TABLE public.daily_game_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  plan_date DATE NOT NULL,
  market_bias TEXT,
  key_levels TEXT,
  watchlist TEXT,
  risk_notes TEXT,
  mental_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, plan_date)
);

ALTER TABLE public.daily_game_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own game plans" ON public.daily_game_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own game plans" ON public.daily_game_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own game plans" ON public.daily_game_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own game plans" ON public.daily_game_plans FOR DELETE USING (auth.uid() = user_id);
