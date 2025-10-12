import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Target, DollarSign, Calendar, Sparkles } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/hs-logo.png";

const DreamBuilder = () => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSave = () => {
    toast.success("Dreams saved successfully!");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="HS-Edge" className="h-10 w-10" />
            <h1 className="text-xl font-bold">Dream Builder</h1>
          </div>
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 text-center">
          <div className="inline-flex p-3 rounded-full bg-primary/10 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Build Your Trading Dreams</h2>
          <p className="text-muted-foreground">Define your goals and track your journey to success</p>
        </div>

        <div className="space-y-6">
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-3 mb-4">
              <Target className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-semibold">Ultimate Trading Goal</h3>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="main-goal">What is your biggest trading dream?</Label>
                <Textarea
                  id="main-goal"
                  placeholder="e.g., Become a consistently profitable trader with $100k account..."
                  className="mt-2"
                  rows={3}
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="h-6 w-6 text-success" />
              <h3 className="text-xl font-semibold">Financial Targets</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="monthly-target">Monthly Profit Target</Label>
                <Input
                  id="monthly-target"
                  type="number"
                  placeholder="$5,000"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="yearly-target">Yearly Goal</Label>
                <Input
                  id="yearly-target"
                  type="number"
                  placeholder="$60,000"
                  className="mt-2"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-semibold">Milestones</h3>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="30-day">30-Day Milestone</Label>
                <Input
                  id="30-day"
                  placeholder="e.g., Complete 20 winning trades"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="90-day">90-Day Milestone</Label>
                <Input
                  id="90-day"
                  placeholder="e.g., Achieve 65% win rate"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="1-year">1-Year Vision</Label>
                <Textarea
                  id="1-year"
                  placeholder="Describe where you see yourself in one year..."
                  className="mt-2"
                  rows={3}
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <h3 className="text-xl font-semibold mb-4">Why This Matters</h3>
            <div>
              <Label htmlFor="motivation">What motivates you to trade?</Label>
              <Textarea
                id="motivation"
                placeholder="e.g., Financial freedom, support my family, travel the world..."
                className="mt-2"
                rows={4}
              />
            </div>
          </Card>

          <div className="flex justify-center pt-4">
            <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 px-8">
              Save My Dreams
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DreamBuilder;
