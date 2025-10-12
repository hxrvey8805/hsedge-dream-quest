-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trades table
CREATE TABLE public.trades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  trade_date DATE NOT NULL,
  day_of_week TEXT,
  pair TEXT NOT NULL,
  time_opened TIME,
  time_closed TIME,
  duration TEXT,
  buy_sell TEXT NOT NULL,
  session TEXT,
  strategy_type TEXT,
  entry_type TEXT,
  entry_timeframe TEXT,
  risk_to_pay DECIMAL(10, 2),
  total_pips_secured DECIMAL(10, 2),
  max_drawdown_pips DECIMAL(10, 2),
  pips DECIMAL(10, 2),
  original_take_profit_percent DECIMAL(5, 2),
  outcome TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own trades"
ON public.trades
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own trades"
ON public.trades
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trades"
ON public.trades
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trades"
ON public.trades
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_trades_updated_at
BEFORE UPDATE ON public.trades
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();