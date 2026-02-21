import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Sparkles, Eye } from "lucide-react";
import logo from "@/assets/tp-logo.png";
import { DreamList } from "@/components/dream-builder/DreamList";
import { DreamEditor } from "@/components/dream-builder/DreamEditor";
type ViewMode = "list" | "create" | "edit";
const DreamBuilder = () => {
  const [user, setUser] = useState<any>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedDreamId, setSelectedDreamId] = useState<string | null>(null);
  const navigate = useNavigate();
  useEffect(() => {
    supabase.auth.getSession().then(({
      data: {
        session
      }
    }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);
  const handleCreateNew = () => {
    setSelectedDreamId(null);
    setViewMode("create");
  };
  const handleEditDream = (dreamId: string) => {
    setSelectedDreamId(dreamId);
    setViewMode("edit");
  };
  const handleBackToList = () => {
    setSelectedDreamId(null);
    setViewMode("list");
  };
  return <div className="bg-gradient-to-br from-background via-primary/5 to-background">
      <main className="container mx-auto px-4 py-8">
        {viewMode === "list" ? <>
            <div className="mb-8 text-center max-w-3xl mx-auto">
              <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4 animate-pulse">
                <Sparkles className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Your Dream Universe
              </h2>
              <p className="text-muted-foreground text-lg">
                Visualize your ideal lifestyle, calculate the path, and manifest your dreams into reality
              </p>
            </div>

            <div className="flex justify-center mb-8">
              <Button onClick={handleCreateNew} size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                Create New Dream
              </Button>
            </div>

            <DreamList onEditDream={handleEditDream} />
          </> : <DreamEditor dreamId={selectedDreamId} onBack={handleBackToList} />}
      </main>
    </div>;
};
export default DreamBuilder;