-- Add missed_opportunities_screenshots column to daily_reviews table
ALTER TABLE public.daily_reviews 
ADD COLUMN missed_opportunities_screenshots text[] DEFAULT NULL;