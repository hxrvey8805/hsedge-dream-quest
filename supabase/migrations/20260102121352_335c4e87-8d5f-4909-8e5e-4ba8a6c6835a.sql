-- Create personal accounts table for traders
CREATE TABLE public.personal_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  account_name TEXT NOT NULL,
  broker TEXT,
  account_size NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.personal_accounts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own personal accounts" 
ON public.personal_accounts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own personal accounts" 
ON public.personal_accounts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own personal accounts" 
ON public.personal_accounts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own personal accounts" 
ON public.personal_accounts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_personal_accounts_updated_at
BEFORE UPDATE ON public.personal_accounts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add onboarding_completed to user_profiles
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS primary_dream_id UUID REFERENCES public.dream_profiles(id);

-- Enable realtime for personal accounts
ALTER PUBLICATION supabase_realtime ADD TABLE public.personal_accounts;