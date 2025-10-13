-- Add new columns for multi-asset support
ALTER TABLE public.trades
ADD COLUMN asset_class TEXT,
ADD COLUMN symbol TEXT,
ADD COLUMN entry_price NUMERIC,
ADD COLUMN exit_price NUMERIC,
ADD COLUMN stop_loss NUMERIC,
ADD COLUMN size NUMERIC,
ADD COLUMN fees NUMERIC,
ADD COLUMN risk_reward_ratio TEXT,
ADD COLUMN screenshots TEXT[];

-- Update pair column to be nullable since we'll use symbol instead
ALTER TABLE public.trades
ALTER COLUMN pair DROP NOT NULL;

-- Create index for faster queries
CREATE INDEX idx_trades_user_date ON public.trades(user_id, trade_date DESC);