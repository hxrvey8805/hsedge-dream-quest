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
import { Sparkles, ArrowRight, Check, Heart, Plus, Trash2 } from "lucide-react";

interface OnboardingVisionBuilderProps {
  onComplete: () => void;
  userId: string;
}

interface DreamPurchase {
  id: string;
  name: string;
  price: number;
  image: string;
  isPreset: boolean;
}

const presetPurchases: DreamPurchase[] = [
  {
    id: "lambo",
    name: "Lamborghini Aventador",
    price: 350000,
    image: "https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?w=400&h=300&fit=crop",
    isPreset: true,
  },
  {
    id: "rolex",
    name: "Rolex Submariner",
    price: 10000,
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&h=300&fit=crop",
    isPreset: true,
  },
  {
    id: "penthouse",
    name: "Dubai Penthouse",
    price: 2000000,
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop",
    isPreset: true,
  },
  {
    id: "yacht",
    name: "Luxury Yacht",
    price: 1500000,
    image: "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=400&h=300&fit=crop",
    isPreset: true,
  },
  {
    id: "jet",
    name: "Private Jet Share",
    price: 500000,
    image: "https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=400&h=300&fit=crop",
    isPreset: true,
  },
  {
    id: "watches",
    name: "Luxury Watch Collection",
    price: 50000,
    image: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=400&h=300&fit=crop",
    isPreset: true,
  },
  {
    id: "porsche",
    name: "Porsche 911 GT3",
    price: 180000,
    image: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=400&h=300&fit=crop",
    isPreset: true,
  },
  {
    id: "villa",
    name: "Maldives Villa",
    price: 3000000,
    image: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=400&h=300&fit=crop",
    isPreset: true,
  },
  {
    id: "tesla",
    name: "Tesla Model S Plaid",
    price: 120000,
    image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400&h=300&fit=crop",
    isPreset: true,
  },
];

export const OnboardingVisionBuilder = ({ onComplete, userId }: OnboardingVisionBuilderProps) => {
  const [title, setTitle] = useState("");
  const [timescale, setTimescale] = useState("");
  const [whyMotivation, setWhyMotivation] = useState("");
  const [selectedPurchases, setSelectedPurchases] = useState<Set<string>>(new Set());
  const [customPurchases, setCustomPurchases] = useState<DreamPurchase[]>([]);
  const [newPurchaseName, setNewPurchaseName] = useState("");
  const [newPurchasePrice, setNewPurchasePrice] = useState("");
  const [saving, setSaving] = useState(false);

  const togglePurchase = (id: string) => {
    const newSelected = new Set(selectedPurchases);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedPurchases(newSelected);
  };

  const addCustomPurchase = () => {
    if (!newPurchaseName || !newPurchasePrice) return;
    
    const newPurchase: DreamPurchase = {
      id: `custom-${Date.now()}`,
      name: newPurchaseName,
      price: parseFloat(newPurchasePrice.replace(/[£$,]/g, "")) || 0,
      image: "",
      isPreset: false,
    };
    
    setCustomPurchases([...customPurchases, newPurchase]);
    setSelectedPurchases(new Set([...selectedPurchases, newPurchase.id]));
    setNewPurchaseName("");
    setNewPurchasePrice("");
  };

  const removeCustomPurchase = (id: string) => {
    setCustomPurchases(customPurchases.filter((p) => p.id !== id));
    const newSelected = new Set(selectedPurchases);
    newSelected.delete(id);
    setSelectedPurchases(newSelected);
  };

  const getAllSelectedPurchases = () => {
    const presets = presetPurchases.filter((p) => selectedPurchases.has(p.id));
    const customs = customPurchases.filter((p) => selectedPurchases.has(p.id));
    return [...presets, ...customs];
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
          why_motivation: whyMotivation,
        })
        .select()
        .single();

      if (profileError) throw profileError;

      // Save selected purchases
      const purchasesToSave = getAllSelectedPurchases();
      if (purchasesToSave.length > 0 && dreamProfile) {
        const { error: purchasesError } = await supabase.from("dream_purchases").insert(
          purchasesToSave.map((p) => ({
            user_id: userId,
            dream_profile_id: dreamProfile.id,
            item_name: p.name,
            price: p.price,
            image_url: p.image || null,
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

  const totalValue = getAllSelectedPurchases().reduce((sum, p) => sum + p.price, 0);

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

        {/* Your Why */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="p-6 premium-card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-destructive" />
              Your Why
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              What pushes you to keep going each day? How do you want to be remembered?
            </p>
            <Textarea
              placeholder="Write about your deeper motivation... What drives you? What legacy do you want to leave behind?"
              value={whyMotivation}
              onChange={(e) => setWhyMotivation(e.target.value)}
              className="premium-input min-h-[120px]"
            />
          </Card>
        </motion.div>

        {/* Dream Purchases - Tiles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 premium-card">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Dream Purchases
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Select items or add your own below
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {presetPurchases.map((item) => {
                const isSelected = selectedPurchases.has(item.id);
                return (
                  <motion.div
                    key={item.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => togglePurchase(item.id)}
                    className={`relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 border-2 ${
                      isSelected
                        ? "border-primary shadow-lg shadow-primary/20"
                        : "border-border/50 hover:border-primary/50"
                    }`}
                  >
                    <div className="relative h-32 md:h-40 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className={`w-full h-full object-cover transition-all duration-300 ${
                          isSelected ? "scale-105" : ""
                        }`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-primary flex items-center justify-center"
                        >
                          <Check className="w-5 h-5 text-primary-foreground" />
                        </motion.div>
                      )}

                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <h4 className="text-sm font-semibold text-foreground truncate">
                          {item.name}
                        </h4>
                        <p className="text-lg font-bold text-primary">
                          £{item.price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Custom Purchases Input */}
            <div className="mt-6 pt-6 border-t border-border/50">
              <h4 className="text-sm font-semibold mb-3">Add Your Own</h4>
              <div className="flex flex-wrap gap-3">
                <Input
                  placeholder="Item name"
                  value={newPurchaseName}
                  onChange={(e) => setNewPurchaseName(e.target.value)}
                  className="premium-input flex-1 min-w-[150px]"
                />
                <Input
                  placeholder="Price (£)"
                  value={newPurchasePrice}
                  onChange={(e) => setNewPurchasePrice(e.target.value)}
                  className="premium-input w-32"
                />
                <Button 
                  onClick={addCustomPurchase} 
                  className="premium-button"
                  disabled={!newPurchaseName || !newPurchasePrice}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Custom Purchases List */}
              {customPurchases.length > 0 && (
                <div className="mt-4 space-y-2">
                  {customPurchases.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-medium">{p.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-primary font-medium">£{p.price.toLocaleString()}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeCustomPurchase(p.id)}
                          className="text-destructive hover:text-destructive h-8 w-8"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Total Summary */}
            {selectedPurchases.size > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20"
              >
                <p className="text-sm text-center">
                  <span className="font-semibold text-primary">{selectedPurchases.size}</span> items selected • Total: £{totalValue.toLocaleString()}
                </p>
              </motion.div>
            )}
          </Card>
        </motion.div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
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
