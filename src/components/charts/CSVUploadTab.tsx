import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, Info, CheckCircle2 } from "lucide-react";
import { parseOHLCFromCSV, ParsedOHLC, CSV_EXAMPLE } from "@/lib/csvParser";

interface CSVUploadTabProps {
  onDataParsed: (data: ParsedOHLC[]) => void;
}

export const CSVUploadTab = ({ onDataParsed }: CSVUploadTabProps) => {
  const [csvText, setCsvText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleParse = () => {
    setError(null);
    setSuccess(false);

    if (!csvText.trim()) {
      setError("Please paste or upload CSV data");
      return;
    }

    const result = parseOHLCFromCSV(csvText);
    
    if (result.error) {
      setError(result.error);
      return;
    }

    if (result.data.length === 0) {
      setError("No valid data rows found");
      return;
    }

    setSuccess(true);
    onDataParsed(result.data);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCsvText(content);
      setError(null);
      setSuccess(false);
    };
    reader.onerror = () => {
      setError("Failed to read file");
    };
    reader.readAsText(file);
  };

  const handleLoadExample = () => {
    setCsvText(CSV_EXAMPLE);
    setError(null);
    setSuccess(false);
  };

  return (
    <div className="space-y-4">
      <Alert className="bg-muted/50 border-muted">
        <Info className="h-4 w-4" />
        <AlertDescription className="text-sm">
          <strong>Export from TradingView:</strong> Right-click chart → Export Chart Data → 
          Copy the OHLC columns and paste below. Supports futures, CFDs, and any symbol.
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
          setError(null);
          setSuccess(false);
        }}
        placeholder={`Paste CSV data here...\n\nRequired columns: time (or date), open, high, low, close\n\nExample:\ntime,open,high,low,close\n2024-01-15 09:30:00,4520.25,4525.50,4518.00,4523.75`}
        className="h-40 font-mono text-xs"
      />

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-500/10 border-green-500/30 text-green-400">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>Data parsed successfully! Chart updated.</AlertDescription>
        </Alert>
      )}

      <Button onClick={handleParse} className="w-full">
        Parse & Display Chart
      </Button>
    </div>
  );
};
