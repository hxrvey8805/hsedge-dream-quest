-- Create dream profiles table for lifestyle visualization
CREATE TABLE public.dream_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  dream_type TEXT NOT NULL CHECK (dream_type IN ('present', 'future')),
  timescale TEXT,
  
  -- Lifestyle questions
  living_situation TEXT,
  living_image_url TEXT,
  vehicle TEXT,
  vehicle_image_url TEXT,
  style TEXT,
  style_image_url TEXT,
  travel TEXT,
  travel_image_url TEXT,
  diet_lifestyle TEXT,
  professional_help TEXT,
  luxury_approach TEXT,
  why_motivation TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dream purchases table
CREATE TABLE public.dream_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dream_profile_id UUID NOT NULL REFERENCES public.dream_profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  item_name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  down_payment NUMERIC DEFAULT 0,
  tax_interest_buffer NUMERIC DEFAULT 0,
  payment_period_years NUMERIC DEFAULT 0,
  image_url TEXT,
  is_selected BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create trading income sources table
CREATE TABLE public.trading_income_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dream_profile_id UUID NOT NULL REFERENCES public.dream_profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  source_name TEXT NOT NULL,
  account_size NUMERIC NOT NULL,
  profit_split_percent NUMERIC NOT NULL,
  monthly_return_percent NUMERIC NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dream_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dream_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trading_income_sources ENABLE ROW LEVEL SECURITY;

-- RLS Policies for dream_profiles
CREATE POLICY "Users can view their own dream profiles"
  ON public.dream_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own dream profiles"
  ON public.dream_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dream profiles"
  ON public.dream_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dream profiles"
  ON public.dream_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for dream_purchases
CREATE POLICY "Users can view their own dream purchases"
  ON public.dream_purchases FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own dream purchases"
  ON public.dream_purchases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dream purchases"
  ON public.dream_purchases FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dream purchases"
  ON public.dream_purchases FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for trading_income_sources
CREATE POLICY "Users can view their own trading income sources"
  ON public.trading_income_sources FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own trading income sources"
  ON public.trading_income_sources FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trading income sources"
  ON public.trading_income_sources FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trading income sources"
  ON public.trading_income_sources FOR DELETE
  USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_dream_profiles_updated_at
  BEFORE UPDATE ON public.dream_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dream_purchases_updated_at
  BEFORE UPDATE ON public.dream_purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trading_income_sources_updated_at
  BEFORE UPDATE ON public.trading_income_sources
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();