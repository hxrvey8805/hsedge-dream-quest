import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

const DEFAULT_TIMEFRAMES = ["10S", "1M", "3M", "5M", "15M", "30M", "1H", "4H", "Daily"] as const;

interface TimeframeSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  triggerClassName?: string;
}

export const TimeframeSelect = ({ value, onValueChange, className, triggerClassName }: TimeframeSelectProps) => {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState("");

  // Check if current value is custom (not in defaults)
  const isCustomValue = value && !DEFAULT_TIMEFRAMES.includes(value as any);

  const handleSelectChange = (val: string) => {
    if (val === "__custom__") {
      setShowCustomInput(true);
      setCustomValue("");
    } else {
      setShowCustomInput(false);
      onValueChange(val);
    }
  };

  const submitCustom = () => {
    const trimmed = customValue.trim().toUpperCase();
    if (trimmed) {
      onValueChange(trimmed);
      setShowCustomInput(false);
      setCustomValue("");
    }
  };

  if (showCustomInput) {
    return (
      <div className={`flex gap-1.5 ${className || ""}`}>
        <Input
          placeholder="e.g. 2M, 8H, Weekly"
          value={customValue}
          onChange={(e) => setCustomValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submitCustom()}
          className="flex-1 h-9 text-sm"
          autoFocus
        />
        <Button size="icon" variant="ghost" className="h-9 w-9 shrink-0" onClick={submitCustom}>
          <Plus className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" className="h-9 w-9 shrink-0" onClick={() => setShowCustomInput(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Select value={value} onValueChange={handleSelectChange}>
      <SelectTrigger className={triggerClassName}>
        <SelectValue placeholder="Select" />
      </SelectTrigger>
      <SelectContent>
        {/* Show current custom value at the top if it exists */}
        {isCustomValue && (
          <SelectItem value={value}>{value} (custom)</SelectItem>
        )}
        {DEFAULT_TIMEFRAMES.map(tf => (
          <SelectItem key={tf} value={tf}>{tf}</SelectItem>
        ))}
        <SelectItem value="__custom__" className="text-primary font-medium">
          + Custom timeframe...
        </SelectItem>
      </SelectContent>
    </Select>
  );
};
