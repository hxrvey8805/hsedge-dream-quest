import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Info, CheckCircle2, AlertTriangle, X, Loader2 } from "lucide-react";
import { parseTradesFromCSV, ParsedTrade, calculateTradePnL, TRADES_CSV_EXAMPLE } from "@/lib/tradesCsvParser";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useStrategies } from "@/hooks/useStrategies";

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
  const [csvText, setCsvText] = useState("");
  const [parsedTrades, setParsedTrades] = useState<ParsedTrade[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [step, setStep] = useState<'upload' | 'preview' | 'importing'>('upload');
  const [importProgress, setImportProgress] = useState(0);
  const [selectedStrategy, setSelectedStrategy] = useState<string>("none");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { strategies } = useStrategies();

  const resetState = () => {
    setCsvText("");
    setParsedTrades([]);
    setErrors([]);
    setWarnings([]);
    setStep('upload');
    setImportProgress(0);
    setSelectedStrategy("none");
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
      setStep('preview');
    }
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

      const tradesToInsert = parsedTrades.map(trade => {
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
          session: trade.session,
          strategy_type: selectedStrategy !== "none" ? selectedStrategy : trade.strategy_type,
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
            {step === 'preview' && `Preview ${parsedTrades.length} Trades`}
            {step === 'importing' && 'Importing Trades...'}
          </DialogTitle>
          <DialogDescription>
            {step === 'upload' && 'Upload a CSV file or paste trade data to bulk import trades.'}
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

        {step === 'preview' && (
          <div className="space-y-4">
            {warnings.length > 0 && (
              <Alert className="border-yellow-500/30 bg-yellow-500/10">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <AlertDescription className="text-yellow-500">
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

            {/* Strategy selector for all trades */}
            <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
              <Label className="text-sm font-medium whitespace-nowrap">Apply Strategy to all trades:</Label>
              <Select value={selectedStrategy} onValueChange={setSelectedStrategy}>
                <SelectTrigger className="w-[200px] bg-background">
                  <SelectValue placeholder="Select strategy..." />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  <SelectItem value="none">None (use CSV value)</SelectItem>
                  {strategies.map((strategy) => (
                    <SelectItem key={strategy.id} value={strategy.name}>
                      {strategy.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <ScrollArea className="h-[400px] rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Direction</TableHead>
                    <TableHead>Asset</TableHead>
                    <TableHead className="text-right">Entry</TableHead>
                    <TableHead className="text-right">Exit</TableHead>
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
                        <TableCell className="text-muted-foreground">{trade.asset_class}</TableCell>
                        <TableCell className="text-right font-mono text-xs">
                          {trade.entry_price?.toFixed(4) || '-'}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs">
                          {trade.exit_price?.toFixed(4) || '-'}
                        </TableCell>
                        <TableCell className={`text-right font-mono text-xs ${
                          profit > 0 ? 'text-green-400' : profit < 0 ? 'text-red-400' : ''
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
              <Button variant="outline" onClick={() => setStep('upload')}>
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
