-- Add max_loss column to evaluations table
ALTER TABLE public.evaluations 
ADD COLUMN max_loss numeric NOT NULL DEFAULT 0;

-- Add max_loss column to funded_accounts table
ALTER TABLE public.funded_accounts 
ADD COLUMN max_loss numeric NOT NULL DEFAULT 0;