import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, Image as ImageIcon, MonitorUp, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Trade {
  id: string;
  symbol: string | null;
  pair: string | null;
  buy_sell: string;
  entry_price: number | null;
  exit_price: number | null;
  profit: number | null;
  outcome: string;
  pips: number | null;
  time_opened: string | null;
  time_closed: string | null;
}

interface Marker {
  id: string;
  type: 'entry' | 'stop_loss' | 'take_profit';
  x: number;
  y: number;
}

interface ScreenshotSlot {
  id: string;
  label: string;
  screenshot_url: string | null;
  markers: Marker[];
}

interface TradeSlideData {
  trade_id: string;
  screenshot_url: string | null;
  markers: Marker[];
  reflection: string;
  screenshot_slots?: ScreenshotSlot[];
}

interface TradeReviewSlideProps {
  trade: Trade;
  slideData: TradeSlideData;
  onUpdate: (updates: Partial<TradeSlideData>) => void;
}

// Simpler, more reliable upload with no complex fallbacks
const MAX_UPLOAD_SIDE = 1200;

const createScaledCanvas = (sourceWidth: number, sourceHeight: number, maxSide = MAX_UPLOAD_SIDE) => {
  const maxSourceSide = Math.max(sourceWidth, sourceHeight);
  const scale = maxSourceSide > maxSide ? maxSide / maxSourceSide : 1;
  const width = Math.max(1, Math.round(sourceWidth * scale));
  const height = Math.max(1, Math.round(sourceHeight * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

const dataUrlToBlob = (dataUrl: string): Blob => {
  const [meta, data] = dataUrl.split(",");
  const contentType = meta?.match(/data:(.*);base64/)?.[1] || "application/octet-stream";
  const binaryString = atob(data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return new Blob([bytes], { type: contentType });
};

const withTimeout = async <T,>(promise: Promise<T>, ms: number, label: string): Promise<T> => {
  let timeoutId: number | undefined;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = window.setTimeout(() => reject(new Error(`${label} timed out`)), ms);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) window.clearTimeout(timeoutId);
  }
};

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") return reject(new Error("Failed to read file"));
      const base64 = result.split(",")[1] ?? "";
      if (!base64) return reject(new Error("Failed to encode image"));
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(blob);
  });
};

// canvas.toBlob can hang in some browser/device combos (seen as stuck on "Compressing...").
// This adds a deterministic fallback via toDataURL.
const canvasToBlob = async (
  canvas: HTMLCanvasElement,
  type: "image/jpeg" | "image/png" | "image/webp" = "image/jpeg",
  quality = 0.8
): Promise<Blob> => {
  const viaToBlob = new Promise<Blob>((resolve, reject) => {
    if (!canvas.toBlob) return reject(new Error("toBlob not supported"));
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Failed to create blob"))),
      type,
      quality
    );
  });

  try {
    return await withTimeout(viaToBlob, 2500, "Image compression");
  } catch {
    const dataUrl = canvas.toDataURL(type, quality);
    return dataUrlToBlob(dataUrl);
  }
};

