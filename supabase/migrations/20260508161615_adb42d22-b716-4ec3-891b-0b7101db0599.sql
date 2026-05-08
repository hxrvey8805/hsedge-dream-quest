
-- 1. Restrict waitlist_signups SELECT - remove broad authenticated read
DROP POLICY IF EXISTS "Authenticated users can view waitlist" ON public.waitlist_signups;

-- 2. Add UPDATE policy for playbook-files (owner-scoped)
CREATE POLICY "Users can update their playbook files"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'playbook-files' AND (auth.uid())::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'playbook-files' AND (auth.uid())::text = (storage.foldername(name))[1]);

-- 3. Restrict public-bucket SELECT to authenticated users (prevents anon listing)
DROP POLICY IF EXISTS "Users can view playbook files" ON storage.objects;
CREATE POLICY "Authenticated users can view playbook files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'playbook-files');

DROP POLICY IF EXISTS "Users can view their review screenshots" ON storage.objects;
CREATE POLICY "Authenticated users can view review screenshots"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'review-screenshots');

-- 4. Revoke EXECUTE on SECURITY DEFINER helper functions from anon/authenticated
REVOKE EXECUTE ON FUNCTION public.find_room_by_invite_code(text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.is_room_creator(uuid, uuid) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.is_room_member(uuid, uuid) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_profile() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, public;
