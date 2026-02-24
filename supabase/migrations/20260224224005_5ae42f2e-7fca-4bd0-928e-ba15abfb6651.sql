
CREATE TABLE public.daily_improvement_focus (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  review_date DATE NOT NULL,
  focus_text TEXT NOT NULL,
  execution_rating INTEGER,
  execution_notes TEXT,
  rated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, review_date)
);

ALTER TABLE public.daily_improvement_focus ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own focus" ON public.daily_improvement_focus FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own focus" ON public.daily_improvement_focus FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own focus" ON public.daily_improvement_focus FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own focus" ON public.daily_improvement_focus FOR DELETE USING (auth.uid() = user_id);
