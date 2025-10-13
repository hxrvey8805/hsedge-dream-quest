import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { DreamVisionSection } from "./DreamVisionSection";
import { DreamPurchasesSection } from "./DreamPurchasesSection";
import { TradingIncomeSection } from "./TradingIncomeSection";
import { DreamDashboard } from "./DreamDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DreamEditorProps {
  dreamId: string | null;
  onBack: () => void;
}

export const DreamEditor = ({ dreamId, onBack }: DreamEditorProps) => {
  const [dreamProfile, setDreamProfile] = useState<any>(null);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [incomeSources, setIncomeSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (dreamId) {
      fetchDreamData();
    }
  }, [dreamId]);

  const fetchDreamData = async () => {
    if (!dreamId) return;

    setLoading(true);
    try {
      const { data: profile, error: profileError } = await supabase
        .from("dream_profiles")
        .select("*")
        .eq("id", dreamId)
        .single();

      if (profileError) throw profileError;
      setDreamProfile(profile);

      const { data: purchaseData, error: purchaseError } = await supabase
        .from("dream_purchases")
        .select("*")
        .eq("dream_profile_id", dreamId);

      if (purchaseError) throw purchaseError;
      setPurchases(purchaseData || []);

      const { data: incomeData, error: incomeError } = await supabase
        .from("trading_income_sources")
        .select("*")
        .eq("dream_profile_id", dreamId);

      if (incomeError) throw incomeError;
      setIncomeSources(incomeData || []);
    } catch (error: any) {
      toast.error("Failed to load dream data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDream = async (dreamData: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (dreamId) {
        const { error } = await supabase
          .from("dream_profiles")
          .update(dreamData)
          .eq("id", dreamId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("dream_profiles")
          .insert([{ ...dreamData, user_id: user.id }])
          .select()
          .single();

        if (error) throw error;
        setDreamProfile(data);
      }

      toast.success("Dream saved successfully!");
      if (!dreamId && dreamProfile) {
        fetchDreamData();
      }
    } catch (error: any) {
      toast.error("Failed to save dream");
      console.error(error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Dreams
        </Button>
      </div>

      <Tabs defaultValue="vision" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="vision">Vision</TabsTrigger>
          <TabsTrigger value="purchases">Purchases</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="vision">
          <DreamVisionSection
            dreamProfile={dreamProfile}
            onSave={handleSaveDream}
          />
        </TabsContent>

        <TabsContent value="purchases">
          <DreamPurchasesSection
            dreamProfileId={dreamProfile?.id}
            purchases={purchases}
            onUpdate={fetchDreamData}
          />
        </TabsContent>

        <TabsContent value="income">
          <TradingIncomeSection
            dreamProfileId={dreamProfile?.id}
            incomeSources={incomeSources}
            onUpdate={fetchDreamData}
          />
        </TabsContent>

        <TabsContent value="dashboard">
          <DreamDashboard
            purchases={purchases}
            incomeSources={incomeSources}
            onUpdatePurchases={fetchDreamData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
