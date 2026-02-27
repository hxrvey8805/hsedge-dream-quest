
-- Clean slate
DROP FUNCTION IF EXISTS public.find_room_by_invite_code(TEXT);
DROP TYPE IF EXISTS public.room_privacy_level;
DROP TYPE IF EXISTS public.room_access_mode;
DROP TYPE IF EXISTS public.room_member_status;

-- Trading rooms table
CREATE TABLE public.trading_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  privacy_level TEXT NOT NULL DEFAULT 'pnl_only',
  access_mode TEXT NOT NULL DEFAULT 'invite_code',
  invite_code TEXT NOT NULL DEFAULT substr(md5(random()::text), 1, 8),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Room members table
CREATE TABLE public.room_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.trading_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'approved',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(room_id, user_id)
);

-- Room races table
CREATE TABLE public.room_races (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.trading_rooms(id) ON DELETE CASCADE,
  created_by UUID NOT NULL,
  name TEXT NOT NULL DEFAULT 'Race',
  target_amount NUMERIC NOT NULL,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.trading_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_races ENABLE ROW LEVEL SECURITY;

-- Trading rooms policies
CREATE POLICY "View rooms user belongs to" ON public.trading_rooms
  FOR SELECT TO authenticated
  USING (
    creator_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.room_members WHERE room_id = trading_rooms.id AND user_id = auth.uid() AND status = 'approved')
  );
CREATE POLICY "Create rooms" ON public.trading_rooms FOR INSERT TO authenticated WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Update own rooms" ON public.trading_rooms FOR UPDATE TO authenticated USING (auth.uid() = creator_id);
CREATE POLICY "Delete own rooms" ON public.trading_rooms FOR DELETE TO authenticated USING (auth.uid() = creator_id);

-- Room members policies
CREATE POLICY "View room members" ON public.room_members
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.room_members rm WHERE rm.room_id = room_members.room_id AND rm.user_id = auth.uid() AND rm.status = 'approved')
    OR EXISTS (SELECT 1 FROM public.trading_rooms tr WHERE tr.id = room_members.room_id AND tr.creator_id = auth.uid())
  );
CREATE POLICY "Join rooms" ON public.room_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Creator manages members" ON public.room_members FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.trading_rooms WHERE id = room_members.room_id AND creator_id = auth.uid()));
CREATE POLICY "Leave rooms" ON public.room_members FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.trading_rooms WHERE id = room_members.room_id AND creator_id = auth.uid()));

-- Room races policies
CREATE POLICY "View races" ON public.room_races FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.room_members WHERE room_id = room_races.room_id AND user_id = auth.uid() AND status = 'approved')
    OR EXISTS (SELECT 1 FROM public.trading_rooms WHERE id = room_races.room_id AND creator_id = auth.uid())
  );
CREATE POLICY "Create races" ON public.room_races FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.trading_rooms WHERE id = room_races.room_id AND creator_id = auth.uid()));
CREATE POLICY "Update races" ON public.room_races FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.trading_rooms WHERE id = room_races.room_id AND creator_id = auth.uid()));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_races;

-- Lookup function for joining by invite code
CREATE OR REPLACE FUNCTION public.find_room_by_invite_code(code TEXT)
RETURNS TABLE(id UUID, name TEXT, description TEXT, privacy_level TEXT, access_mode TEXT, creator_id UUID)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT tr.id, tr.name, tr.description, tr.privacy_level, tr.access_mode, tr.creator_id
  FROM public.trading_rooms tr
  WHERE tr.invite_code = code AND tr.is_active = true;
$$;
