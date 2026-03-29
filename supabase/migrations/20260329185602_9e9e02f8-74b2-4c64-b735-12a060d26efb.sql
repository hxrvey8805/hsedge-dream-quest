
CREATE TABLE public.weekly_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  week_start_date DATE NOT NULL,
  week_stats JSONB,
  best_trade_id UUID,
  best_trade_analysis TEXT,
  worst_trade_id UUID,
  worst_trade_analysis TEXT,
  patterns_insights TEXT,
  next_week_plan TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_start_date)
);

ALTER TABLE public.weekly_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own weekly reviews"
  ON public.weekly_reviews FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own weekly reviews"
  ON public.weekly_reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weekly reviews"
  ON public.weekly_reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own weekly reviews"
  ON public.weekly_reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
