import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BookOpen, Save, Plus, X, Crosshair, Upload, FileText, ExternalLink } from "lucide-react";

interface InlineSetup {
  name: string;
  description: string;
}

interface CreatePlaybookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

const TEMPLATE_URL = "https://docs.google.com/document/d/1JR-0PZwYrl5HjD16oUFnyp4xxxzGG5ft2at0ono36Ws/edit?usp=sharing";

export function CreatePlaybookDialog({ open, onOpenChange, onCreated }: CreatePlaybookDialogProps) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [documentationNotes, setDocumentationNotes] = useState("");
  const [setups, setSetups] = useState<InlineSetup[]>([]);
  const [newSetupName, setNewSetupName] = useState("");
  const [newSetupDesc, setNewSetupDesc] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const addSetup = () => {
    if (!newSetupName.trim()) return;
    setSetups(prev => [...prev, { name: newSetupName.trim(), description: newSetupDesc.trim() }]);
    setNewSetupName("");
    setNewSetupDesc("");
  };

  const removeSetup = (index: number) => {
    setSetups(prev => prev.filter((_, i) => i !== index));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async (userId: string): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of files) {
      const filePath = `${userId}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("playbook-files").upload(filePath, file);
      if (error) { console.error("Upload error:", error); continue; }
      const { data: { publicUrl } } = supabase.storage.from("playbook-files").getPublicUrl(filePath);
      urls.push(publicUrl);
    }
    return urls;
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Playbook name is required");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let fileUrls: string[] = [];
      if (files.length > 0) {
        setUploading(true);
        fileUrls = await uploadFiles(user.id);
        setUploading(false);
      }

      const { data: playbook, error } = await supabase.from("playbooks").insert({
        user_id: user.id,
        name: name.trim(),
        documentation_notes: documentationNotes.trim() || null,
        file_urls: fileUrls.length > 0 ? fileUrls : null,
      }).select("id").single();

      if (error) throw error;

      if (setups.length > 0 && playbook) {
        const setupRows = setups.map(s => ({
          user_id: user.id,
          playbook_id: playbook.id,
          name: s.name,
          description: s.description || null,
        }));
        await supabase.from("playbook_setups").insert(setupRows);
      }

      toast.success("Playbook added!");
      setName("");
      setDocumentationNotes("");
      setSetups([]);
      setFiles([]);
      onOpenChange(false);
      onCreated();
    } catch (err: any) {
      toast.error(err.message || "Failed to create playbook");
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <BookOpen className="h-5 w-5 text-primary" />
            Add Playbook
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Template link */}
          <a
            href={TEMPLATE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-primary hover:text-primary/80 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Use our playbook template to get started
          </a>

          {/* Name */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Playbook Name *</Label>
            <Input
              placeholder="e.g. Morning Momentum Strategy"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-secondary/50 border-border"
            />
          </div>

          {/* Documentation Notes */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Documentation Notes</Label>
            <Textarea
              placeholder="Add your strategy documentation, rules, notes, observations..."
              value={documentationNotes}
              onChange={(e) => setDocumentationNotes(e.target.value)}
              className="bg-secondary/50 border-border min-h-[100px] font-mono text-sm"
            />
          </div>

          {/* File uploads */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Attach Files (PDFs, Images, Screenshots)</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/30 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="hidden"
                id="playbook-file-upload"
              />
              <label htmlFor="playbook-file-upload" className="cursor-pointer">
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Click to upload files</p>
                <p className="text-xs text-muted-foreground/60 mt-1">PDFs, images, screenshots</p>
              </label>
            </div>

            {files.length > 0 && (
              <div className="space-y-2 mt-2">
                {files.map((file, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-secondary/30 border border-border">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm text-foreground truncate">{file.name}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive flex-shrink-0" onClick={() => removeFile(i)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Inline Setups */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-1.5">
              <Crosshair className="h-3.5 w-3.5 text-primary" />
              Setups
            </Label>

            {setups.length > 0 && (
              <div className="space-y-2">
                {setups.map((s, i) => (
                  <div key={i} className="flex items-start justify-between gap-2 p-2.5 rounded-lg bg-secondary/20 border border-border">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{s.name}</p>
                      {s.description && <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>}
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive flex-shrink-0" onClick={() => removeSetup(i)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Input
                placeholder="Setup name"
                value={newSetupName}
                onChange={(e) => setNewSetupName(e.target.value)}
                className="bg-secondary/50 border-border text-sm"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSetup())}
              />
              <Button type="button" variant="outline" size="sm" className="shrink-0 gap-1" onClick={addSetup} disabled={!newSetupName.trim()}>
                <Plus className="h-3 w-3" /> Add
              </Button>
            </div>
            <Input
              placeholder="Setup description (optional)"
              value={newSetupDesc}
              onChange={(e) => setNewSetupDesc(e.target.value)}
              className="bg-secondary/50 border-border text-sm"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-5"
          >
            <Save className="h-4 w-4 mr-2" />
            {uploading ? "Uploading files..." : loading ? "Saving..." : "Add Playbook"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
