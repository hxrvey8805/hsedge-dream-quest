
-- Fix infinite recursion: create a security definer function to check membership
CREATE OR REPLACE FUNCTION public.is_room_member(_user_id UUID, _room_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.room_members
    WHERE room_id = _room_id AND user_id = _user_id AND status = 'approved'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_room_creator(_user_id UUID, _room_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.trading_rooms
    WHERE id = _room_id AND creator_id = _user_id
  );
$$;

-- Drop old policies
DROP POLICY IF EXISTS "View rooms user belongs to" ON public.trading_rooms;
DROP POLICY IF EXISTS "View room members" ON public.room_members;
DROP POLICY IF EXISTS "View races" ON public.room_races;

-- Recreate without recursion
CREATE POLICY "View rooms user belongs to" ON public.trading_rooms
  FOR SELECT TO authenticated
  USING (
    creator_id = auth.uid() OR public.is_room_member(auth.uid(), id)
  );

CREATE POLICY "View room members" ON public.room_members
  FOR SELECT TO authenticated
  USING (
    public.is_room_member(auth.uid(), room_id) OR public.is_room_creator(auth.uid(), room_id)
  );

CREATE POLICY "View races" ON public.room_races
  FOR SELECT TO authenticated
  USING (
    public.is_room_member(auth.uid(), room_id) OR public.is_room_creator(auth.uid(), room_id)
  );
