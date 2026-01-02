import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Wallet, TrendingUp, Target, ArrowRight, Sparkles } from "lucide-react";

interface OnboardingAccountsProps {
  onComplete: () => void;
  userId: string;
}

type AccountType = "personal" | "funded" | "evaluation";

interface AccountForm {
  type: AccountType;
  name: string;
  broker?: string;
  company?: string;
  size: string;
  profitTarget?: string;
}

const PROP_FIRMS = ["FTMO", "MyForexFunds", "The Funded Trader", "E8 Funding", "True Forex Funds", "Funded Next", "Other"];
const ACCOUNT_SIZES = ["$5,000", "$10,000", "$25,000", "$50,000", "$100,000", "$200,000", "$400,000"];

export const OnboardingAccounts = ({ onComplete, userId }: OnboardingAccountsProps) => {
  const [accounts, setAccounts] = useState<AccountForm[]>([]);
  const [activeType, setActiveType] = useState<AccountType | null>(null);
  const [currentForm, setCurrentForm] = useState<Partial<AccountForm>>({});
  const [saving, setSaving] = useState(false);

  const accountTypes = [
    { 
      type: "personal" as AccountType, 
      icon: Wallet, 
      label: "Personal", 
      description: "Your personal trading accounts",
      color: "from-primary to-primary-glow"
    },
    { 
      type: "funded" as AccountType, 
      icon: TrendingUp, 
      label: "Funded", 
      description: "Prop firm funded accounts",
      color: "from-success to-emerald-400"
    },
    { 
      type: "evaluation" as AccountType, 
      icon: Target, 
      label: "Evaluations", 
      description: "Active prop firm challenges",
      color: "from-amber-500 to-orange-400"
    },
  ];

  const handleAddAccount = () => {
    if (!activeType) return;

    const newAccount: AccountForm = {
      type: activeType,
      name: currentForm.name || "",
      broker: currentForm.broker,
      company: currentForm.company,
      size: currentForm.size || "",
      profitTarget: currentForm.profitTarget,
    };

    setAccounts([...accounts, newAccount]);
    setCurrentForm({});
    setActiveType(null);
  };

  const handleRemoveAccount = (index: number) => {
    setAccounts(accounts.filter((_, i) => i !== index));
  };

  const handleSaveAndContinue = async () => {
    if (!userId) return;
    setSaving(true);

    try {
      // Save personal accounts
      const personalAccounts = accounts.filter(a => a.type === "personal");
      if (personalAccounts.length > 0) {
        const { error } = await supabase.from("personal_accounts").insert(
          personalAccounts.map(a => ({
            user_id: userId,
            account_name: a.name,
            broker: a.broker,
            account_size: parseFloat(a.size.replace(/[$,]/g, "")) || 0,
          }))
        );
        if (error) throw error;
      }

      // Save funded accounts
      const fundedAccounts = accounts.filter(a => a.type === "funded");
      if (fundedAccounts.length > 0) {
        const { error } = await supabase.from("funded_accounts").insert(
          fundedAccounts.map(a => ({
            user_id: userId,
            company: a.company || "",
            account_size: a.size,
            funded_accounts_goal: 1,
            funded_accounts_count: 1,
          }))
        );
        if (error) throw error;
      }

      // Save evaluations
      const evaluations = accounts.filter(a => a.type === "evaluation");
      if (evaluations.length > 0) {
        const { error } = await supabase.from("evaluations").insert(
          evaluations.map(a => ({
            user_id: userId,
            company: a.company || "",
            account_size: a.size,
            profit_target: parseFloat(a.profitTarget?.replace(/[$,]/g, "") || "0"),
          }))
        );
        if (error) throw error;
      }

      toast.success("Accounts saved successfully!");
      onComplete();
    } catch (error: any) {
      toast.error("Failed to save accounts: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-text-reveal">
            <span className="bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
              Welcome to Your Trading Journey
            </span>
          </h1>
          <p className="text-muted-foreground text-lg animate-text-reveal-delay-1">
            Let's set up your trading accounts to track your performance
          </p>
        </motion.div>
      </div>

      {/* Account Type Selection */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {accountTypes.map((acc, idx) => (
          <motion.div
            key={acc.type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 + 0.3 }}
          >
            <Card
              className={`p-6 cursor-pointer transition-all duration-300 hover:scale-105 ${
                activeType === acc.type 
                  ? "ring-2 ring-primary bg-primary/10" 
                  : "bg-card hover:bg-card/80"
              }`}
              onClick={() => {
                setActiveType(acc.type);
                setCurrentForm({ type: acc.type });
              }}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${acc.color} flex items-center justify-center mb-4`}>
                <acc.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-1">{acc.label}</h3>
              <p className="text-sm text-muted-foreground">{acc.description}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Account Form */}
      <AnimatePresence>
        {activeType && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-6 mb-8 premium-card">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Add {accountTypes.find(a => a.type === activeType)?.label} Account
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                {activeType === "personal" && (
                  <>
                    <div className="space-y-2">
                      <Label>Account Name</Label>
                      <Input
                        placeholder="e.g., Main Trading Account"
                        value={currentForm.name || ""}
                        onChange={(e) => setCurrentForm({ ...currentForm, name: e.target.value })}
                        className="premium-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Broker (Optional)</Label>
                      <Input
                        placeholder="e.g., IC Markets"
                        value={currentForm.broker || ""}
                        onChange={(e) => setCurrentForm({ ...currentForm, broker: e.target.value })}
                        className="premium-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Account Size</Label>
                      <Input
                        placeholder="e.g., $10,000"
                        value={currentForm.size || ""}
                        onChange={(e) => setCurrentForm({ ...currentForm, size: e.target.value })}
                        className="premium-input"
                      />
                    </div>
                  </>
                )}

                {(activeType === "funded" || activeType === "evaluation") && (
                  <>
                    <div className="space-y-2">
                      <Label>Prop Firm</Label>
                      <Select
                        value={currentForm.company}
                        onValueChange={(v) => setCurrentForm({ ...currentForm, company: v })}
                      >
                        <SelectTrigger className="premium-input">
                          <SelectValue placeholder="Select prop firm" />
                        </SelectTrigger>
                        <SelectContent>
                          {PROP_FIRMS.map((firm) => (
                            <SelectItem key={firm} value={firm}>{firm}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Account Size</Label>
                      <Select
                        value={currentForm.size}
                        onValueChange={(v) => setCurrentForm({ ...currentForm, size: v })}
                      >
                        <SelectTrigger className="premium-input">
                          <SelectValue placeholder="Select account size" />
                        </SelectTrigger>
                        <SelectContent>
                          {ACCOUNT_SIZES.map((size) => (
                            <SelectItem key={size} value={size}>{size}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {activeType === "evaluation" && (
                      <div className="space-y-2">
                        <Label>Profit Target</Label>
                        <Input
                          placeholder="e.g., $1,000"
                          value={currentForm.profitTarget || ""}
                          onChange={(e) => setCurrentForm({ ...currentForm, profitTarget: e.target.value })}
                          className="premium-input"
                        />
                      </div>
                    )}
                  </>
                )}
              </div>

              <Button
                className="mt-4 premium-button"
                onClick={handleAddAccount}
                disabled={!currentForm.size || (activeType === "personal" && !currentForm.name)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Account
              </Button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Added Accounts */}
      {accounts.length > 0 && (
        <div className="space-y-3 mb-8">
          <h3 className="text-lg font-semibold">Your Accounts ({accounts.length})</h3>
          {accounts.map((account, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="p-4 flex items-center justify-between bg-secondary/50">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${
                    account.type === "personal" ? "from-primary to-primary-glow" :
                    account.type === "funded" ? "from-success to-emerald-400" :
                    "from-amber-500 to-orange-400"
                  } flex items-center justify-center`}>
                    {account.type === "personal" && <Wallet className="w-5 h-5 text-white" />}
                    {account.type === "funded" && <TrendingUp className="w-5 h-5 text-white" />}
                    {account.type === "evaluation" && <Target className="w-5 h-5 text-white" />}
                  </div>
                  <div>
                    <p className="font-medium">
                      {account.type === "personal" ? account.name : account.company}
                    </p>
                    <p className="text-sm text-muted-foreground">{account.size}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveAccount(idx)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Continue Button */}
      <div className="flex justify-center">
        <Button
          size="lg"
          className="premium-button px-12 py-6 text-lg"
          onClick={handleSaveAndContinue}
          disabled={saving}
        >
          {saving ? "Saving..." : accounts.length > 0 ? "Continue to Vision" : "Skip for Now"}
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
};
