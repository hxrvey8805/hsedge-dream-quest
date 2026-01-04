-- Add account linking columns to trades table
ALTER TABLE public.trades 
ADD COLUMN IF NOT EXISTS account_id uuid,
ADD COLUMN IF NOT EXISTS account_type text;

-- Add index for faster filtering
CREATE INDEX IF NOT EXISTS idx_trades_account ON public.trades(account_id, account_type);