export const TradeReviewSlide = ({ trade, slideData, onUpdate }: TradeReviewSlideProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Try to find unlinked screenshots from storage if none linked
  const [unlinkedUrl, setUnlinkedUrl] = useState<string | null>(null);
  
  useEffect(() => {
    if (slideData.screenshot_url) {
      setUnlinkedUrl(null);
      return;
    }

    let cancelled = false;
    const findUnlinked = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        const { data: objects } = await supabase.storage
          .from('review-screenshots')
          .list(user.id, { limit: 50 });
        
        if (!objects?.length) return;
        
        // Find most recent file for this trade
        const match = objects
          .filter(o => o.name?.includes(trade.id))
          .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))[0];
        
        if (match && !cancelled) {
          const { data } = supabase.storage
            .from('review-screenshots')
            .getPublicUrl(`${user.id}/${match.name}`);
          setUnlinkedUrl(data.publicUrl);
        }
      } catch (e) {
        console.error('Error finding unlinked screenshot:', e);
      }
    };
    
    findUnlinked();
    return () => { cancelled = true; };
  }, [slideData.screenshot_url, trade.id]);

  const displayUrl = slideData.screenshot_url || unlinkedUrl;

  // Simple direct upload to storage
  const uploadToStorage = async (blob: Blob, ext: string): Promise<string> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('You must be logged in');

    const slotId = "main";
    const safeExt = (ext || "jpg").toLowerCase();
    const fileName = `${user.id}/${trade.id}-${slotId}-${Date.now()}.${safeExt}`;

    const contentType =
      safeExt === "jpg" || safeExt === "jpeg"
        ? "image/jpeg"
        : safeExt === "png"
          ? "image/png"
          : safeExt === "webp"
            ? "image/webp"
            : `image/${safeExt}`;

    setUploadProgress("Uploading...");

    // 1) Try direct storage upload (fast path)
    try {
      const uploadPromise = supabase.storage
        .from("review-screenshots")
        .upload(fileName, blob, { contentType, upsert: true });

      const { error: uploadError } = await withTimeout(uploadPromise, 20000, "Upload");

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("review-screenshots").getPublicUrl(fileName);
      if (!data.publicUrl) throw new Error("Failed to get public URL");
      return data.publicUrl;
    } catch (err: any) {
      console.warn("Direct upload failed; falling back to backend upload", err);

      // 2) Fallback: backend upload (more reliable across browser/network quirks)
      const base64 = await blobToBase64(blob);
      const invokePromise = supabase.functions.invoke("upload-review-screenshot", {
        body: {
          tradeId: trade.id,
          slotId,
          ext: safeExt,
          contentType,
          base64,
        },
      });

      const { data, error } = await withTimeout(invokePromise, 20000, "Backend upload");
      if (error) throw error;
      const publicUrl = (data as any)?.publicUrl as string | undefined;
      if (!publicUrl) throw new Error("Backend upload did not return a URL");
      return publicUrl;
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress('Processing image...');

    try {
      let blob: Blob = file;
      let ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';

      // Compress if it's an image
      if (file.type.startsWith('image/') && file.type !== 'image/svg+xml') {
        const url = URL.createObjectURL(file);
        try {
          const img = new Image();
          img.src = url;
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject(new Error('Failed to load image'));
          });

          const canvas = createScaledCanvas(img.naturalWidth, img.naturalHeight);
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            blob = await canvasToBlob(canvas, 'image/jpeg', 0.8);
            ext = 'jpg';
          }
        } finally {
          URL.revokeObjectURL(url);
        }
      }

      const publicUrl = await uploadToStorage(blob, ext);
      onUpdate({ screenshot_url: publicUrl });
      toast.success('Screenshot uploaded!');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload screenshot');
    } finally {
      setIsUploading(false);
      setUploadProgress('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleScreenCapture = async () => {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      toast.error('Screen capture not supported. Please use file upload.');
      return;
    }

    setIsCapturing(true);
    setUploadProgress('Starting capture...');
    let stream: MediaStream | null = null;

    try {
      stream = await navigator.mediaDevices.getDisplayMedia({
        video: { width: { ideal: 1920 }, height: { ideal: 1080 } } as any,
        audio: false,
      });

      const track = stream.getVideoTracks()[0];
      if (!track) throw new Error('No video track');

      setUploadProgress('Capturing frame...');

      // Use video element to capture a frame
      const video = document.createElement('video');
      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;

      // Wait for metadata so dimensions are reliable
      await new Promise<void>((resolve, reject) => {
        const timeout = window.setTimeout(() => reject(new Error("Capture setup timed out")), 3000);
        video.onloadedmetadata = () => {
          window.clearTimeout(timeout);
          resolve();
        };
        video.onerror = () => {
          window.clearTimeout(timeout);
          reject(new Error("Failed to initialize capture"));
        };
      });

      await video.play();

      if (video.videoWidth === 0 || video.videoHeight === 0) {
        throw new Error("Invalid video dimensions");
      }

      const canvas = createScaledCanvas(video.videoWidth, video.videoHeight);
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context error');
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Stop stream immediately after capture
      stream.getTracks().forEach(t => t.stop());
      stream = null;

      setUploadProgress('Compressing...');
      const blob = await canvasToBlob(canvas, 'image/jpeg', 0.8);
      
      const publicUrl = await uploadToStorage(blob, 'jpg');
      onUpdate({ screenshot_url: publicUrl });
      toast.success('Screenshot captured!');
    } catch (error: any) {
      if (error.name === 'NotAllowedError') {
        // User cancelled - no error needed
      } else {
        console.error('Capture error:', error);
        toast.error(error.message || 'Failed to capture screenshot');
      }
    } finally {
      if (stream) stream.getTracks().forEach(t => t.stop());
      setIsCapturing(false);
      setUploadProgress('');
    }
  };

  const handleDeleteScreenshot = () => {
    onUpdate({ screenshot_url: null, markers: [] });
    setUnlinkedUrl(null);
    toast.success('Screenshot removed');
  };

  const handleLinkUnlinked = () => {
    if (unlinkedUrl) {
      onUpdate({ screenshot_url: unlinkedUrl });
      toast.success('Screenshot linked! Save the review to persist.');
    }
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Screenshot Section */}
      <div className="bg-card border rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <Label className="text-base font-semibold">Trade Screenshot</Label>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleScreenCapture}
              disabled={isCapturing || isUploading}
            >
              <MonitorUp className="w-4 h-4 mr-1" />
              {isCapturing ? 'Capturing...' : 'Capture'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isCapturing || isUploading}
            >
              <Upload className="w-4 h-4 mr-1" />
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>

        {uploadProgress && (
          <div className="text-sm text-muted-foreground animate-pulse">
            {uploadProgress}
          </div>
        )}

        {displayUrl ? (
          <div className="relative group">
            <img
              src={displayUrl}
              alt="Trade screenshot"
              className="w-full max-h-[400px] object-contain rounded-md border bg-background"
              loading="lazy"
            />
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
              {!slideData.screenshot_url && unlinkedUrl && (
                <Button size="sm" variant="secondary" onClick={handleLinkUnlinked}>
                  Link to Trade
                </Button>
              )}
              <Button size="sm" variant="destructive" onClick={handleDeleteScreenshot}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            {!slideData.screenshot_url && unlinkedUrl && (
              <p className="text-xs text-muted-foreground mt-2">
                Found unlinked screenshot. Click "Link to Trade" to save it.
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
            <ImageIcon className="w-12 h-12 mb-2 opacity-40" />
            <p className="text-sm">Capture or upload a screenshot</p>
          </div>
        )}
      </div>

      {/* Trade Details */}
      <div className="bg-card border rounded-lg p-4 space-y-3">
        <h4 className="font-semibold text-lg">
          {trade.symbol || trade.pair || 'Unknown'}
          <span className={`ml-2 text-sm ${trade.buy_sell === 'Buy' ? 'text-emerald-500' : 'text-destructive'}`}>
            {trade.buy_sell}
          </span>
        </h4>

        {(trade.time_opened || trade.time_closed) && (
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Time:</span>{' '}
            {trade.time_opened || 'N/A'} → {trade.time_closed || 'N/A'}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground">Entry:</span>
            <span className="ml-2 font-mono">{trade.entry_price?.toFixed(5) || 'N/A'}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Exit:</span>
            <span className="ml-2 font-mono">{trade.exit_price?.toFixed(5) || 'N/A'}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Pips:</span>
            <span className={`ml-2 font-mono ${(trade.pips || 0) >= 0 ? 'text-emerald-500' : 'text-destructive'}`}>
              {trade.pips?.toFixed(1) || 'N/A'}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">P&L:</span>
            <span className={`ml-2 font-mono ${(trade.profit || 0) >= 0 ? 'text-emerald-500' : 'text-destructive'}`}>
              ${trade.profit?.toFixed(2) || 'N/A'}
            </span>
          </div>
        </div>

        <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
          trade.outcome === 'Win' ? 'bg-emerald-500/20 text-emerald-500' :
          trade.outcome === 'Loss' ? 'bg-destructive/20 text-destructive' :
          'bg-yellow-500/20 text-yellow-500'
        }`}>
          {trade.outcome}
        </div>
      </div>

      {/* Reflection */}
      <div className="flex flex-col flex-1 min-h-0">
        <Label className="text-base font-semibold mb-2">Trade Reflection</Label>
        <Textarea
          placeholder="What did you do well? What could you improve? How did you feel during this trade?"
          value={slideData.reflection}
          onChange={(e) => onUpdate({ reflection: e.target.value })}
          className="flex-1 min-h-[150px] resize-none"
        />
      </div>
    </div>
  );
};
