
-- Create storage bucket for playbook documentation files
INSERT INTO storage.buckets (id, name, public) VALUES ('playbook-files', 'playbook-files', true);

-- Storage policies for playbook files
CREATE POLICY "Users can upload playbook files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'playbook-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view playbook files"
ON storage.objects FOR SELECT
USING (bucket_id = 'playbook-files');

CREATE POLICY "Users can delete their playbook files"
ON storage.objects FOR DELETE
USING (bucket_id = 'playbook-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Update playbooks table: add documentation_notes column, remove entry/exit rule columns
ALTER TABLE public.playbooks
  ADD COLUMN documentation_notes TEXT,
  ADD COLUMN file_urls TEXT[] DEFAULT '{}',
  DROP COLUMN IF EXISTS entry_rules,
  DROP COLUMN IF EXISTS exit_rules,
  DROP COLUMN IF EXISTS time_window_start,
  DROP COLUMN IF EXISTS time_window_end,
  DROP COLUMN IF EXISTS session,
  DROP COLUMN IF EXISTS screenshots;

-- Create playbook_setups table
CREATE TABLE public.playbook_setups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  playbook_id UUID NOT NULL REFERENCES public.playbooks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.playbook_setups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own setups"
ON public.playbook_setups FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own setups"
ON public.playbook_setups FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own setups"
ON public.playbook_setups FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own setups"
ON public.playbook_setups FOR DELETE
USING (auth.uid() = user_id);

CREATE TRIGGER update_playbook_setups_updated_at
BEFORE UPDATE ON public.playbook_setups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add setup_id to trades table for linking
ALTER TABLE public.trades
  ADD COLUMN setup_id UUID REFERENCES public.playbook_setups(id) ON DELETE SET NULL;
