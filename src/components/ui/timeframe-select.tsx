import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const PRESET_TIMEFRAMES = ["10S", "1M", "5M", "15M", "30M", "1H", "4H", "Daily"];

interface TimeframeSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  triggerClassName?: string;
}

export const TimeframeSelect = ({ value, onValueChange, className, triggerClassName }: TimeframeSelectProps) => {
  const [open, setOpen] = useState(false);
  const [customValue, setCustomValue] = useState("");

  const handleSelect = (tf: string) => {
    onValueChange(tf);
    setOpen(false);
  };

  const handleCustomSubmit = () => {
    const trimmed = customValue.trim().toUpperCase();
    if (trimmed) {
      onValueChange(trimmed);
      setCustomValue("");
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between font-normal bg-secondary/50 border-border/50",
            !value && "text-muted-foreground",
            triggerClassName
          )}
        >
          {value || "Select"}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn("w-[160px] p-1", className)} align="start">
        <div className="flex flex-col gap-0.5">
          {PRESET_TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              onClick={() => handleSelect(tf)}
              className={cn(
                "flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors",
                value === tf && "bg-accent text-accent-foreground"
              )}
            >
              <Check className={cn("h-3.5 w-3.5", value === tf ? "opacity-100" : "opacity-0")} />
              {tf}
            </button>
          ))}
          <div className="border-t border-border my-1" />
          <div className="px-1 pb-1">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCustomSubmit();
              }}
              className="flex gap-1"
            >
              <Input
                placeholder="Custom..."
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                className="h-7 text-xs"
              />
              <Button type="submit" size="sm" variant="secondary" className="h-7 px-2 text-xs">
                Add
              </Button>
            </form>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
