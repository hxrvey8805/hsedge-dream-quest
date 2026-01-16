import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PriceDataRequest {
  symbol: string;
  startDate: string;
  endDate: string;
  interval?: string;
}

interface OHLCData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

// Map common trading platform symbols to Twelve Data symbols
const symbolMappings: Record<string, string> = {
  // Indices - common names to Twelve Data symbols
  "NAS100": "NDX",
  "NASDAQ": "NDX", 
  "NASDAQ100": "NDX",
  "US100": "NDX",
  "USTEC": "NDX",
  "US30": "DJI",
  "DJ30": "DJI",
  "DOW": "DJI",
  "DOW30": "DJI",
  "US500": "SPX",
  "SPX500": "SPX",
  "SP500": "SPX",
  "UK100": "FTSE",
  "FTSE100": "FTSE",
  "GER40": "DAX",
  "GER30": "DAX",
  "DE40": "DAX",
  "DE30": "DAX",
  "JPN225": "N225",
  "NIKKEI": "N225",
  "JP225": "N225",
  "AUS200": "AXJO",
  "HK50": "HSI",
  "HANGSENG": "HSI",
  "FRA40": "FCHI",
  "CAC40": "FCHI",
  // Commodities
  "XAUUSD": "XAU/USD",
  "GOLD": "XAU/USD",
  "XAGUSD": "XAG/USD",
  "SILVER": "XAG/USD",
  "XTIUSD": "WTI/USD",
  "USOIL": "WTI/USD",
  "CRUDEOIL": "WTI/USD",
  "WTIUSD": "WTI/USD",
  "XBRUSD": "BRENT/USD",
  "UKOIL": "BRENT/USD",
  "BRENTUSD": "BRENT/USD",
  "XNGUSD": "NG/USD",
  "NATGAS": "NG/USD",
};

function normalizeSymbol(symbol: string): string {
  // Remove common separators and standardize
  let normalized = symbol.toUpperCase().replace(/[\/\-_\s]/g, "");
  
  // Check direct mappings first
  if (symbolMappings[normalized]) {
    return symbolMappings[normalized];
  }
  
  // Forex pairs - add slash between currencies
  const forexPairs = ["EURUSD", "GBPUSD", "USDJPY", "USDCHF", "AUDUSD", "USDCAD", "NZDUSD", 
    "EURGBP", "EURJPY", "GBPJPY", "AUDJPY", "EURCHF", "GBPCHF", "AUDNZD", "EURAUD",
    "EURNZD", "AUDCAD", "GBPAUD", "GBPCAD", "GBPNZD", "AUDCHF", "CADJPY", "CHFJPY",
    "NZDJPY", "CADCHF", "NZDCAD", "NZDCHF"];
  
  for (const pair of forexPairs) {
    if (normalized === pair) {
      return `${pair.substring(0, 3)}/${pair.substring(3)}`;
    }
  }
  
  // Crypto pairs - check if it ends with common quote currencies
  const cryptoQuotes = ["USD", "USDT", "BTC", "ETH", "EUR", "GBP"];
  for (const quote of cryptoQuotes) {
    if (normalized.endsWith(quote) && normalized.length > quote.length) {
      const base = normalized.substring(0, normalized.length - quote.length);
      return `${base}/${quote}`;
    }
  }
  
  // Return as-is for stocks and other assets
  return symbol.toUpperCase();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("TWELVE_DATA_API_KEY");
    if (!apiKey) {
      throw new Error("TWELVE_DATA_API_KEY not configured");
    }

    const { symbol, startDate, endDate, interval = "15min" }: PriceDataRequest = await req.json();
    
    if (!symbol || !startDate || !endDate) {
      throw new Error("Missing required parameters: symbol, startDate, endDate");
    }

    const normalizedSymbol = normalizeSymbol(symbol);
    console.log(`Fetching price data for ${normalizedSymbol} from ${startDate} to ${endDate}`);

    // Calculate output size based on date range and interval
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    
    // Estimate candles needed based on interval
    let candlesPerHour = 4; // default 15min
    if (interval === "1min") candlesPerHour = 60;
    else if (interval === "5min") candlesPerHour = 12;
    else if (interval === "30min") candlesPerHour = 2;
    else if (interval === "1h") candlesPerHour = 1;
    else if (interval === "1day") candlesPerHour = 1/24;
    
    const outputSize = Math.min(Math.max(Math.ceil(diffHours * candlesPerHour) + 50, 100), 5000);

    const url = new URL("https://api.twelvedata.com/time_series");
    url.searchParams.set("symbol", normalizedSymbol);
    url.searchParams.set("interval", interval);
    url.searchParams.set("start_date", startDate);
    url.searchParams.set("end_date", endDate);
    url.searchParams.set("outputsize", outputSize.toString());
    url.searchParams.set("apikey", apiKey);
    url.searchParams.set("format", "JSON");

    console.log(`Calling Twelve Data API: ${url.toString().replace(apiKey, "***")}`);

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.status === "error") {
      console.error("Twelve Data API error:", data.message);
      throw new Error(data.message || "Failed to fetch price data");
    }

    if (!data.values || !Array.isArray(data.values)) {
      console.error("Unexpected API response:", JSON.stringify(data));
      throw new Error("No price data available for this symbol/date range");
    }

    // Transform to OHLC format and reverse to chronological order
    const ohlcData: OHLCData[] = data.values
      .map((candle: any) => ({
        time: candle.datetime,
        open: parseFloat(candle.open),
        high: parseFloat(candle.high),
        low: parseFloat(candle.low),
        close: parseFloat(candle.close),
      }))
      .reverse();

    console.log(`Returning ${ohlcData.length} candles`);

    return new Response(
      JSON.stringify({
        symbol: normalizedSymbol,
        interval,
        data: ohlcData,
        meta: data.meta,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in fetch-price-data:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
