-- Add profit column to trades table
ALTER TABLE public.trades 
ADD COLUMN profit numeric;