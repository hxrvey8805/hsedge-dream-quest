import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CandlestickChart } from "@/components/charts/CandlestickChart";
import { CSVUploadTab } from "@/components/charts/CSVUploadTab";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, TrendingUp, TrendingDown, AlertCircle, Database, FileSpreadsheet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ParsedOHLC } from "@/lib/csvParser";

interface Trade {
  id: string;
  symbol?: string;
  pair?: string;
  entry_price?: number;
  exit_price?: number;
  stop_loss?: number;
  time_opened?: string;
  time_closed?: string;
  trade_date: string;
  buy_sell: string;
  outcome: string;
  pips?: number;
  profit?: number;
}

interface TradeChartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trade: Trade | null;
}

interface OHLCData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

// Symbols that are mapped to ETF proxies (prices won't match)
const ETF_PROXY_SYMBOLS = [
  "NAS100", "NASDAQ", "NASDAQ100", "US100", "USTEC", "NDX",
  "US30", "DJ30", "DOW", "DOW30", "DJI",
  "US500", "SPX500", "SP500", "SPX",
  "UK100", "FTSE100", "FTSE",
  "GER40", "GER30", "DE40", "DE30", "DAX",
  "JPN225", "NIKKEI", "JP225", "N225",
  "AUS200", "AXJO", "HK50", "HANGSENG", "HSI",
  "FRA40", "CAC40", "FCHI",
  "XAUUSD", "GOLD", "XAGUSD", "SILVER",
  "XTIUSD", "USOIL", "CRUDEOIL", "WTIUSD",
  "XBRUSD", "UKOIL", "BRENTUSD", "XNGUSD", "NATGAS",
];

