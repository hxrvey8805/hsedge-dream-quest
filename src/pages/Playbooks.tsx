import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus } from "lucide-react";
import { CreatePlaybookDialog } from "@/components/playbooks/CreatePlaybookDialog";
import { PlaybookCard } from "@/components/playbooks/PlaybookCard";
import { PurchasedPlaybooksSection } from "@/components/playbooks/PurchasedPlaybooksSection";
import { PlaybooksLanding } from "@/components/playbooks/PlaybooksLanding";

interface Playbook {
  id: string;
  name: string;
  description: string | null;
  documentation_notes: string | null;
  file_urls: string[] | null;
  is_purchased: boolean;
  created_at: string;
}

export default function Playbooks() {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchPlaybooks = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("playbooks")
      .select("*")
      .eq("is_purchased", false)
      .order("created_at", { ascending: false });

    if (!error && data) setPlaybooks(data);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) fetchPlaybooks();
  }, [user, fetchPlaybooks]);

  if (authLoading) return null;

  // Not signed in → show the Vault landing page
  if (!user) return <PlaybooksLanding />;

  // Signed in → show the playbooks dashboard
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">My Playbooks</h1>
              <p className="text-sm text-muted-foreground">Your trading strategies and purchased playbooks</p>
            </div>
          </div>
          <Button
            onClick={() => setCreateOpen(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Playbook
          </Button>
        </div>

        {/* Purchased Section */}
        <PurchasedPlaybooksSection />

        {/* My Playbooks */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">My Playbooks</h2>
            <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full ml-1">
              {playbooks.length}
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-32 rounded-lg bg-card border border-border animate-pulse" />
              ))}
            </div>
          ) : playbooks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-foreground font-semibold mb-2">No playbooks yet</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                Create your first playbook to document your trading strategies with entry/exit rules and time windows.
              </p>
              <Button onClick={() => setCreateOpen(true)} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create Playbook
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {playbooks.map((pb) => (
                <PlaybookCard key={pb.id} playbook={pb} onDeleted={fetchPlaybooks} />
              ))}
            </div>
          )}
        </div>
      </div>

      <CreatePlaybookDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={fetchPlaybooks}
      />
    </div>
  );
}
