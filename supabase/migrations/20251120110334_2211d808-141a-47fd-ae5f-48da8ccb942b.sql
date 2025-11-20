-- Create risk_management_rules table
CREATE TABLE public.risk_management_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  rule_text TEXT NOT NULL,
  rule_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.risk_management_rules ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own risk management rules" 
ON public.risk_management_rules 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own risk management rules" 
ON public.risk_management_rules 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own risk management rules" 
ON public.risk_management_rules 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own risk management rules" 
ON public.risk_management_rules 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_risk_management_rules_updated_at
BEFORE UPDATE ON public.risk_management_rules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Rename trading_rules to strategy_checklist
ALTER TABLE public.trading_rules RENAME TO strategy_checklist;