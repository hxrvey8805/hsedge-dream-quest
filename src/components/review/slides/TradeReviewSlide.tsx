import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Upload, ArrowUpCircle, Target, X, Image, MonitorUp, Maximize2, Plus, Trash2, Clock } from "lucide-react";
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
  { type: 'time' as const, label: 'Trade Time', icon: Clock, color: 'text-purple-500 bg-purple-500/20' },
];

export const TradeReviewSlide = ({ trade, slideData, onUpdate }: TradeReviewSlideProps) => {
  // Helper to get initial slots from slideData
  const getInitialSlots = (data: TradeSlideData): ScreenshotSlot[] => {
    if (data.screenshot_slots && data.screenshot_slots.length > 0) {
      return data.screenshot_slots;
    }
    // Migrate legacy single screenshot to first slot
    return [{
      id: `slot-${data.trade_id}-1`,
      label: 'Entry TF',
      screenshot_url: data.screenshot_url,
      markers: data.markers || []
    }];
  };

  const [slots, setSlots] = useState<ScreenshotSlot[]>(() => getInitialSlots(slideData));
  const [activeSlotId, setActiveSlotId] = useState<string>(slots[0]?.id || `slot-${slideData.trade_id}-1`);
  const [isUploading, setIsUploading] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [editingSlotLabel, setEditingSlotLabel] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // CRITICAL: Reset slots when trade changes (navigating between slides)
  useEffect(() => {
    const newSlots = getInitialSlots(slideData);
    setSlots(newSlots);
    setActiveSlotId(newSlots[0]?.id || `slot-${slideData.trade_id}-1`);
  }, [slideData.trade_id]);

  const activeSlot = slots.find(s => s.id === activeSlotId) || slots[0];

  // Ensure time marker exists at bottom when screenshot is present
  useEffect(() => {
    if (activeSlot?.screenshot_url && activeSlot.markers) {
      const hasTimeMarker = activeSlot.markers.some(m => m.type === 'time');
      if (!hasTimeMarker) {
        // Calculate x position based on trade time (default to middle if no time)
        const timeX = 50; // Default to center, can be adjusted based on trade.time_opened
        const timeMarker: Marker = {
          id: `time-${activeSlotId}-${Date.now()}`,
          type: 'time',
          x: timeX,
          y: 95, // Bottom of image
          useLineMode: true,
          markerSize: 24
        };
        updateActiveSlot({
          markers: [...activeSlot.markers, timeMarker]
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSlot?.screenshot_url, activeSlotId]);

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
      id: `slot-${trade.id}-${Date.now()}`,
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
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Failed to create image"));
        }, 'image/png');
      });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in");
        return;
      }

      const fileName = `${user.id}/${trade.id}-${activeSlotId}-${Date.now()}.png`;
      const { error: uploadError } = await supabase.storage
        .from('review-screenshots')
        .upload(fileName, blob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('review-screenshots')
        .getPublicUrl(fileName);

      updateActiveSlot({ screenshot_url: publicUrl });
      toast.success("Screenshot captured!");
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("You must be logged in");
      setIsUploading(false);
      return;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${trade.id}-${activeSlotId}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('review-screenshots')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('review-screenshots')
        .getPublicUrl(fileName);

      updateActiveSlot({ screenshot_url: publicUrl });
      toast.success("Screenshot uploaded!");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload screenshot");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };


  const getMarkerLineColor = (type: 'entry' | 'stop_loss' | 'take_profit' | 'time') => {
    switch (type) {
      case 'entry': return '#3b82f6';
      case 'stop_loss': return '#ef4444';
      case 'take_profit': return '#10b981';
      case 'time': return '#a855f7';
    }
  };

  const getMarkerLabel = (type: 'entry' | 'stop_loss' | 'take_profit' | 'time') => {
    switch (type) {
      case 'entry': return 'Entry';
      case 'stop_loss': return 'Stop Loss';
      case 'take_profit': return 'Take Profit';
      case 'time': return trade.time_opened ? `Trade: ${trade.time_opened}` : 'Trade Time';
    }
  };

  const getMarkerIcon = (type: 'entry' | 'stop_loss' | 'take_profit' | 'time', size: 'sm' | 'md' | 'lg' = 'sm') => {
    const config = MARKER_TYPES.find(m => m.type === type);
    if (!config) return null;
    const Icon = config.icon;
    const sizeClass = size === 'sm' ? "w-3 h-3" : size === 'md' ? "w-4 h-4" : "w-6 h-6";
    return <Icon className={sizeClass} />;
  };

  const getMarkerColor = (type: 'entry' | 'stop_loss' | 'take_profit' | 'time') => {
    switch (type) {
      case 'entry': return 'bg-blue-500 border-blue-300';
      case 'stop_loss': return 'bg-destructive border-red-300';
      case 'take_profit': return 'bg-emerald-500 border-emerald-300';
      case 'time': return 'bg-purple-500 border-purple-300';
    }
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
                  {activeSlot.markers.map((marker) => {
                    const lineColor = getMarkerLineColor(marker.type);
                    const markerSizeValue = marker.markerSize || 24;
                    const isTimeMarker = marker.type === 'time';
                    const shouldUseLineMode = marker.useLineMode !== undefined ? marker.useLineMode : (marker.type === 'time');
                    
                    if (shouldUseLineMode) {
                      // Render as horizontal line - vertical indicator ONLY for time marker
                      return (
                        <div
                          key={marker.id}
                          className="absolute pointer-events-none"
                          style={{ 
                            left: 0, 
                            right: 0,
                            top: `${marker.y}%`,
                            transform: 'translateY(-50%)'
                          }}
                        >
                          {/* Full width horizontal line */}
                          <div 
                            className="w-full"
                            style={{ 
                              height: Math.max(2, markerSizeValue / 8),
                              backgroundColor: lineColor
                            }}
                          />
                          
                          {/* Vertical time indicator - ONLY for time marker */}
                          {isTimeMarker && (
                            <div
                              className="absolute"
                              style={{ 
                                left: `${marker.x}%`,
                                transform: 'translateX(-50%)',
                                top: '-150%',
                                bottom: '-150%',
                                width: Math.max(3, markerSizeValue / 6),
                                backgroundColor: lineColor,
                                boxShadow: `0 0 4px ${lineColor}`,
                                borderRadius: 2
                              }}
                            />
                          )}
                          
                          {/* Label - positioned at labelX% (or x% if labelX not set) for all markers including time */}
                          <div
                            className="absolute px-1.5 py-0.5 rounded text-white text-xs font-medium"
                            style={{ 
                              left: `${marker.labelX ?? marker.x}%`,
                              top: '50%',
                              transform: 'translate(-50%, -50%)',
                              backgroundColor: lineColor,
                              fontSize: Math.max(8, markerSizeValue / 3)
                            }}
                          >
                            {getMarkerLabel(marker.type)}
                          </div>
                        </div>
                      );
                    }
                    
                    // Icon mode (default)
                    return (
                      <div
                        key={marker.id}
                        className={`absolute rounded-full ${getMarkerColor(marker.type)} border-2 flex items-center justify-center text-white shadow-lg pointer-events-none`}
                        style={{ 
                          left: `${marker.x}%`, 
                          top: `${marker.y}%`,
                          transform: 'translate(-50%, -50%)',
                          width: markerSizeValue,
                          height: markerSizeValue
                        }}
                      >
                        {getMarkerIcon(marker.type, 'sm')}
                      </div>
                    );
                  })}
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
                <Image className="w-16 h-16 mb-3 opacity-40" />
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
                  {activeSlot?.markers.map((marker) => {
                    const lineColor = getMarkerLineColor(marker.type);
                    const markerSizeValue = (marker.markerSize || 24) * 1.5; // Larger for full view
                    const isTimeMarker = marker.type === 'time';
                    const shouldUseLineMode = marker.useLineMode !== undefined ? marker.useLineMode : (marker.type === 'time');
                    
                    if (shouldUseLineMode) {
                      // Render as horizontal line - vertical indicator ONLY for time marker
                      return (
                        <div
                          key={marker.id}
                          className="absolute pointer-events-none"
                          style={{ 
                            left: 0, 
                            right: 0,
                            top: `${marker.y}%`,
                            transform: 'translateY(-50%)'
                          }}
                        >
                          {/* Full width horizontal line */}
                          <div 
                            className="w-full"
                            style={{ 
                              height: Math.max(3, markerSizeValue / 8),
                              backgroundColor: lineColor
                            }}
                          />
                          
                          {/* Vertical time indicator - ONLY for time marker */}
                          {isTimeMarker && (
                            <div
                              className="absolute"
                              style={{ 
                                left: `${marker.x}%`,
                                transform: 'translateX(-50%)',
                                top: '-150%',
                                bottom: '-150%',
                                width: Math.max(4, markerSizeValue / 5),
                                backgroundColor: lineColor,
                                boxShadow: `0 0 6px ${lineColor}`,
                                borderRadius: 2
                              }}
                            />
                          )}
                          
                          {/* Label - positioned at labelX% (or x% if labelX not set) for all markers including time */}
                          <div
                            className="absolute px-2 py-1 rounded text-white text-sm font-medium"
                            style={{ 
                              left: `${marker.labelX ?? marker.x}%`,
                              top: '50%',
                              transform: 'translate(-50%, -50%)',
                              backgroundColor: lineColor
                            }}
                          >
                            {getMarkerLabel(marker.type)}
                          </div>
                        </div>
                      );
                    }
                    
                    // Icon mode (default)
                    return (
                      <div
                        key={marker.id}
                        className={`absolute rounded-full ${getMarkerColor(marker.type)} border-2 flex items-center justify-center text-white shadow-xl`}
                        style={{ 
                          left: `${marker.x}%`, 
                          top: `${marker.y}%`,
                          transform: 'translate(-50%, -50%)',
                          width: markerSizeValue,
                          height: markerSizeValue
                        }}
                      >
                        {getMarkerIcon(marker.type, 'lg')}
                      </div>
                    );
                  })}
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
              tradeInfo={{
                symbol: trade.symbol,
                pair: trade.pair,
                buy_sell: trade.buy_sell,
                time_opened: trade.time_opened,
                time_closed: trade.time_closed,
                entry_price: trade.entry_price,
                exit_price: trade.exit_price,
                pips: trade.pips,
                profit: trade.profit,
                outcome: trade.outcome,
              }}
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
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Opened:</span>
                <span className="ml-2 font-mono">{trade.time_opened || 'N/A'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Closed:</span>
                <span className="ml-2 font-mono">{trade.time_closed || 'N/A'}</span>
              </div>
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
