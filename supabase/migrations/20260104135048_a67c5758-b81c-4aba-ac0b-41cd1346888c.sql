-- Create backtesting_sessions table
CREATE TABLE public.backtesting_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_name TEXT NOT NULL,
  description TEXT,
  strategy_id UUID,
  starting_balance NUMERIC NOT NULL DEFAULT 10000,
  running_pl NUMERIC NOT NULL DEFAULT 0,
  date_range_start DATE,
  date_range_end DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.backtesting_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own backtesting sessions"
ON public.backtesting_sessions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own backtesting sessions"
ON public.backtesting_sessions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own backtesting sessions"
ON public.backtesting_sessions
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own backtesting sessions"
ON public.backtesting_sessions
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_backtesting_sessions_updated_at
BEFORE UPDATE ON public.backtesting_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();