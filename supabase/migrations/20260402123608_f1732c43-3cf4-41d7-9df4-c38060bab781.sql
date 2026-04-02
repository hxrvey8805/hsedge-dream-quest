ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS default_risk_amount numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS currency text DEFAULT 'USD';