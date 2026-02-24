import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, X, MonitorUp, AlertTriangle, Maximize2, Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ImageEditorDialog, type Marker } from "../ImageEditorDialog";

export interface MissedOpportunityScreenshot {
  id: string;
  screenshot_url: string;
  markers: Marker[];
}

interface MissedOpportunitiesSlideProps {
  content: string;
  screenshots: MissedOpportunityScreenshot[];
  onContentChange: (content: string) => void;
  onScreenshotsChange: (screenshots: MissedOpportunityScreenshot[]) => void;
}

const MISSED_MARKER_TYPES = [
  { type: 'entry' as const, label: 'Entry', color: '#3b82f6' },
  { type: 'stop_loss' as const, label: 'Stop Loss', color: '#ef4444' },
  { type: 'take_profit' as const, label: 'Take Profit', color: '#10b981' },
];

export const MissedOpportunitiesSlide = ({
  content,
  screenshots,
  onContentChange,
  onScreenshotsChange,
}: MissedOpportunitiesSlideProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewingIndex, setViewingIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadScreenshot = async (blob: Blob, ext: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("You must be logged in");
      return null;
    }

    const fileName = `${user.id}/missed-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from('review-screenshots')
      .upload(fileName, blob);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('review-screenshots')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleScreenCapture = async () => {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      toast.error("Screen capture not supported. Please use upload instead.");
      return;
    }

    setIsCapturing(true);
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: "window" } as any,
        audio: false,
      });

      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);

      stream.getTracks().forEach(track => track.stop());

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => {
          if (b) resolve(b);
          else reject(new Error("Failed to create image"));
        }, 'image/png');
      });

      const publicUrl = await uploadScreenshot(blob, 'png');
      if (publicUrl) {
        onScreenshotsChange([...screenshots, {
          id: `missed-${Date.now()}`,
          screenshot_url: publicUrl,
          markers: [],
        }]);
        toast.success("Screenshot captured!");
      }
    } catch (error: any) {
      if (error.name !== 'AbortError' && error.name !== 'NotAllowedError') {
        toast.error(error.message || "Failed to capture screen");
      }
    } finally {
      setIsCapturing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop() || 'png';
      const publicUrl = await uploadScreenshot(file, fileExt);
      if (publicUrl) {
        onScreenshotsChange([...screenshots, {
          id: `missed-${Date.now()}`,
          screenshot_url: publicUrl,
          markers: [],
        }]);
        toast.success("Screenshot uploaded!");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to upload screenshot");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeScreenshot = (index: number) => {
    onScreenshotsChange(screenshots.filter((_, i) => i !== index));
  };

  const openEditor = (index: number) => {
    setEditingIndex(index);
    setEditorOpen(true);
  };

  const handleEditorSave = (newImageUrl: string, newMarkers: Marker[]) => {
    if (editingIndex === null) return;
    const updated = [...screenshots];
    updated[editingIndex] = {
      ...updated[editingIndex],
      screenshot_url: newImageUrl,
      markers: newMarkers,
    };
    onScreenshotsChange(updated);
  };

  const getLineColor = (type: string) => {
    const found = MISSED_MARKER_TYPES.find(m => m.type === type);
    return found?.color || '#3b82f6';
  };

  const getMarkerLabel = (type: string) => {
    const found = MISSED_MARKER_TYPES.find(m => m.type === type);
    return found?.label || type;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 text-center justify-center">
        <AlertTriangle className="w-8 h-8 text-yellow-500" />
        <h3 className="text-2xl font-bold">Missed Opportunities</h3>
      </div>
      
      <p className="text-center text-muted-foreground">
        Document setups you identified but didn't take. Capture screenshots and mark where you could have entered.
      </p>

      {/* Screenshot controls */}
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Chart Screenshots</Label>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleScreenCapture}
            disabled={isCapturing || isUploading}
          >
            <MonitorUp className="w-4 h-4 mr-1" />
            {isCapturing ? "..." : "Capture"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isCapturing}
          >
            <Upload className="w-4 h-4 mr-1" />
            {isUploading ? "..." : "Upload"}
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* Screenshots grid with markers overlay */}
      {screenshots.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {screenshots.map((item, index) => (
            <div key={item.id} className="relative group rounded-lg border overflow-hidden bg-card">
              <div className="relative">
                <img
                  src={item.screenshot_url}
                  alt={`Missed opportunity ${index + 1}`}
                  className="w-full h-48 object-cover"
                />
                {/* Render markers on the thumbnail */}
                {item.markers.map((marker) => {
                  const lineColor = getLineColor(marker.type);
                  const shouldUseLineMode = marker.useLineMode !== undefined ? marker.useLineMode : true;

                  if (shouldUseLineMode) {
                    return (
                      <div
                        key={marker.id}
                        className="absolute pointer-events-none"
                        style={{
                          left: 0,
                          right: 0,
                          top: `${marker.y}%`,
                          transform: 'translateY(-50%)',
                        }}
                      >
                        <div
                          className="w-full"
                          style={{
                            height: 2,
                            backgroundColor: lineColor,
                          }}
                        />
                        <div
                          className="absolute px-1 py-0.5 rounded text-white font-medium"
                          style={{
                            left: `${marker.labelX ?? marker.x}%`,
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                            backgroundColor: lineColor,
                            fontSize: 9,
                          }}
                        >
                          {getMarkerLabel(marker.type)}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={marker.id}
                      className="absolute w-3 h-3 rounded-full border border-white"
                      style={{
                        left: `${marker.x}%`,
                        top: `${marker.y}%`,
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: lineColor,
                      }}
                    />
                  );
                })}

                {/* Action overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => openEditor(index)}
                    className="h-8"
                  >
                    <Pencil className="w-3 h-3 mr-1" />
                    Edit Lines
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => { setViewingIndex(index); setViewerOpen(true); }}
                    className="h-8"
                  >
                    <Maximize2 className="w-3 h-3" />
                  </Button>
                  <button
                    onClick={() => removeScreenshot(index)}
                    className="p-1.5 rounded-full bg-destructive text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {screenshots.length === 0 && (
        <div className="border border-dashed rounded-lg p-8 text-center text-muted-foreground">
          <MonitorUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Capture or upload a chart screenshot to mark missed entries</p>
        </div>
      )}

      {/* Notes */}
      <div className="space-y-2">
        <Label className="text-base font-semibold">Notes</Label>
        <Textarea
          placeholder="What setups did you miss? Why didn't you take them? What were the signals you should have noticed?"
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          className="min-h-[150px] resize-none"
        />
      </div>

      {/* Image Editor Dialog */}
      {editingIndex !== null && screenshots[editingIndex] && (
        <ImageEditorDialog
          open={editorOpen}
          onOpenChange={(open) => {
            setEditorOpen(open);
            if (!open) setEditingIndex(null);
          }}
          imageUrl={screenshots[editingIndex].screenshot_url}
          markers={screenshots[editingIndex].markers}
          onSave={handleEditorSave}
          tradeId={`missed-${editingIndex}`}
        />
      )}

      {/* Full-size Image Viewer */}
      {viewingIndex !== null && screenshots[viewingIndex] && (
        <Dialog open={viewerOpen} onOpenChange={(open) => { setViewerOpen(open); if (!open) setViewingIndex(null); }}>
          <DialogContent className="max-w-5xl max-h-[90vh] p-2">
            <DialogTitle className="sr-only">Screenshot Preview</DialogTitle>
            <div className="relative">
              <img
                src={screenshots[viewingIndex].screenshot_url}
                alt="Full size"
                className="w-full h-auto max-h-[85vh] object-contain"
              />
              {screenshots[viewingIndex].markers.map((marker) => {
                const lineColor = getLineColor(marker.type);
                const shouldUseLineMode = marker.useLineMode !== undefined ? marker.useLineMode : true;
                if (shouldUseLineMode) {
                  return (
                    <div
                      key={marker.id}
                      className="absolute pointer-events-none"
                      style={{ left: 0, right: 0, top: `${marker.y}%`, transform: 'translateY(-50%)' }}
                    >
                      <div className="w-full" style={{ height: 2, backgroundColor: lineColor }} />
                      <div
                        className="absolute px-1.5 py-0.5 rounded text-white text-xs font-medium"
                        style={{
                          left: `${marker.labelX ?? marker.x}%`,
                          top: '50%',
                          transform: 'translate(-50%, -50%)',
                          backgroundColor: lineColor,
                        }}
                      >
                        {getMarkerLabel(marker.type)}
                      </div>
                    </div>
                  );
                }
                return (
                  <div
                    key={marker.id}
                    className="absolute w-4 h-4 rounded-full border-2 border-white"
                    style={{
                      left: `${marker.x}%`,
                      top: `${marker.y}%`,
                      transform: 'translate(-50%, -50%)',
                      backgroundColor: lineColor,
                    }}
                  />
                );
              })}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
