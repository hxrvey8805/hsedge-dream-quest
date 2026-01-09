-- Add instrument_type column to personal_accounts
ALTER TABLE public.personal_accounts 
ADD COLUMN IF NOT EXISTS instrument_type TEXT DEFAULT 'Forex';

-- Add instrument_type column to funded_accounts
ALTER TABLE public.funded_accounts 
ADD COLUMN IF NOT EXISTS instrument_type TEXT DEFAULT 'Forex';

-- Add instrument_type column to evaluations
ALTER TABLE public.evaluations 
ADD COLUMN IF NOT EXISTS instrument_type TEXT DEFAULT 'Forex';

