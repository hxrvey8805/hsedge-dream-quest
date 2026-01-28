-- Add import_batch_id column to track CSV imports
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS import_batch_id uuid DEFAULT NULL;

-- Create an index for faster querying by batch
CREATE INDEX IF NOT EXISTS idx_trades_import_batch_id ON public.trades(import_batch_id);