export const TradeChartDialog = ({ open, onOpenChange, trade }: TradeChartDialogProps) => {
  const [priceData, setPriceData] = useState<OHLCData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [interval, setInterval] = useState("15min");
  const [dataSource, setDataSource] = useState<"api" | "csv">("api");
  const [csvData, setCsvData] = useState<ParsedOHLC[]>([]);

  const fetchPriceData = async () => {
    if (!trade) return;

    const symbol = trade.symbol || trade.pair;
    if (!symbol) {
      setError("No symbol found for this trade");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Calculate date range - 4 hours before entry to 4 hours after exit
      const tradeDate = trade.trade_date;
      const entryTime = trade.time_opened || "09:00:00";
      const exitTime = trade.time_closed || "17:00:00";

      const entryDateTime = new Date(`${tradeDate}T${entryTime}`);
      const exitDateTime = new Date(`${tradeDate}T${exitTime}`);

      // Extend range for context
      const startDate = new Date(entryDateTime.getTime() - 4 * 60 * 60 * 1000);
      const endDate = new Date(exitDateTime.getTime() + 4 * 60 * 60 * 1000);

      const { data, error: fetchError } = await supabase.functions.invoke("fetch-price-data", {
        body: {
          symbol,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          interval,
        },
      });

      if (fetchError) throw fetchError;
      if (data.error) throw new Error(data.error);

      if (data.data && data.data.length > 0) {
        setPriceData(data.data);
      } else {
        setError("No price data available for this symbol/date");
      }
    } catch (err: any) {
      console.error("Error fetching price data:", err);
      setError(err.message || "Failed to fetch price data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && trade && dataSource === "api") {
      fetchPriceData();
    }
  }, [open, trade, interval, dataSource]);

  const handleCSVData = (data: ParsedOHLC[]) => {
    setCsvData(data);
    setPriceData(data);
    setError(null);
  };

  // Get the active data based on source
  const activeData = dataSource === "csv" ? csvData : priceData;

  const symbol = trade?.symbol || trade?.pair || "Unknown";
  const isWin = trade?.outcome === "Win";
  const isBuy = trade?.buy_sell === "Buy";
  
  // Check if this symbol uses an ETF proxy (prices won't match)
  const isProxySymbol = ETF_PROXY_SYMBOLS.includes(symbol.toUpperCase().replace(/[\/\-_\s]/g, ""));

  // For CSV data, always show trade markers (user provides matching data)
  // For API data, hide markers for proxy symbols (prices don't match)
  const showTradeMarkers = dataSource === "csv" || !isProxySymbol;
  
  const tradeMarker = trade?.entry_price && showTradeMarkers ? {
    entryTime: `${trade.trade_date}T${trade.time_opened || "09:00:00"}`,
    entryPrice: trade.entry_price,
    exitTime: trade.time_closed ? `${trade.trade_date}T${trade.time_closed}` : undefined,
    exitPrice: trade.exit_price || undefined,
    stopLoss: trade.stop_loss || undefined,
    isWin,
    isBuy,
  } : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>Trade Chart: {symbol}</span>
            <Badge variant={isWin ? "default" : "destructive"} className="ml-2">
              {isBuy ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {trade?.buy_sell} - {trade?.outcome}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={dataSource} onValueChange={(v) => setDataSource(v as "api" | "csv")} className="flex-1 flex flex-col min-h-0">
          <TabsList className="w-fit">
            <TabsTrigger value="api" className="gap-2">
              <Database className="w-4 h-4" />
              API Data
            </TabsTrigger>
            <TabsTrigger value="csv" className="gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              Upload CSV
            </TabsTrigger>
          </TabsList>

          <TabsContent value="api" className="flex-1 flex flex-col min-h-0 mt-4">
            <div className="flex items-center justify-between gap-4 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Timeframe:</span>
                <Select value={interval} onValueChange={setInterval}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1min">1m</SelectItem>
                    <SelectItem value="5min">5m</SelectItem>
                    <SelectItem value="15min">15m</SelectItem>
                    <SelectItem value="30min">30m</SelectItem>
                    <SelectItem value="1h">1h</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {trade && (
                <div className="flex items-center gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Entry: </span>
                    <span className="font-medium">{trade.entry_price?.toFixed(5) || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Exit: </span>
                    <span className="font-medium">{trade.exit_price?.toFixed(5) || "N/A"}</span>
                  </div>
                  {trade.stop_loss && (
                    <div>
                      <span className="text-muted-foreground">SL: </span>
                      <span className="font-medium text-destructive">{trade.stop_loss.toFixed(5)}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">P&L: </span>
                    <span className={`font-medium ${(trade.profit || 0) >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {trade.pips?.toFixed(1)} pips / ${trade.profit?.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1 min-h-[350px] relative">
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <span className="ml-2">Loading chart data...</span>
                </div>
              )}

              {error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 z-10">
                  <AlertCircle className="w-12 h-12 text-destructive mb-4" />
                  <p className="text-destructive font-medium">{error}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Try uploading CSV data from TradingView instead.
                  </p>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" onClick={fetchPriceData}>
                      Retry
                    </Button>
                    <Button variant="secondary" onClick={() => setDataSource("csv")}>
                      Upload CSV
                    </Button>
                  </div>
                </div>
              )}

              {!loading && !error && priceData.length > 0 && (
                <>
                  {isProxySymbol && (
                    <div className="absolute top-2 left-2 right-2 z-10">
                      <div className="bg-amber-500/20 border border-amber-500/50 text-amber-200 text-xs px-3 py-2 rounded-md">
                        <strong>Note:</strong> Using ETF proxy for {symbol}. For accurate prices, use the "Upload CSV" tab with data from TradingView.
                      </div>
                    </div>
                  )}
                  <CandlestickChart 
                    data={priceData} 
                    trade={tradeMarker}
                    height={350}
                  />
                </>
              )}

              {!loading && !error && priceData.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
                  <span>No chart data available from API</span>
                  <Button variant="secondary" size="sm" onClick={() => setDataSource("csv")}>
                    Upload CSV instead
                  </Button>
                </div>
              )}
            </div>

            <div className="text-xs text-muted-foreground text-center pt-2 border-t">
              Price data provided by Twelve Data{isProxySymbol ? " (ETF proxy)" : ""} • Date: {trade ? format(new Date(trade.trade_date), "PPP") : ""}
            </div>
          </TabsContent>

          <TabsContent value="csv" className="flex-1 flex flex-col min-h-0 mt-4">
            {csvData.length === 0 ? (
              <CSVUploadTab onDataParsed={handleCSVData} />
            ) : (
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between gap-4 pb-2">
                  {trade && (
                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Entry: </span>
                        <span className="font-medium">{trade.entry_price?.toFixed(5) || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Exit: </span>
                        <span className="font-medium">{trade.exit_price?.toFixed(5) || "N/A"}</span>
                      </div>
                      {trade.stop_loss && (
                        <div>
                          <span className="text-muted-foreground">SL: </span>
                          <span className="font-medium text-destructive">{trade.stop_loss.toFixed(5)}</span>
                        </div>
                      )}
                    </div>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setCsvData([])}
                  >
                    Upload Different Data
                  </Button>
                </div>

                <div className="flex-1 min-h-[350px]">
                  <CandlestickChart 
                    data={csvData} 
                    trade={tradeMarker}
                    height={350}
                  />
                </div>

                <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                  Chart from uploaded CSV data • {csvData.length} candles • Date: {trade ? format(new Date(trade.trade_date), "PPP") : ""}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
