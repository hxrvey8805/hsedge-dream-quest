import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Upload, ArrowUpCircle, Target, X, Image as ImageIcon, MonitorUp, Maximize2, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ImageEditorDialog, Marker } from "../ImageEditorDialog";

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

const DEFAULT_TIMEFRAMES = ['1M', '5M', '15M', '1H', '4H', 'D'];

const MARKER_TYPES = [
  { type: 'entry' as const, label: 'Entry', icon: ArrowUpCircle, color: 'text-blue-500 bg-blue-500/20' },
  { type: 'stop_loss' as const, label: 'Stop Loss', icon: X, color: 'text-destructive bg-destructive/20' },
  { type: 'take_profit' as const, label: 'Take Profit', icon: Target, color: 'text-emerald-500 bg-emerald-500/20' },
];

const withTimeout = async <T,>(promise: Promise<T>, ms: number, label: string): Promise<T> => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error(`${label} timed out. Please try again.`)), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
};

const getUserIdFromLocalStorage = (): string | null => {
  try {
    if (typeof window === 'undefined') return null;

    const tryExtractUserId = (value: unknown): string | null => {
      if (!value) return null;
      const userId =
        (value as any)?.user?.id ??
        (value as any)?.currentSession?.user?.id ??
        (value as any)?.session?.user?.id ??
        (value as any)?.data?.session?.user?.id;

      return typeof userId === 'string' && userId.length > 0 ? userId : null;
    };

    // Prefer a deterministic key when available, but fall back to scanning.
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
    const preferredKey = projectId ? `sb-${projectId}-auth-token` : null;
    const candidateKeys = [
      ...(preferredKey ? [preferredKey] : []),
      ...Object.keys(window.localStorage).filter((k) => k.startsWith('sb-') && k.endsWith('-auth-token')),
    ];

    for (const key of candidateKeys) {
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      try {
        const parsed = JSON.parse(raw);
        const userId = tryExtractUserId(parsed);
        if (userId) return userId;
      } catch {
        // ignore and continue
      }
    }

    return null;
  } catch {
    return null;
  }
};

const getUserId = async (): Promise<string> => {
  // Prefer the cached session (sync, avoids any network/refresh edge cases).
  const cached = getUserIdFromLocalStorage();
  if (cached) return cached;

  // getSession *should* resolve quickly from local storage, but if it ever hangs,
  // we must not leave the UI stuck on “Uploading…”.
  const { data, error } = await withTimeout(supabase.auth.getSession(), 10000, "Authentication");
  if (error) throw error;

  const userId = data.session?.user?.id;
  if (userId) return userId;

  // Last resort: validate the token by fetching the user.
  const userRes = await withTimeout(supabase.auth.getUser(), 10000, "Authentication");
  if (userRes.error) throw userRes.error;
  if (!userRes.data.user?.id) throw new Error("You must be logged in");
  return userRes.data.user.id;
};

const canvasToBlob = (canvas: HTMLCanvasElement, type = 'image/png', quality?: number) => {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Failed to create image'))), type, quality);
  });
};

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image'));
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') return reject(new Error('Failed to read image'));
      const comma = result.indexOf(',');
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.readAsDataURL(blob);
  });
};

type EncodedImage = { blob: Blob; contentType: string; ext: string };

