-- Create funded_accounts table
CREATE TABLE public.funded_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  company TEXT NOT NULL,
  account_size TEXT NOT NULL,
  funded_accounts_count INTEGER NOT NULL DEFAULT 0,
  funded_accounts_goal INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create evaluations table
CREATE TABLE public.evaluations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  company TEXT NOT NULL,
  account_size TEXT NOT NULL,
  running_pl NUMERIC NOT NULL DEFAULT 0,
  profit_target NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for funded_accounts
ALTER TABLE public.funded_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own funded accounts"
  ON public.funded_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own funded accounts"
  ON public.funded_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own funded accounts"
  ON public.funded_accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own funded accounts"
  ON public.funded_accounts FOR DELETE
  USING (auth.uid() = user_id);

-- Enable RLS for evaluations
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own evaluations"
  ON public.evaluations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own evaluations"
  ON public.evaluations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own evaluations"
  ON public.evaluations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own evaluations"
  ON public.evaluations FOR DELETE
  USING (auth.uid() = user_id);

-- Add triggers for automatic timestamp updates
CREATE TRIGGER update_funded_accounts_updated_at
  BEFORE UPDATE ON public.funded_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_evaluations_updated_at
  BEFORE UPDATE ON public.evaluations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();