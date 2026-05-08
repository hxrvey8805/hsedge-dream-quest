
-- 1. Restrict achievements SELECT to authenticated users
DROP POLICY IF EXISTS "Anyone can view achievements" ON public.achievements;
CREATE POLICY "Authenticated users can view achievements"
  ON public.achievements FOR SELECT
  TO authenticated
  USING (true);

-- 2. Tighten waitlist insert RLS: replace WITH CHECK (true) with email format validation
DROP POLICY IF EXISTS "Anyone can sign up for waitlist" ON public.waitlist_signups;
CREATE POLICY "Valid email signups only"
  ON public.waitlist_signups FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    email IS NOT NULL
    AND length(email) <= 255
    AND email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  );
