import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, ArrowUpCircle, ArrowDownCircle, Target, X, Image } from "lucide-react";
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
}

interface Marker {
  id: string;
  type: 'entry' | 'stop_loss' | 'take_profit';
  x: number; // percentage
  y: number; // percentage
}

interface TradeSlideData {
  trade_id: string;
  screenshot_url: string | null;
  markers: Marker[];
  reflection: string;
}

interface TradeReviewSlideProps {
  trade: Trade;
  slideData: TradeSlideData;
  onUpdate: (updates: Partial<TradeSlideData>) => void;
}

const MARKER_TYPES = [
  { type: 'entry' as const, label: 'Entry', icon: ArrowUpCircle, color: 'text-blue-500 bg-blue-500/20' },
  { type: 'stop_loss' as const, label: 'Stop Loss', icon: X, color: 'text-destructive bg-destructive/20' },
  { type: 'take_profit' as const, label: 'Take Profit', icon: Target, color: 'text-emerald-500 bg-emerald-500/20' },
];

export const TradeReviewSlide = ({ trade, slideData, onUpdate }: TradeReviewSlideProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [draggedMarker, setDraggedMarker] = useState<string | null>(null);
  const imageRef = useRef<HTMLDivElement>(null);
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
      const fileName = `${user.id}/${trade.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('review-screenshots')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('review-screenshots')
        .getPublicUrl(fileName);

      onUpdate({ screenshot_url: publicUrl });
      toast.success("Screenshot uploaded!");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload screenshot");
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current || draggedMarker) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Don't add marker on click, only via drag & drop
  };

  const handleMarkerDragStart = (e: React.DragEvent, markerType: 'entry' | 'stop_loss' | 'take_profit') => {
    e.dataTransfer.setData('markerType', markerType);
    setDraggedMarker(markerType);
  };

  const handleImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!imageRef.current) return;

    const markerType = e.dataTransfer.getData('markerType') as 'entry' | 'stop_loss' | 'take_profit';
    if (!markerType) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Remove existing marker of same type and add new one
    const newMarkers = slideData.markers.filter(m => m.type !== markerType);
    newMarkers.push({
      id: `${markerType}-${Date.now()}`,
      type: markerType,
      x,
      y,
    });

    onUpdate({ markers: newMarkers });
    setDraggedMarker(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const removeMarker = (markerId: string) => {
    onUpdate({ markers: slideData.markers.filter(m => m.id !== markerId) });
  };

  const getMarkerIcon = (type: 'entry' | 'stop_loss' | 'take_profit') => {
    const config = MARKER_TYPES.find(m => m.type === type);
    if (!config) return null;
    const Icon = config.icon;
    return <Icon className="w-6 h-6" />;
  };

  const getMarkerColor = (type: 'entry' | 'stop_loss' | 'take_profit') => {
    switch (type) {
      case 'entry': return 'bg-blue-500 border-blue-300';
      case 'stop_loss': return 'bg-destructive border-red-300';
      case 'take_profit': return 'bg-emerald-500 border-emerald-300';
    }
  };

  return (
    <div className="grid grid-cols-2 gap-6 h-full">
      {/* Left: Screenshot area */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Chart Screenshot</Label>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Upload className="w-4 h-4 mr-2" />
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Image with markers */}
        <div
          ref={imageRef}
          className="relative bg-muted/50 border-2 border-dashed rounded-lg overflow-hidden aspect-video"
          onDrop={handleImageDrop}
          onDragOver={handleDragOver}
          onClick={handleImageClick}
        >
          {slideData.screenshot_url ? (
            <img
              src={slideData.screenshot_url}
              alt="Trade screenshot"
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
              <Image className="w-12 h-12 mb-2 opacity-50" />
              <p>Upload a screenshot or drag markers here</p>
            </div>
          )}

          {/* Markers on image */}
          {slideData.markers.map((marker) => (
            <div
              key={marker.id}
              className={`absolute w-8 h-8 rounded-full ${getMarkerColor(marker.type)} border-2 flex items-center justify-center text-white cursor-pointer transform -translate-x-1/2 -translate-y-1/2 shadow-lg hover:scale-110 transition-transform`}
              style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
              onClick={(e) => {
                e.stopPropagation();
                removeMarker(marker.id);
              }}
              title="Click to remove"
            >
              {getMarkerIcon(marker.type)}
            </div>
          ))}
        </div>

        {/* Marker palette */}
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Drag markers onto the chart:</Label>
          <div className="flex gap-3">
            {MARKER_TYPES.map((marker) => (
              <div
                key={marker.type}
                draggable
                onDragStart={(e) => handleMarkerDragStart(e, marker.type)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-grab active:cursor-grabbing ${marker.color} border transition-transform hover:scale-105`}
              >
                <marker.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{marker.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Trade info and reflection */}
      <div className="space-y-6">
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
        <div className="space-y-2">
          <Label className="text-base font-semibold">Trade Reflection</Label>
          <Textarea
            placeholder="What did you do well? What could you improve? How did you feel during this trade?"
            value={slideData.reflection}
            onChange={(e) => onUpdate({ reflection: e.target.value })}
            className="min-h-[200px] resize-none"
          />
        </div>
      </div>
    </div>
  );
};
