import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Trash2, ChevronDown, ChevronUp, FileText, Plus, Image as ImageIcon, Crosshair } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AddSetupDialog } from "./AddSetupDialog";

interface Playbook {
  id: string;
  name: string;
  description: string | null;
  documentation_notes: string | null;
  file_urls: string[] | null;
  is_purchased: boolean;
  created_at: string;
}

interface Setup {
  id: string;
  name: string;
  description: string | null;
  playbook_id: string;
}

interface PlaybookCardProps {
  playbook: Playbook;
  onDeleted: () => void;
}

export function PlaybookCard({ playbook, onDeleted }: PlaybookCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [setups, setSetups] = useState<Setup[]>([]);
  const [addSetupOpen, setAddSetupOpen] = useState(false);

  const fetchSetups = async () => {
    const { data, error } = await supabase
      .from("playbook_setups")
      .select("*")
      .eq("playbook_id", playbook.id)
      .order("created_at", { ascending: true });
    if (!error && data) setSetups(data);
  };

  useEffect(() => {
    if (expanded) fetchSetups();
  }, [expanded]);

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

  const handleDeleteSetup = async (setupId: string) => {
    const { error } = await supabase.from("playbook_setups").delete().eq("id", setupId);
    if (error) {
      toast.error("Failed to delete setup");
    } else {
      toast.success("Setup removed");
      fetchSetups();
    }
  };

  const fileCount = playbook.file_urls?.length || 0;

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
                {fileCount > 0 && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {fileCount} file{fileCount !== 1 ? 's' : ''}
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
            {/* Documentation notes */}
            {playbook.documentation_notes && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Documentation Notes</h4>
                <pre className="text-sm text-foreground/80 whitespace-pre-wrap font-mono bg-secondary/30 rounded-lg p-3">
                  {playbook.documentation_notes}
                </pre>
              </div>
            )}

            {/* Uploaded files */}
            {playbook.file_urls && playbook.file_urls.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Attached Files</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {playbook.file_urls.map((url, i) => {
                    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
                    return (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30 border border-border hover:border-primary/30 transition-colors text-sm text-foreground/70 hover:text-foreground"
                      >
                        {isImage ? <ImageIcon className="h-4 w-4 flex-shrink-0" /> : <FileText className="h-4 w-4 flex-shrink-0" />}
                        <span className="truncate">File {i + 1}</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Setups section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Crosshair className="h-3.5 w-3.5" />
                  Setups ({setups.length})
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs gap-1 text-primary hover:text-primary"
                  onClick={() => setAddSetupOpen(true)}
                >
                  <Plus className="h-3 w-3" />
                  Add Setup
                </Button>
              </div>

              {setups.length === 0 ? (
                <p className="text-xs text-muted-foreground italic py-2">
                  No setups yet. Add setups to link trades to this playbook.
                </p>
              ) : (
                <div className="space-y-2">
                  {setups.map((setup) => (
                    <div
                      key={setup.id}
                      className="flex items-start justify-between gap-2 p-2.5 rounded-lg bg-secondary/20 border border-border"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">{setup.name}</p>
                        {setup.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{setup.description}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive flex-shrink-0"
                        onClick={() => handleDeleteSetup(setup.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <AddSetupDialog
        open={addSetupOpen}
        onOpenChange={setAddSetupOpen}
        playbookId={playbook.id}
        onCreated={fetchSetups}
      />
    </Card>
  );
}
