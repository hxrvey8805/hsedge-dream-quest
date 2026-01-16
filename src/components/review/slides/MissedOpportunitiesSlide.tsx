import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, X, ImagePlus, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MissedOpportunitiesSlideProps {
  content: string;
  screenshots: string[];
  onContentChange: (content: string) => void;
  onScreenshotsChange: (screenshots: string[]) => void;
}

export const MissedOpportunitiesSlide = ({
  content,
  screenshots,
  onContentChange,
  onScreenshotsChange,
}: MissedOpportunitiesSlideProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("You must be logged in");
      setIsUploading(false);
      return;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/missed-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('review-screenshots')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('review-screenshots')
        .getPublicUrl(fileName);

      onScreenshotsChange([...screenshots, publicUrl]);
      toast.success("Screenshot uploaded!");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload screenshot");
    } finally {
      setIsUploading(false);
    }
  };

  const removeScreenshot = (index: number) => {
    onScreenshotsChange(screenshots.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 text-center justify-center">
        <AlertTriangle className="w-8 h-8 text-yellow-500" />
        <h3 className="text-2xl font-bold">Missed Opportunities</h3>
      </div>
      
      <p className="text-center text-muted-foreground">
        Document setups you identified but didn't take, or trades you should have seen.
      </p>

      {/* Screenshots section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Screenshots (Optional)</Label>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <ImagePlus className="w-4 h-4 mr-2" />
            {isUploading ? "Uploading..." : "Add Screenshot"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {screenshots.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {screenshots.map((url, index) => (
              <div key={index} className="relative group">
                <img
                  src={url}
                  alt={`Missed opportunity ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border"
                />
                <button
                  onClick={() => removeScreenshot(index)}
                  className="absolute top-1 right-1 p-1 rounded-full bg-destructive text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label className="text-base font-semibold">Notes</Label>
        <Textarea
          placeholder="What setups did you miss? Why didn't you take them? What were the signals you should have noticed?"
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          className="min-h-[200px] resize-none"
        />
      </div>
    </div>
  );
};
