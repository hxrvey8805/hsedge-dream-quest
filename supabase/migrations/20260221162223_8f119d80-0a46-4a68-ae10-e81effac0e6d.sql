
-- Create playbooks table
CREATE TABLE public.playbooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  entry_rules TEXT,
  exit_rules TEXT,
  time_window_start TEXT,
  time_window_end TEXT,
  session TEXT,
  screenshots TEXT[] DEFAULT '{}',
  is_purchased BOOLEAN NOT NULL DEFAULT false,
  purchased_playbook_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.playbooks ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own playbooks"
ON public.playbooks FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own playbooks"
ON public.playbooks FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own playbooks"
ON public.playbooks FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own playbooks"
ON public.playbooks FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_playbooks_updated_at
BEFORE UPDATE ON public.playbooks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
