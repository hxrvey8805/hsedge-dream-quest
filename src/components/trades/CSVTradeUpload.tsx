import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, Info, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { parseTradesFromCSV, ParsedTrade, calculateTradePnL, TRADES_CSV_EXAMPLE } from "@/lib/tradesCsvParser";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useStrategies } from "@/hooks/useStrategies";
import { useUserTimezone } from "@/hooks/useUserTimezone";
import { detectSession, TradingSession } from "@/lib/sessionDetection";

const ALL_SESSIONS = ["Premarket", "Asia", "London", "New York", "NYSE", "FOMC/News"] as const;
const DETECTABLE_SESSIONS: TradingSession[] = ["Premarket", "Asia", "London", "New York"];

interface CSVTradeUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedAccountId?: string | null;
  accountType?: string | null;
  onSuccess?: () => void;
}

export const CSVTradeUpload = ({ 
  open, 
  onOpenChange, 
  selectedAccountId,
  accountType,
  onSuccess 
}: CSVTradeUploadProps) => {
  const { strategies } = useStrategies();
  const { timezone } = useUserTimezone();
  const [csvText, setCsvText] = useState("");
  const [parsedTrades, setParsedTrades] = useState<ParsedTrade[]>([]);
  const [tradeStrategies, setTradeStrategies] = useState<Record<number, string>>({});
  const [tradeSessions, setTradeSessions] = useState<Record<number, string>>({});
  const [selectedSessions, setSelectedSessions] = useState<TradingSession[]>(DETECTABLE_SESSIONS);
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [step, setStep] = useState<'upload' | 'session-select' | 'preview' | 'importing'>('upload');
  const [importProgress, setImportProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setCsvText("");
    setParsedTrades([]);
    setTradeStrategies({});
    setTradeSessions({});
    setSelectedSessions(DETECTABLE_SESSIONS);
    setErrors([]);
    setWarnings([]);
    setStep('upload');
    setImportProgress(0);
  };

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  const handleParse = () => {
    setErrors([]);
    setWarnings([]);

    if (!csvText.trim()) {
      setErrors(["Please paste or upload CSV data"]);
      return;
    }

    const result = parseTradesFromCSV(csvText);
    
    setErrors(result.errors);
    setWarnings(result.warnings);

    if (result.data.length > 0) {
      setParsedTrades(result.data);
      // Go to session selection step
      setStep('session-select');
    }
  };

  const handleSessionSelectionContinue = () => {
    // Auto-detect sessions for all trades based on time_opened and selected sessions
    const autoDetectedSessions: Record<number, string> = {};
    parsedTrades.forEach((trade, index) => {
      // Only auto-detect if trade doesn't already have a session
      if (!trade.session && trade.time_opened) {
        const detectedSession = detectSession(trade.time_opened, timezone, selectedSessions);
        if (detectedSession) {
          autoDetectedSessions[index] = detectedSession;
        }
      }
    });
    setTradeSessions(autoDetectedSessions);
    setStep('preview');
  };

  const toggleSessionSelection = (session: TradingSession) => {
    setSelectedSessions(prev => 
      prev.includes(session)
        ? prev.filter(s => s !== session)
        : [...prev, session]
    );
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCsvText(content);
      setErrors([]);
      setWarnings([]);
    };
    reader.onerror = () => {
      setErrors(["Failed to read file"]);
    };
    reader.readAsText(file);
  };

  const handleLoadExample = () => {
    setCsvText(TRADES_CSV_EXAMPLE);
    setErrors([]);
    setWarnings([]);
  };

  const handleImport = async () => {
    setStep('importing');
    setImportProgress(0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const tradesToInsert = parsedTrades.map((trade, index) => {
        const { pips, profit, outcome } = calculateTradePnL(trade);
        
        // Calculate R:R if stop loss exists
        let rrRatio = null;
        if (trade.entry_price && trade.exit_price && trade.stop_loss) {
          const riskAmount = Math.abs(trade.entry_price - trade.stop_loss);
          const rewardAmount = Math.abs(trade.exit_price - trade.entry_price);
          if (riskAmount > 0) {
            rrRatio = `1:${(rewardAmount / riskAmount).toFixed(2)}`;
          }
        }

        return {
          user_id: user.id,
          trade_date: trade.trade_date,
          day_of_week: new Date(trade.trade_date).toLocaleDateString('en-US', { weekday: 'long' }),
          symbol: trade.symbol,
          asset_class: trade.asset_class,
          pair: trade.symbol,
          buy_sell: trade.buy_sell,
          entry_price: trade.entry_price,
          exit_price: trade.exit_price,
          stop_loss: trade.stop_loss,
          size: trade.size,
          fees: trade.fees,
          time_opened: trade.time_opened,
          time_closed: trade.time_closed,
          session: tradeSessions[index] || trade.session,
          strategy_type: tradeStrategies[index] || trade.strategy_type,
          entry_timeframe: trade.entry_timeframe,
          notes: trade.notes,
          pips,
          profit,
          outcome,
          risk_reward_ratio: rrRatio,
          account_id: selectedAccountId || null,
          account_type: accountType || null,
        };
      });

      // Insert in batches of 50
      const batchSize = 50;
      let inserted = 0;

      for (let i = 0; i < tradesToInsert.length; i += batchSize) {
        const batch = tradesToInsert.slice(i, i + batchSize);
        const { error } = await supabase.from("trades").insert(batch);
        
        if (error) throw error;
        
        inserted += batch.length;
        setImportProgress(Math.round((inserted / tradesToInsert.length) * 100));
      }

      toast.success(`Successfully imported ${tradesToInsert.length} trades!`);
      handleClose();
      onSuccess?.();
    } catch (error: any) {
      console.error('Import error:', error);
      setErrors([`Import failed: ${error.message}`]);
      setStep('preview');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {step === 'upload' && 'Import Trades from CSV'}
            {step === 'session-select' && 'Select Your Trading Sessions'}
            {step === 'preview' && `Preview ${parsedTrades.length} Trades`}
            {step === 'importing' && 'Importing Trades...'}
          </DialogTitle>
          <DialogDescription>
            {step === 'upload' && 'Upload a CSV file or paste trade data to bulk import trades.'}
            {step === 'session-select' && 'Choose which sessions you trade so we can auto-assign them to your trades.'}
            {step === 'preview' && 'Review the parsed trades before importing.'}
            {step === 'importing' && 'Please wait while your trades are being imported.'}
          </DialogDescription>
        </DialogHeader>

        {step === 'upload' && (
          <div className="space-y-4">
            <Alert className="bg-muted/50 border-muted">
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Required columns:</strong> trade_date, symbol, buy_sell<br />
                <strong>Optional:</strong> asset_class, entry_price, exit_price, stop_loss, size, fees, session, strategy_type, notes
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="gap-2"
              >
                <Upload className="w-4 h-4" />
                Upload CSV
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLoadExample}
                className="gap-2"
              >
                <FileText className="w-4 h-4" />
                Load Example
              </Button>
            </div>

            <Textarea
              value={csvText}
              onChange={(e) => {
                setCsvText(e.target.value);
                setErrors([]);
              }}
              placeholder={`Paste CSV data here...

Required columns: trade_date, symbol, buy_sell

Example:
trade_date,symbol,buy_sell,asset_class,entry_price,exit_price,size
2024-01-15,EURUSD,Buy,Forex,1.0850,1.0920,0.5`}
              className="h-48 font-mono text-xs"
            />

            {errors.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc pl-4">
                    {errors.slice(0, 5).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                    {errors.length > 5 && <li>...and {errors.length - 5} more errors</li>}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <Button onClick={handleParse} className="w-full">
              Parse & Preview
            </Button>
          </div>
        )}

        {step === 'session-select' && (
          <div className="space-y-6">
            <Alert className="bg-muted/50 border-muted">
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Select the sessions you actively trade. We'll only auto-assign trades to these sessions based on their time.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 gap-3">
              {DETECTABLE_SESSIONS.map((session) => (
                <button
                  key={session}
                  type="button"
                  onClick={() => toggleSessionSelection(session)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedSessions.includes(session)
                      ? 'border-primary bg-primary/10'
                      : 'border-muted hover:border-muted-foreground/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      selectedSessions.includes(session)
                        ? 'border-primary bg-primary'
                        : 'border-muted-foreground/50'
                    }`}>
                      {selectedSessions.includes(session) && (
                        <CheckCircle2 className="w-3 h-3 text-primary-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{session}</p>
                      <p className="text-xs text-muted-foreground">
                        {session === "Premarket" && "Before 09:30"}
                        {session === "New York" && "09:30 - 16:00"}
                        {session === "London" && "03:00 - 10:00"}
                        {session === "Asia" && "23:00 - 06:00"}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {selectedSessions.length === 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Please select at least one session to continue.
                </AlertDescription>
              </Alert>
            )}

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setStep('upload')}>
                Back
              </Button>
              <Button 
                onClick={handleSessionSelectionContinue} 
                disabled={selectedSessions.length === 0}
                className="gap-2"
              >
                Continue to Preview
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-4">
            {warnings.length > 0 && (
              <Alert className="bg-yellow-500/10 border-yellow-500/30">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <AlertDescription className="text-yellow-400">
                  {warnings.length} warning(s) - trades will still import
                </AlertDescription>
              </Alert>
            )}

            {errors.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {errors.length} row(s) skipped due to errors
                </AlertDescription>
              </Alert>
            )}

            <ScrollArea className="h-[400px] rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Direction</TableHead>
                    <TableHead>Strategy</TableHead>
                    <TableHead>Session</TableHead>
                    <TableHead className="text-right">P&L</TableHead>
                    <TableHead>Outcome</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedTrades.map((trade, idx) => {
                    const { profit, outcome } = calculateTradePnL(trade);
                    return (
                      <TableRow key={idx}>
                        <TableCell className="font-mono text-xs">{trade.trade_date}</TableCell>
                        <TableCell className="font-medium">{trade.symbol}</TableCell>
                        <TableCell>
                          <Badge variant={trade.buy_sell === 'Buy' ? 'default' : 'secondary'}>
                            {trade.buy_sell}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={tradeStrategies[idx] || trade.strategy_type || "none"}
                            onValueChange={(value) => 
                              setTradeStrategies(prev => ({ ...prev, [idx]: value === "none" ? "" : value }))
                            }
                          >
                            <SelectTrigger className="h-8 w-[140px] text-xs">
                              <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                            <SelectContent className="bg-popover z-50">
                              <SelectItem value="none">None</SelectItem>
                              {strategies.map((s) => (
                                <SelectItem key={s.id} value={s.name}>
                                  {s.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={tradeSessions[idx] || trade.session || "none"}
                            onValueChange={(value) =>
                              setTradeSessions(prev => ({ ...prev, [idx]: value === "none" ? "" : value }))
                            }
                          >
                            <SelectTrigger className="h-8 w-[130px] text-xs">
                              <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                            <SelectContent className="bg-popover z-50">
                              <SelectItem value="none">None</SelectItem>
                              {ALL_SESSIONS.map((session) => (
                                <SelectItem key={session} value={session}>
                                  {session}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className={`text-right font-mono text-xs ${
                          profit > 0 ? 'text-success' : profit < 0 ? 'text-destructive' : ''
                        }`}>
                          {profit !== 0 ? `$${profit.toFixed(2)}` : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            outcome === 'Win' ? 'default' : 
                            outcome === 'Loss' ? 'destructive' : 'secondary'
                          }>
                            {outcome}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </ScrollArea>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setStep('session-select')}>
                Back
              </Button>
              <Button onClick={handleImport} className="gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Import {parsedTrades.length} Trades
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === 'importing' && (
          <div className="py-12 flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <div className="text-center">
              <p className="text-lg font-medium">{importProgress}%</p>
              <p className="text-muted-foreground">Importing trades...</p>
            </div>
            <div className="w-full max-w-xs bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${importProgress}%` }}
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
