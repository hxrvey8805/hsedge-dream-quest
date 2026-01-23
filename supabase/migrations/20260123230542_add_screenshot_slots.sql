-- Add screenshot_slots column to trade_review_slides table
ALTER TABLE public.trade_review_slides 
ADD COLUMN IF NOT EXISTS screenshot_slots JSONB DEFAULT '[]'::jsonb;
