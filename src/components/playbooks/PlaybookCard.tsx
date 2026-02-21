import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Playbook {
  id: string;
  name: string;
  description: string | null;
  entry_rules: string | null;
  exit_rules: string | null;
  time_window_start: string | null;
  time_window_end: string | null;
  session: string | null;
  is_purchased: boolean;
  created_at: string;
}

interface PlaybookCardProps {
  playbook: Playbook;
  onDeleted: () => void;
}

export function PlaybookCard({ playbook, onDeleted }: PlaybookCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    const { error } = await supabase.from("playbooks").delete().eq("id", playbook.id);
    if (error) {
      toast.error("Failed to delete playbook");
    } else {
      toast.success("Playbook deleted");
      onDeleted();
    }
    setDeleting(false);
  };

  const timeWindow = playbook.time_window_start && playbook.time_window_end
    ? `${playbook.time_window_start} — ${playbook.time_window_end}`
    : null;

  return (
    <Card className="bg-card border-border hover:border-primary/30 transition-all duration-300 overflow-hidden group">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground truncate">{playbook.name}</h3>
              <div className="flex items-center gap-3 mt-1">
                {playbook.session && (
                  <span className="text-xs text-muted-foreground bg-secondary/60 px-2 py-0.5 rounded">
                    {playbook.session}
                  </span>
                )}
                {timeWindow && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {timeWindow}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            {!playbook.is_purchased && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={handleDelete}
                disabled={deleting}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Description */}
        {playbook.description && (
          <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{playbook.description}</p>
        )}

        {/* Expanded content */}
        {expanded && (
          <div className="mt-4 space-y-4 pt-4 border-t border-border">
            {playbook.entry_rules && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-success mb-2">Entry Rules</h4>
                <pre className="text-sm text-foreground/80 whitespace-pre-wrap font-mono bg-secondary/30 rounded-lg p-3">
                  {playbook.entry_rules}
                </pre>
              </div>
            )}
            {playbook.exit_rules && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-destructive mb-2">Exit Rules</h4>
                <pre className="text-sm text-foreground/80 whitespace-pre-wrap font-mono bg-secondary/30 rounded-lg p-3">
                  {playbook.exit_rules}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
