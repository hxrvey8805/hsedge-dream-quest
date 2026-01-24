-- Add screenshot_slots column to store multiple timeframe screenshots per trade slide
ALTER TABLE public.trade_review_slides 
ADD COLUMN screenshot_slots jsonb DEFAULT '[]'::jsonb;