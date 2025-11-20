-- Create trading_rules table
CREATE TABLE public.trading_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  rule_text TEXT NOT NULL,
  rule_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.trading_rules ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own trading rules" 
ON public.trading_rules 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own trading rules" 
ON public.trading_rules 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trading rules" 
ON public.trading_rules 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trading rules" 
ON public.trading_rules 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_trading_rules_updated_at
BEFORE UPDATE ON public.trading_rules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();