const createScaledCanvas = (sourceWidth: number, sourceHeight: number, maxSide = 1920) => {
  const maxSourceSide = Math.max(sourceWidth, sourceHeight);
  const scale = maxSourceSide > maxSide ? maxSide / maxSourceSide : 1;
  const width = Math.max(1, Math.round(sourceWidth * scale));
  const height = Math.max(1, Math.round(sourceHeight * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

const encodeCanvas = async (canvas: HTMLCanvasElement): Promise<EncodedImage> => {
  // Prefer smaller formats to avoid long request-body uploads (base64 JSON) that can time out.
  // Note: Some browsers (notably Safari) don't support webp encoding, so keep jpeg as a strong fallback.
  const candidates: Array<{ type: string; ext: string; quality?: number }> = [
    { type: 'image/webp', ext: 'webp', quality: 0.8 },
    { type: 'image/jpeg', ext: 'jpg', quality: 0.8 },
    { type: 'image/png', ext: 'png' },
  ];

  let lastError: unknown;
  for (const c of candidates) {
    try {
      const blob = await canvasToBlob(canvas, c.type, c.quality);
      return { blob, contentType: c.type, ext: c.ext };
    } catch (e) {
      lastError = e;
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Failed to encode image');
};

export const TradeReviewSlide = ({ trade, slideData, onUpdate }: TradeReviewSlideProps) => {
  // Keep screenshots reasonably small so the browser can POST them quickly.
  // If the request body upload stalls, the backend function never receives the request, causing timeouts.
  const MAX_UPLOAD_SIDE = 1440;
  // Initialize slots from slideData or create default with legacy data
  const [slots, setSlots] = useState<ScreenshotSlot[]>(() => {
    if (slideData.screenshot_slots && slideData.screenshot_slots.length > 0) {
      return slideData.screenshot_slots;
    }
    // Migrate legacy single screenshot to first slot
    return [{
      id: 'slot-1',
      label: 'Entry TF',
      screenshot_url: slideData.screenshot_url,
      markers: slideData.markers || []
    }];
  });
  
  const [activeSlotId, setActiveSlotId] = useState<string>(slots[0]?.id || 'slot-1');
  const [isUploading, setIsUploading] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [editingSlotLabel, setEditingSlotLabel] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeSlot = slots.find(s => s.id === activeSlotId) || slots[0];

  const updateSlots = (newSlots: ScreenshotSlot[]) => {
    setSlots(newSlots);
    // Update parent with new slots and also maintain legacy fields for backward compatibility
    const firstSlot = newSlots[0];
    onUpdate({ 
      screenshot_slots: newSlots,
      screenshot_url: firstSlot?.screenshot_url || null,
      markers: firstSlot?.markers || []
    });
  };

  const updateActiveSlot = (updates: Partial<ScreenshotSlot>) => {
    const newSlots = slots.map(s => 
      s.id === activeSlotId ? { ...s, ...updates } : s
    );
    updateSlots(newSlots);
  };

  const addSlot = () => {
    const newSlot: ScreenshotSlot = {
      id: `slot-${Date.now()}`,
      label: DEFAULT_TIMEFRAMES[slots.length] || `TF ${slots.length + 1}`,
      screenshot_url: null,
      markers: []
    };
    const newSlots = [...slots, newSlot];
    updateSlots(newSlots);
    setActiveSlotId(newSlot.id);
  };

  const removeSlot = (slotId: string) => {
    if (slots.length <= 1) {
      toast.error("Must have at least one slot");
      return;
    }
    const newSlots = slots.filter(s => s.id !== slotId);
    updateSlots(newSlots);
    if (activeSlotId === slotId) {
      setActiveSlotId(newSlots[0].id);
    }
  };

  const updateSlotLabel = (slotId: string, newLabel: string) => {
    const newSlots = slots.map(s => 
      s.id === slotId ? { ...s, label: newLabel } : s
    );
    updateSlots(newSlots);
    setEditingSlotLabel(null);
  };

  const handleEditorSave = (newImageUrl: string, newMarkers: Marker[]) => {
    updateActiveSlot({ 
      screenshot_url: newImageUrl, 
      markers: newMarkers 
    });
  };

  const handleDeleteScreenshot = () => {
    updateActiveSlot({ 
      screenshot_url: null, 
      markers: [] 
    });
    toast.success("Screenshot deleted");
  };

  const handleScreenCapture = async () => {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      toast.error("Screen capture not supported in this browser. Please use upload instead.");
      return;
    }

    setIsCapturing(true);
    let stream: MediaStream | null = null;
    let videoEl: HTMLVideoElement | null = null;

    try {
      stream = await withTimeout(
        navigator.mediaDevices.getDisplayMedia({
          video: {
            displaySurface: "window",
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          } as any,
          audio: false,
        }),
        15000,
        "Screen capture permission"
      );

      const track = stream.getVideoTracks()[0];
      if (!track) throw new Error("No video track available");

      let blob: Blob | null = null;
      let encoded: EncodedImage | null = null;

      // Try ImageCapture API first (more reliable when available)
      if ('ImageCapture' in window) {
        try {
          const imageCapture = new (window as any).ImageCapture(track);
          const bitmap = await withTimeout(imageCapture.grabFrame(), 8000, "Frame capture") as ImageBitmap;

          const canvas = createScaledCanvas(bitmap.width, bitmap.height, MAX_UPLOAD_SIDE);
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error("Failed to get canvas context");

          ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
          bitmap.close();

          encoded = await withTimeout(encodeCanvas(canvas), 12000, "Image encoding");
          blob = encoded.blob;
        } catch (icError) {
          console.log("ImageCapture failed, falling back to video method:", icError);
        }
      }

      if (!blob || !encoded) {
        // Fallback: video element method
        const video = document.createElement('video');
        videoEl = video;
        video.srcObject = stream;
        video.muted = true;
        video.playsInline = true;
        video.autoplay = true;

        // Some browsers don't reliably fire media events unless the element is in the DOM.
        video.style.position = 'fixed';
        video.style.left = '-9999px';
        video.style.top = '0';
        video.style.width = '1px';
        video.style.height = '1px';
        document.body.appendChild(video);

        // Safari can require an explicit play() for metadata to load.
        try {
          await video.play();
        } catch {
          // ignore; we'll rely on metadata/timeout below
        }

        await withTimeout(
          new Promise<void>((resolve, reject) => {
            const onReady = () => resolve();
            const onErr = () => reject(new Error("Video load failed"));
            video.addEventListener('loadeddata', onReady, { once: true });
            video.addEventListener('error', onErr, { once: true });
          }),
          15000,
          "Video initialization"
        );

        // Give the browser a moment to render a frame
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(undefined))));
        await new Promise((resolve) => setTimeout(resolve, 200));

        if (video.videoWidth === 0 || video.videoHeight === 0) {
          throw new Error("Invalid video dimensions");
        }

        const canvas = createScaledCanvas(video.videoWidth, video.videoHeight, MAX_UPLOAD_SIDE);
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error("Failed to get canvas context");

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        encoded = await withTimeout(encodeCanvas(canvas), 12000, "Image encoding");
        blob = encoded.blob;
      }

      await uploadScreenshot(encoded ?? { blob, contentType: 'image/png', ext: 'png' });
      toast.success("Screenshot captured!");
    } catch (error: any) {
      console.error("Screen capture error:", error);
      if (error?.name !== 'AbortError' && error?.name !== 'NotAllowedError') {
        toast.error(error?.message || "Failed to capture screen");
      }
    } finally {
      if (stream) stream.getTracks().forEach((t) => t.stop());
      if (videoEl) {
        try {
          videoEl.pause();
          videoEl.srcObject = null;
          videoEl.remove();
        } catch {
          // ignore
        }
      }
      setIsCapturing(false);
    }
  };

  const UPLOAD_TIMEOUT_MS = 90000;

  const uploadScreenshot = async (image: EncodedImage) => {
    // Upload via backend function to avoid client-side storage hangs/timeouts.
    const base64 = await withTimeout(blobToBase64(image.blob), 15000, 'Image encoding');
    const { data, error } = await withTimeout(
      supabase.functions.invoke('upload-review-screenshot', {
        body: {
          tradeId: trade.id,
          slotId: activeSlotId,
          ext: image.ext,
          contentType: image.contentType,
          base64,
        },
      }),
      60000,
      'Upload'
    );

    if (error) throw error;
    const publicUrl = (data as any)?.publicUrl as string | undefined;
    if (!publicUrl) throw new Error('Upload failed');

    updateActiveSlot({ screenshot_url: publicUrl });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      // Normalize + compress uploaded images as well (users often upload huge PNGs).
      let encoded: EncodedImage | null = null;
      if (file.type.startsWith('image/') && file.type !== 'image/svg+xml') {
        const url = URL.createObjectURL(file);
        try {
          const img = new window.Image();
          img.decoding = 'async';
          img.src = url;
          await withTimeout(
            new Promise<void>((resolve, reject) => {
              img.onload = () => resolve();
              img.onerror = () => reject(new Error('Failed to load image'));
            }),
            15000,
            'Image decode'
          );
          const canvas = createScaledCanvas(
            img.naturalWidth || img.width,
            img.naturalHeight || img.height,
            MAX_UPLOAD_SIDE
          );
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('Failed to get canvas context');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          encoded = await withTimeout(encodeCanvas(canvas), 15000, 'Image encoding');
        } finally {
          URL.revokeObjectURL(url);
        }
      }

      if (!encoded) {
        // Fallback: upload original file through the same backend function.
        const ext = (file.name.split('.').pop() || 'png').toLowerCase();
        encoded = { blob: file, contentType: file.type || 'image/png', ext };
      }

      await uploadScreenshot(encoded);
      toast.success("Screenshot uploaded!");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error?.message || "Failed to upload screenshot");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const getMarkerColor = (type: 'entry' | 'stop_loss' | 'take_profit') => {
    switch (type) {
      case 'entry': return 'bg-blue-500 border-blue-300';
      case 'stop_loss': return 'bg-destructive border-red-300';
      case 'take_profit': return 'bg-emerald-500 border-emerald-300';
    }
  };

  const getMarkerIcon = (type: 'entry' | 'stop_loss' | 'take_profit', size: 'sm' | 'md' | 'lg' = 'sm') => {
    const config = MARKER_TYPES.find(m => m.type === type);
    if (!config) return null;
    const Icon = config.icon;
    const sizeClass = size === 'sm' ? "w-3 h-3" : size === 'md' ? "w-4 h-4" : "w-6 h-6";
    return <Icon className={sizeClass} />;
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Slot tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {slots.map((slot) => (
          <div key={slot.id} className="flex items-center">
            {editingSlotLabel === slot.id ? (
              <input
                type="text"
                defaultValue={slot.label}
                className="px-3 py-1.5 text-sm bg-background border rounded focus:outline-none focus:ring-2 focus:ring-primary w-20"
                autoFocus
                onBlur={(e) => updateSlotLabel(slot.id, e.target.value || slot.label)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    updateSlotLabel(slot.id, e.currentTarget.value || slot.label);
                  } else if (e.key === 'Escape') {
                    setEditingSlotLabel(null);
                  }
                }}
              />
            ) : (
              <button
                onClick={() => setActiveSlotId(slot.id)}
                onDoubleClick={() => setEditingSlotLabel(slot.id)}
                className={`px-3 py-1.5 text-sm rounded-l transition-colors ${
                  activeSlotId === slot.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
                title="Double-click to rename"
              >
                {slot.label}
                {slot.screenshot_url && <span className="ml-1 text-xs opacity-70">•</span>}
              </button>
            )}
            {slots.length > 1 && (
              <button
                onClick={() => removeSlot(slot.id)}
                className={`px-1.5 py-1.5 text-sm rounded-r border-l transition-colors ${
                  activeSlotId === slot.id
                    ? 'bg-primary/80 text-primary-foreground hover:bg-destructive'
                    : 'bg-muted hover:bg-destructive hover:text-destructive-foreground'
                }`}
                title="Remove slot"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={addSlot}
          className="h-8"
        >
          <Plus className="w-3 h-3 mr-1" />
          Add TF
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-6 flex-1 min-h-0">
        {/* Left: Screenshot area */}
        <div className="flex flex-col gap-3 min-h-0">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">{activeSlot?.label || 'Chart'} Screenshot</Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleScreenCapture}
                disabled={isCapturing || isUploading}
              >
                <MonitorUp className="w-4 h-4 mr-1" />
                {isCapturing ? "Capturing..." : "Capture"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || isCapturing}
              >
                <Upload className="w-4 h-4 mr-1" />
                {isUploading ? "Uploading..." : "Upload"}
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

          {/* Image slot - display exactly what the user saved (cropped/landscape) */}
          <div className="relative bg-card border rounded-lg overflow-hidden flex-1 min-h-[420px] lg:min-h-[520px] group flex items-center justify-center p-4">
            {activeSlot?.screenshot_url ? (
              <>
                {/* 
                  CRITICAL: The outer wrapper is position:relative with inline-block sizing.
                  The image inside sets the actual dimensions. Markers use % positioning
                  relative to this wrapper, which matches the image bounds exactly.
                */}
                <div className="relative inline-block" style={{ maxWidth: '100%', maxHeight: '100%' }}>
                  <img
                    src={activeSlot.screenshot_url}
                    alt="Trade screenshot"
                    className="block w-auto h-auto max-w-full max-h-[480px] lg:max-h-[580px]"
                    style={{ objectFit: 'contain' }}
                  />

                  {/* Markers positioned relative to the image wrapper (same size as image) */}
                  {activeSlot.markers.map((marker) => (
                    <div
                      key={marker.id}
                      className={`absolute w-7 h-7 rounded-full ${getMarkerColor(marker.type)} border-2 flex items-center justify-center text-white shadow-lg pointer-events-none`}
                      style={{ 
                        left: `${marker.x}%`, 
                        top: `${marker.y}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                    >
                      {getMarkerIcon(marker.type, 'sm')}
                    </div>
                  ))}
                </div>

                {/* Edit overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center gap-3 pointer-events-none">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto shadow-lg"
                    onClick={() => setIsEditorOpen(true)}
                  >
                    <Maximize2 className="w-4 h-4 mr-2" />
                    Edit & Markers
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-background/90 pointer-events-auto shadow-lg"
                    onClick={() => setIsImageViewerOpen(true)}
                  >
                    View Full
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto shadow-lg"
                    onClick={handleDeleteScreenshot}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-muted-foreground p-8">
                 <ImageIcon className="w-16 h-16 mb-3 opacity-40" />
                <p className="text-sm font-medium">Capture or upload a screenshot</p>
                <p className="text-xs opacity-60 mt-1">for {activeSlot?.label || 'this timeframe'}</p>
              </div>
            )}
          </div>

          {/* Full size image viewer */}
          <Dialog open={isImageViewerOpen} onOpenChange={setIsImageViewerOpen}>
            <DialogContent className="max-w-[95vw] max-h-[95vh] p-4 flex flex-col">
              <DialogTitle className="text-lg font-semibold mb-2">Trade Screenshot - {activeSlot?.label}</DialogTitle>
              <div className="relative flex-1 flex items-center justify-center overflow-auto bg-card rounded-lg p-4">
                {/* Same inline-block pattern for consistent marker positioning */}
                <div className="relative inline-block" style={{ maxWidth: '100%', maxHeight: '100%' }}>
                  <img
                    src={activeSlot?.screenshot_url || ''}
                    alt="Trade screenshot full size"
                    className="block w-auto h-auto max-w-full max-h-[80vh]"
                    style={{ objectFit: 'contain' }}
                  />
                  {activeSlot?.markers.map((marker) => (
                    <div
                      key={marker.id}
                      className={`absolute w-10 h-10 rounded-full ${getMarkerColor(marker.type)} border-2 flex items-center justify-center text-white shadow-xl`}
                      style={{ 
                        left: `${marker.x}%`, 
                        top: `${marker.y}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                    >
                      {getMarkerIcon(marker.type, 'lg')}
                    </div>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Image Editor Dialog */}
          {activeSlot?.screenshot_url && (
            <ImageEditorDialog
              open={isEditorOpen}
              onOpenChange={setIsEditorOpen}
              imageUrl={activeSlot.screenshot_url}
              markers={activeSlot.markers}
              onSave={handleEditorSave}
              tradeId={trade.id}
            />
          )}
        </div>

        {/* Right: Trade info and reflection */}
        <div className="flex flex-col gap-4 min-h-0">
          {/* Trade details */}
          <div className="bg-card border rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-lg">
              {trade.symbol || trade.pair || 'Unknown'}
              <span className={`ml-2 text-sm ${trade.buy_sell === 'Buy' ? 'text-emerald-500' : 'text-destructive'}`}>
                {trade.buy_sell}
              </span>
            </h4>
            
            {/* Trade times */}
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
      </div>
    </div>
  );
};
