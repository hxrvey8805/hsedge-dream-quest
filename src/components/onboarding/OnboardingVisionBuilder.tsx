import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Home, Car, Plane, Shirt, Sparkles, ArrowRight, Plus, Trash2 } from "lucide-react";

interface OnboardingVisionBuilderProps {
  onComplete: () => void;
  userId: string;
}

interface DreamPurchase {
  name: string;
  price: string;
  category: string;
}

export const OnboardingVisionBuilder = ({ onComplete, userId }: OnboardingVisionBuilderProps) => {
  const [title, setTitle] = useState("");
  const [timescale, setTimescale] = useState("");
  const [livingSituation, setLivingSituation] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [travel, setTravel] = useState("");
  const [style, setStyle] = useState("");
  const [purchases, setPurchases] = useState<DreamPurchase[]>([]);
  const [newPurchase, setNewPurchase] = useState<DreamPurchase>({ name: "", price: "", category: "other" });
  const [saving, setSaving] = useState(false);

  const categories = [
    { icon: Home, label: "Living", value: "living" },
    { icon: Car, label: "Vehicle", value: "vehicle" },
    { icon: Plane, label: "Travel", value: "travel" },
    { icon: Shirt, label: "Style", value: "style" },
    { icon: Sparkles, label: "Other", value: "other" },
  ];

  const addPurchase = () => {
    if (newPurchase.name && newPurchase.price) {
      setPurchases([...purchases, newPurchase]);
      setNewPurchase({ name: "", price: "", category: "other" });
    }
  };

  const removePurchase = (index: number) => {
    setPurchases(purchases.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!userId || !title) {
      toast.error("Please provide a title for your dream");
      return;
    }

    setSaving(true);
    try {
      // Create dream profile
      const { data: dreamProfile, error: profileError } = await supabase
        .from("dream_profiles")
        .insert({
          user_id: userId,
          title,
          dream_type: "primary",
          timescale,
          living_situation: livingSituation,
          vehicle,
          travel,
          style,
        })
        .select()
        .single();

      if (profileError) throw profileError;

      // Save purchases
      if (purchases.length > 0 && dreamProfile) {
        const { error: purchasesError } = await supabase.from("dream_purchases").insert(
          purchases.map((p) => ({
            user_id: userId,
            dream_profile_id: dreamProfile.id,
            item_name: p.name,
            price: parseFloat(p.price.replace(/[$,]/g, "")) || 0,
            is_selected: true,
          }))
        );
        if (purchasesError) throw purchasesError;
      }

      // Update user profile with primary dream
      if (dreamProfile) {
        await supabase
          .from("user_profiles")
          .update({ primary_dream_id: dreamProfile.id })
          .eq("user_id", userId);
      }

      toast.success("Vision created successfully!");
      onComplete();
    } catch (error: any) {
      toast.error("Failed to save vision: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Design Your Dream Life
          </span>
        </h1>
        <p className="text-muted-foreground">
          This is your primary vision — the life that trading will help you build
        </p>
      </motion.div>

      <div className="space-y-6">
        {/* Basic Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 premium-card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Vision Details
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Dream Title *</Label>
                <Input
                  placeholder="e.g., Financial Freedom by 30"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="premium-input"
                />
              </div>
              <div className="space-y-2">
                <Label>Timescale</Label>
                <Select value={timescale} onValueChange={setTimescale}>
                  <SelectTrigger className="premium-input">
                    <SelectValue placeholder="When do you want this?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-year">Within 1 Year</SelectItem>
                    <SelectItem value="2-3-years">2-3 Years</SelectItem>
                    <SelectItem value="5-years">5 Years</SelectItem>
                    <SelectItem value="10-years">10+ Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Life Aspects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 premium-card">
            <h3 className="text-lg font-semibold mb-4">Life Aspects</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Home className="w-4 h-4 text-primary" /> Living Situation
                </Label>
                <Textarea
                  placeholder="Describe your ideal home..."
                  value={livingSituation}
                  onChange={(e) => setLivingSituation(e.target.value)}
                  className="premium-input min-h-[80px]"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-success" /> Dream Vehicle
                </Label>
                <Textarea
                  placeholder="What would you drive?"
                  value={vehicle}
                  onChange={(e) => setVehicle(e.target.value)}
                  className="premium-input min-h-[80px]"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Plane className="w-4 h-4 text-amber-500" /> Travel Goals
                </Label>
                <Textarea
                  placeholder="Where would you travel?"
                  value={travel}
                  onChange={(e) => setTravel(e.target.value)}
                  className="premium-input min-h-[80px]"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Shirt className="w-4 h-4 text-purple-500" /> Lifestyle & Style
                </Label>
                <Textarea
                  placeholder="How would you dress and live?"
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="premium-input min-h-[80px]"
                />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Dream Purchases */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 premium-card">
            <h3 className="text-lg font-semibold mb-4">Dream Purchases (Optional)</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add specific items you want to afford through trading
            </p>

            <div className="flex flex-wrap gap-3 mb-4">
              <Input
                placeholder="Item name"
                value={newPurchase.name}
                onChange={(e) => setNewPurchase({ ...newPurchase, name: e.target.value })}
                className="premium-input flex-1 min-w-[150px]"
              />
              <Input
                placeholder="Price"
                value={newPurchase.price}
                onChange={(e) => setNewPurchase({ ...newPurchase, price: e.target.value })}
                className="premium-input w-32"
              />
              <Select
                value={newPurchase.category}
                onValueChange={(v) => setNewPurchase({ ...newPurchase, category: v })}
              >
                <SelectTrigger className="premium-input w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={addPurchase} className="premium-button">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {purchases.length > 0 && (
              <div className="space-y-2">
                {purchases.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-3">
                      {categories.find((c) => c.value === p.category)?.icon && (
                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                          {(() => {
                            const Icon = categories.find((c) => c.value === p.category)?.icon || Sparkles;
                            return <Icon className="w-4 h-4 text-primary" />;
                          })()}
                        </div>
                      )}
                      <span className="font-medium">{p.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-success font-medium">{p.price}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removePurchase(idx)}
                        className="text-destructive hover:text-destructive h-8 w-8"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center pt-4"
        >
          <Button
            size="lg"
            className="premium-button px-12 py-6 text-lg"
            onClick={handleSave}
            disabled={saving || !title}
          >
            {saving ? "Creating Vision..." : "Launch My Dashboard"}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
};
