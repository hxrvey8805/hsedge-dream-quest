import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Trash2, Calendar, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface DreamProfile {
  id: string;
  title: string;
  dream_type: string;
  timescale: string | null;
  created_at: string;
}

interface DreamListProps {
  onEditDream: (dreamId: string) => void;
}

export const DreamList = ({ onEditDream }: DreamListProps) => {
  const [dreams, setDreams] = useState<DreamProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDreams();
  }, []);

  const fetchDreams = async () => {
    try {
      const { data, error } = await supabase
        .from("dream_profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDreams(data || []);
    } catch (error: any) {
      toast.error("Failed to load dreams");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (dreamId: string) => {
    if (!confirm("Are you sure you want to delete this dream?")) return;

    try {
      const { error } = await supabase
        .from("dream_profiles")
        .delete()
        .eq("id", dreamId);

      if (error) throw error;
      toast.success("Dream deleted successfully");
      fetchDreams();
    } catch (error: any) {
      toast.error("Failed to delete dream");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <Sparkles className="h-12 w-12 mx-auto animate-pulse text-primary mb-4" />
        <p className="text-muted-foreground">Loading your dreams...</p>
      </div>
    );
  }

  if (dreams.length === 0) {
    return (
      <Card className="p-12 text-center max-w-2xl mx-auto bg-card/50 backdrop-blur-sm border-dashed">
        <Sparkles className="h-16 w-16 mx-auto text-primary/50 mb-4" />
        <h3 className="text-2xl font-semibold mb-2">No Dreams Yet</h3>
        <p className="text-muted-foreground mb-6">
          Start building your dream lifestyle by creating your first vision
        </p>
      </Card>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
      {dreams.map((dream) => (
        <Card
          key={dream.id}
          className="p-6 bg-card/50 backdrop-blur-sm border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-xs font-medium text-primary uppercase tracking-wide">
                {dream.dream_type}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => handleDelete(dream.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <h3 className="text-xl font-bold mb-2 line-clamp-2">{dream.title}</h3>

          {dream.timescale && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Calendar className="h-4 w-4" />
              <span>{dream.timescale}</span>
            </div>
          )}

          <div className="text-xs text-muted-foreground mb-4">
            Created {format(new Date(dream.created_at), "MMM d, yyyy")}
          </div>

          <Button
            onClick={() => onEditDream(dream.id)}
            className="w-full gap-2"
            variant="outline"
          >
            <Eye className="h-4 w-4" />
            View & Edit
          </Button>
        </Card>
      ))}
    </div>
  );
};
