-- Add timezone column to user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/New_York';