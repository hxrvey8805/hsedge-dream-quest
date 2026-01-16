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
// Using ETFs for indices (free tier compatible) instead of actual indices which require paid plans
const symbolMappings: Record<string, string> = {
  // Indices - mapped to corresponding ETFs (free tier)
  "NAS100": "QQQ",      // Invesco QQQ Trust tracks NASDAQ 100
  "NASDAQ": "QQQ", 
  "NASDAQ100": "QQQ",
  "US100": "QQQ",
  "USTEC": "QQQ",
  "NDX": "QQQ",
  "US30": "DIA",        // SPDR Dow Jones ETF tracks Dow 30
  "DJ30": "DIA",
  "DOW": "DIA",
  "DOW30": "DIA",
  "DJI": "DIA",
  "US500": "SPY",       // SPDR S&P 500 ETF tracks S&P 500
  "SPX500": "SPY",
  "SP500": "SPY",
  "SPX": "SPY",
  "UK100": "EWU",       // iShares MSCI United Kingdom ETF
  "FTSE100": "EWU",
  "FTSE": "EWU",
  "GER40": "EWG",       // iShares MSCI Germany ETF
  "GER30": "EWG",
  "DE40": "EWG",
  "DE30": "EWG",
  "DAX": "EWG",
  "JPN225": "EWJ",      // iShares MSCI Japan ETF
  "NIKKEI": "EWJ",
  "JP225": "EWJ",
  "N225": "EWJ",
  "AUS200": "EWA",      // iShares MSCI Australia ETF
  "AXJO": "EWA",
  "HK50": "EWH",        // iShares MSCI Hong Kong ETF
  "HANGSENG": "EWH",
  "HSI": "EWH",
  "FRA40": "EWQ",       // iShares MSCI France ETF
  "CAC40": "EWQ",
  "FCHI": "EWQ",
  // Commodities - using ETFs
  "XAUUSD": "GLD",      // SPDR Gold Shares
  "GOLD": "GLD",
  "XAGUSD": "SLV",      // iShares Silver Trust
  "SILVER": "SLV",
  "XTIUSD": "USO",      // United States Oil Fund
  "USOIL": "USO",
  "CRUDEOIL": "USO",
  "WTIUSD": "USO",
  "XBRUSD": "BNO",      // United States Brent Oil Fund
  "UKOIL": "BNO",
  "BRENTUSD": "BNO",
  "XNGUSD": "UNG",      // United States Natural Gas Fund
  "NATGAS": "UNG",
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
