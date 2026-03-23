CREATE TABLE public.skipped_trading_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  skip_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, skip_date)
);

ALTER TABLE public.skipped_trading_days ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own skipped days" ON public.skipped_trading_days
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own skipped days" ON public.skipped_trading_days
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own skipped days" ON public.skipped_trading_days
  FOR DELETE TO authenticated USING (auth.uid() = user_id);