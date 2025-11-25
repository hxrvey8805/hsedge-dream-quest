-- Create trading_strategies table
CREATE TABLE IF NOT EXISTS public.trading_strategies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('risk_management', 'strategy_checklist')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, name, type)
);

-- Enable Row Level Security
ALTER TABLE public.trading_strategies ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own strategies" 
ON public.trading_strategies 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own strategies" 
ON public.trading_strategies 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own strategies" 
ON public.trading_strategies 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own strategies" 
ON public.trading_strategies 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add strategy_id columns to existing tables
ALTER TABLE public.risk_management_rules 
ADD COLUMN IF NOT EXISTS strategy_id UUID REFERENCES public.trading_strategies(id) ON DELETE SET NULL;

ALTER TABLE public.strategy_checklist 
ADD COLUMN IF NOT EXISTS strategy_id UUID REFERENCES public.trading_strategies(id) ON DELETE SET NULL;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_trading_strategies_updated_at
BEFORE UPDATE ON public.trading_strategies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

