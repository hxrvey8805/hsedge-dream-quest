import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useUserSettings } from "@/hooks/useUserSettings";
import { TIMEZONE_OPTIONS } from "@/lib/sessionDetection";
import { DollarSign, Globe, Clock, Calendar as CalendarIcon, Plus, Trash2, Mail } from "lucide-react";
import type { MonthlyRiskOverrides } from "@/lib/rMultiple";
import { supabase } from "@/integrations/supabase/client";

const CURRENCY_OPTIONS = [
  { value: "USD", label: "USD ($)", symbol: "$" },
  { value: "EUR", label: "EUR (€)", symbol: "€" },
  { value: "GBP", label: "GBP (£)", symbol: "£" },
];

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SettingsDialog = ({ open, onOpenChange }: SettingsDialogProps) => {
  const { settings, loading, updateSettings } = useUserSettings();
  const [timezone, setTimezone] = useState(settings.timezone);
  const [currency, setCurrency] = useState(settings.currency);
  const [riskAmount, setRiskAmount] = useState(settings.defaultRiskAmount?.toString() || "");
  const [overrides, setOverrides] = useState<MonthlyRiskOverrides>({});
  const [saving, setSaving] = useState(false);
  const [currentEmail, setCurrentEmail] = useState<string>("");
  const [newEmail, setNewEmail] = useState<string>("");
  const [emailSaving, setEmailSaving] = useState(false);

  useEffect(() => {
    if (open) {
      supabase.auth.getUser().then(({ data: { user } }) => {
        setCurrentEmail(user?.email ?? "");
        setNewEmail(user?.email ?? "");
      });
    }
  }, [open]);

  const handleEmailChange = async () => {
    const trimmed = newEmail.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (trimmed === currentEmail) {
      toast.info("That's already your email");
      return;
    }
    setEmailSaving(true);
    const { error } = await supabase.auth.updateUser({ email: trimmed });
    setEmailSaving(false);
    if (error) {
      toast.error(error.message || "Failed to update email");
    } else {
      toast.success("Confirmation link sent. Check both your old and new inboxes to confirm the change.");
    }
  };

  // New override row inputs
  const now = new Date();
  const [newYear, setNewYear] = useState<string>(String(now.getFullYear()));
  const [newMonth, setNewMonth] = useState<string>(String(now.getMonth() + 1).padStart(2, "0"));
  const [newAmount, setNewAmount] = useState<string>("");

  useEffect(() => {
    if (!loading) {
      setTimezone(settings.timezone);
      setCurrency(settings.currency);
      setRiskAmount(settings.defaultRiskAmount?.toString() || "");
      setOverrides({ ...(settings.monthlyRiskOverrides || {}) });
    }
  }, [loading, settings]);

  const handleSave = async () => {
    // Auto-commit any pending override that the user typed but didn't click "+"
    let finalOverrides = { ...overrides };
    const pendingAmt = parseFloat(newAmount);
    if (!isNaN(pendingAmt) && pendingAmt > 0) {
      const key = `${newYear}-${newMonth}`;
      finalOverrides[key] = pendingAmt;
      setOverrides(finalOverrides);
      setNewAmount("");
    }

    setSaving(true);
    const success = await updateSettings({
      timezone,
      currency,
      defaultRiskAmount: riskAmount ? parseFloat(riskAmount) : null,
      monthlyRiskOverrides: finalOverrides,
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

  const addOverride = () => {
    const amt = parseFloat(newAmount);
    if (!amt || amt <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    const key = `${newYear}-${newMonth}`;
    setOverrides(prev => ({ ...prev, [key]: amt }));
    setNewAmount("");
  };

  const removeOverride = (key: string) => {
    setOverrides(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const sortedOverrideKeys = Object.keys(overrides).sort().reverse();
  const yearOptions = Array.from({ length: 7 }, (_, i) => now.getFullYear() - 3 + i);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border/40 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Email */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Mail className="h-4 w-4 text-primary" />
              Email Address
            </Label>
            <p className="text-xs text-muted-foreground">
              Changing your email requires confirmation from both your current and new inboxes.
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="you@example.com"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleEmailChange}
                disabled={emailSaving || !newEmail.trim() || newEmail.trim() === currentEmail}
              >
                {emailSaving ? "Sending..." : "Update"}
              </Button>
            </div>
          </div>

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

          {/* Monthly 1R Overrides */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <CalendarIcon className="h-4 w-4 text-primary" />
              Monthly 1R Overrides
            </Label>
            <p className="text-xs text-muted-foreground">
              Set a different 1R amount for specific months. Trades in those months use this value instead of the default.
            </p>

            {sortedOverrideKeys.length > 0 && (
              <div className="space-y-1.5 mt-2">
                {sortedOverrideKeys.map(key => {
                  const [y, m] = key.split("-");
                  const label = `${MONTH_NAMES[parseInt(m, 10) - 1]} ${y}`;
                  return (
                    <div key={key} className="flex items-center justify-between gap-2 px-3 py-2 rounded-md bg-muted/40 border border-border/40">
                      <span className="text-sm font-medium">{label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {currencySymbol}{overrides[key]}
                        </span>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => removeOverride(key)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-end pt-2">
              <Select value={newMonth} onValueChange={setNewMonth}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MONTH_NAMES.map((n, i) => (
                    <SelectItem key={i} value={String(i + 1).padStart(2, "0")}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={newYear} onValueChange={setNewYear}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {yearOptions.map(y => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                  {currencySymbol}
                </span>
                <Input
                  type="number"
                  step="any"
                  min="0"
                  placeholder="Amount"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="pl-6"
                />
              </div>
              <Button type="button" size="icon" variant="outline" onClick={addOverride}>
                <Plus className="h-4 w-4" />
              </Button>
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
