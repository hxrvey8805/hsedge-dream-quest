-- Add strategy_id column to risk_management_rules table
ALTER TABLE public.risk_management_rules
ADD COLUMN strategy_id uuid REFERENCES public.strategies(id) ON DELETE SET NULL;

-- Add strategy_id column to strategy_checklist table
ALTER TABLE public.strategy_checklist
ADD COLUMN strategy_id uuid REFERENCES public.strategies(id) ON DELETE SET NULL;

-- Create indexes for better query performance
CREATE INDEX idx_risk_management_rules_strategy_id ON public.risk_management_rules(strategy_id);
CREATE INDEX idx_strategy_checklist_strategy_id ON public.strategy_checklist(strategy_id);