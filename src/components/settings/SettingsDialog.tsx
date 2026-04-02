import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useUserSettings } from "@/hooks/useUserSettings";
import { TIMEZONE_OPTIONS } from "@/lib/sessionDetection";
import { DollarSign, Globe, Clock } from "lucide-react";

const CURRENCY_OPTIONS = [
  { value: "USD", label: "USD ($)", symbol: "$" },
  { value: "EUR", label: "EUR (€)", symbol: "€" },
  { value: "GBP", label: "GBP (£)", symbol: "£" },
];

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SettingsDialog = ({ open, onOpenChange }: SettingsDialogProps) => {
  const { settings, loading, updateSettings } = useUserSettings();
  const [timezone, setTimezone] = useState(settings.timezone);
  const [currency, setCurrency] = useState(settings.currency);
  const [riskAmount, setRiskAmount] = useState(settings.defaultRiskAmount?.toString() || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading) {
      setTimezone(settings.timezone);
      setCurrency(settings.currency);
      setRiskAmount(settings.defaultRiskAmount?.toString() || "");
    }
  }, [loading, settings]);

  const handleSave = async () => {
    setSaving(true);
    const success = await updateSettings({
      timezone,
      currency,
      defaultRiskAmount: riskAmount ? parseFloat(riskAmount) : null,
    });
    setSaving(false);

    if (success) {
      toast.success("Settings saved");
      onOpenChange(false);
    } else {
      toast.error("Failed to save settings");
    }
  };

  const currencySymbol = CURRENCY_OPTIONS.find(c => c.value === currency)?.symbol || "$";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border/40">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Default 1R Amount */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <DollarSign className="h-4 w-4 text-primary" />
              Default 1R Amount
            </Label>
            <p className="text-xs text-muted-foreground">
              This will auto-fill the Risk ($) field when logging new trades.
            </p>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                {currencySymbol}
              </span>
              <Input
                type="number"
                step="any"
                min="0"
                placeholder="e.g. 100"
                value={riskAmount}
                onChange={(e) => setRiskAmount(e.target.value)}
                className="pl-7"
              />
            </div>
          </div>

          {/* Currency */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Globe className="h-4 w-4 text-primary" />
              Currency
            </Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCY_OPTIONS.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Timezone */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4 text-primary" />
              Timezone
            </Label>
            <p className="text-xs text-muted-foreground">
              Affects session detection (Premarket, NYC, London, Asia).
            </p>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONE_OPTIONS.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
