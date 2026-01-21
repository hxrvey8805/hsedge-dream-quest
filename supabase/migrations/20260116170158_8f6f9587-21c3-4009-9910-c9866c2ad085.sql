-- Create daily reviews table
CREATE TABLE public.daily_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  review_date DATE NOT NULL,
  total_pl DECIMAL,
  what_went_well TEXT,
  lessons_learned TEXT,
  missed_opportunities TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, review_date)
);

-- Create trade review slides (one per trade in the review)
CREATE TABLE public.trade_review_slides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  daily_review_id UUID NOT NULL REFERENCES public.daily_reviews(id) ON DELETE CASCADE,
  trade_id UUID REFERENCES public.trades(id) ON DELETE SET NULL,
  user_id UUID NOT NULL,
  screenshot_url TEXT,
  markers JSONB DEFAULT '[]'::jsonb,
  reflection TEXT,
  slide_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.daily_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_review_slides ENABLE ROW LEVEL SECURITY;

-- RLS policies for daily_reviews
CREATE POLICY "Users can view their own reviews" ON public.daily_reviews FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own reviews" ON public.daily_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reviews" ON public.daily_reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reviews" ON public.daily_reviews FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for trade_review_slides
CREATE POLICY "Users can view their own slides" ON public.trade_review_slides FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own slides" ON public.trade_review_slides FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own slides" ON public.trade_review_slides FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own slides" ON public.trade_review_slides FOR DELETE USING (auth.uid() = user_id);

-- Create storage bucket for review screenshots (only if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'review-screenshots') THEN
    INSERT INTO storage.buckets (id, name, public) VALUES ('review-screenshots', 'review-screenshots', true);
  END IF;
END $$;

-- Storage policies
CREATE POLICY "Users can upload review screenshots" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'review-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view their review screenshots" ON storage.objects FOR SELECT USING (bucket_id = 'review-screenshots');
CREATE POLICY "Users can update their review screenshots" ON storage.objects FOR UPDATE USING (bucket_id = 'review-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their review screenshots" ON storage.objects FOR DELETE USING (bucket_id = 'review-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Trigger for updated_at
CREATE TRIGGER update_daily_reviews_updated_at BEFORE UPDATE ON public.daily_reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_trade_review_slides_updated_at BEFORE UPDATE ON public.trade_review_slides FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();