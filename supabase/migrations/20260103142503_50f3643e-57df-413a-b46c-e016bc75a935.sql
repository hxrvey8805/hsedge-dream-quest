-- Add running_pl column to personal_accounts for P&L tracking
ALTER TABLE public.personal_accounts 
ADD COLUMN running_pl numeric NOT NULL DEFAULT 0;

-- Add running_pl column to funded_accounts for P&L tracking
ALTER TABLE public.funded_accounts 
ADD COLUMN running_pl numeric NOT NULL DEFAULT 0;