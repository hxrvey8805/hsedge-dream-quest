import { useState, useRef, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Target, 
  X, 
  Crop, 
  Check,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Move,
  Minus
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface Marker {
  id: string;
  type: 'entry' | 'stop_loss' | 'take_profit' | 'time';
  x: number;
  y: number;
  useLineMode?: boolean;
  markerSize?: number;
  labelX?: number; // Separate x position for label (for time markers, allows label and vertical indicator to be at different positions)
}

interface ImageEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  markers: Marker[];
  onSave: (imageUrl: string, markers: Marker[]) => void;
  tradeId: string;
  allowMultiplePerType?: boolean;
}

const MARKER_TYPES = [
  { type: 'entry' as const, label: 'Entry', icon: ArrowUpCircle, color: 'bg-blue-500', borderColor: 'border-blue-300', lineColor: '#3b82f6' },
  { type: 'stop_loss' as const, label: 'Stop Loss', icon: X, color: 'bg-destructive', borderColor: 'border-red-300', lineColor: '#ef4444' },
  { type: 'take_profit' as const, label: 'Take Profit', icon: Target, color: 'bg-emerald-500', borderColor: 'border-emerald-300', lineColor: '#10b981' },
  { type: 'time' as const, label: 'Trade Time', icon: ArrowUpCircle, color: 'bg-purple-500', borderColor: 'border-purple-300', lineColor: '#a855f7' },
];

export const ImageEditorDialog = ({ 
  open, 
  onOpenChange, 
  imageUrl, 
  markers: initialMarkers,
  onSave,
  tradeId,
  allowMultiplePerType = false
}: ImageEditorDialogProps) => {
  const [markers, setMarkers] = useState<Marker[]>(initialMarkers);
  const [isCropping, setIsCropping] = useState(false);
  const [isDraggingCrop, setIsDraggingCrop] = useState(false);
  const [cropStart, setCropStart] = useState<{ x: number; y: number } | null>(null);
  const [cropEnd, setCropEnd] = useState<{ x: number; y: number } | null>(null);
  const [selectedMarkerType, setSelectedMarkerType] = useState<'entry' | 'stop_loss' | 'take_profit' | 'time' | null>(null);
  const [zoom, setZoom] = useState(100);
  const [isSaving, setIsSaving] = useState(false);
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);
  
  // New state for marker customization
  const [markerSize, setMarkerSize] = useState(24);
  const [useLineMode, setUseLineMode] = useState(false);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [isDraggingMarker, setIsDraggingMarker] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setMarkers(initialMarkers);
      setCroppedImageUrl(null);
      setIsCropping(false);
      setCropStart(null);
      setCropEnd(null);
      setZoom(100);
      setSelectedMarkerType(null);
      setSelectedMarkerId(null);
      setIsDraggingMarker(false);
      // Reset to defaults when dialog opens
      setUseLineMode(false);
      setMarkerSize(24);
    }
  }, [open, initialMarkers]);

  // Sync switch state with selected marker when selection changes
  useEffect(() => {
    if (selectedMarkerId) {
      const selectedMarker = markers.find(m => m.id === selectedMarkerId);
      if (selectedMarker) {
        if (selectedMarker.useLineMode !== undefined) {
          setUseLineMode(selectedMarker.useLineMode);
        }
        if (selectedMarker.markerSize !== undefined) {
          setMarkerSize(selectedMarker.markerSize);
        }
      }
    }
  }, [selectedMarkerId]); // Only depend on selectedMarkerId, not markers to avoid loops

  // Update selected marker when switch/size changes
  const prevUseLineMode = useRef(useLineMode);
  const prevMarkerSize = useRef(markerSize);
  useEffect(() => {
    if (selectedMarkerId && (prevUseLineMode.current !== useLineMode || prevMarkerSize.current !== markerSize)) {
      setMarkers(prev => prev.map(m => 
        m.id === selectedMarkerId 
          ? { ...m, useLineMode, markerSize }
          : m
      ));
      prevUseLineMode.current = useLineMode;
      prevMarkerSize.current = markerSize;
    }
  }, [useLineMode, markerSize, selectedMarkerId]);

  const displayUrl = croppedImageUrl || imageUrl;

  // Get coordinates relative to the actual image bounds, not container
  const getImageRelativeCoords = useCallback((clientX: number, clientY: number) => {
    if (!imageRef.current) return null;
    const imgRect = imageRef.current.getBoundingClientRect();
    const x = ((clientX - imgRect.left) / imgRect.width) * 100;
    const y = ((clientY - imgRect.top) / imgRect.height) * 100;
    return { x, y };
  }, []);

  const handleImageClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current || isCropping || isDraggingMarker) return;

    const coords = getImageRelativeCoords(e.clientX, e.clientY);
    if (!coords) return;
    
    const { x, y } = coords;
    
    // Ignore clicks outside image bounds
    if (x < 0 || x > 100 || y < 0 || y > 100) return;

    // If clicking on empty space while a marker is selected, deselect it
    if (selectedMarkerId && !selectedMarkerType) {
      setSelectedMarkerId(null);
      return;
    }

    if (selectedMarkerType) {
      // Remove existing marker of same type (unless multiple allowed) and add new one
      const newMarkers = allowMultiplePerType
        ? [...markers]
        : markers.filter(m => m.type !== selectedMarkerType);
      newMarkers.push({
        id: `${selectedMarkerType}-${Date.now()}`,
        type: selectedMarkerType,
        x,
        y,
        useLineMode,
        markerSize,
      });
      setMarkers(newMarkers);
    }
  }, [selectedMarkerType, markers, isCropping, selectedMarkerId, isDraggingMarker, getImageRelativeCoords]);

  const handleMarkerMouseDown = (e: React.MouseEvent, markerId: string, mode: 'both' | 'horizontal' | 'vertical' | 'label' = 'both') => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedMarkerId(markerId);
    setSelectedMarkerType(null);
    setDragMode(mode);
    setIsDraggingMarker(true);
  };

  const [dragMode, setDragMode] = useState<'both' | 'horizontal' | 'vertical' | 'label'>('both');

  const handleMarkerDrag = useCallback((e: React.MouseEvent) => {
    if (!isDraggingMarker || !selectedMarkerId || !imageRef.current) return;

    const coords = getImageRelativeCoords(e.clientX, e.clientY);
    if (!coords) return;
    
    setMarkers(prev => prev.map(m => {
      if (m.id !== selectedMarkerId) return m;
      const marker = m;
      if (dragMode === 'horizontal') {
        return { ...marker, x: Math.max(0, Math.min(100, coords.x)) };
      } else if (dragMode === 'vertical') {
        return { ...marker, y: Math.max(0, Math.min(100, coords.y)) };
      } else if (dragMode === 'label') {
        return { ...marker, labelX: Math.max(0, Math.min(100, coords.x)) };
      } else {
        return { 
          ...marker, 
          x: Math.max(0, Math.min(100, coords.x)),
          y: Math.max(0, Math.min(100, coords.y))
        };
      }
    }));
  }, [isDraggingMarker, selectedMarkerId, dragMode, getImageRelativeCoords]);

  const handleMarkerMouseUp = () => {
    setIsDraggingMarker(false);
  };

  const handleCropMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isCropping || !containerRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCropStart({ x, y });
    setCropEnd({ x, y });
    setIsDraggingCrop(true);
  };

  const handleCropMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // Handle marker dragging
    if (isDraggingMarker) {
      handleMarkerDrag(e);
      return;
    }
    
    if (!isCropping || !isDraggingCrop || !cropStart || !containerRef.current) return;
    e.preventDefault();
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
    
    setCropEnd({ x, y });
  };

  const handleCropMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDraggingMarker) {
      handleMarkerMouseUp();
      return;
    }
    
    if (!isCropping) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingCrop(false);
  };

  const applyCrop = async () => {
    if (!cropStart || !cropEnd || !imageRef.current || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const imgRect = imageRef.current.getBoundingClientRect();

    const scaleX = imageRef.current.naturalWidth / imgRect.width;
    const scaleY = imageRef.current.naturalHeight / imgRect.height;

    const offsetX = (containerRect.width - imgRect.width) / 2;
    const offsetY = (containerRect.height - imgRect.height) / 2;

    const adjustedStart = {
      x: Math.max(0, cropStart.x - offsetX),
      y: Math.max(0, cropStart.y - offsetY)
    };
    const adjustedEnd = {
      x: Math.max(0, cropEnd.x - offsetX),
      y: Math.max(0, cropEnd.y - offsetY)
    };

    const cropX = Math.min(adjustedStart.x, adjustedEnd.x) * scaleX;
    const cropY = Math.min(adjustedStart.y, adjustedEnd.y) * scaleY;
    const cropWidth = Math.abs(adjustedEnd.x - adjustedStart.x) * scaleX;
    const cropHeight = Math.abs(adjustedEnd.y - adjustedStart.y) * scaleY;

    if (cropWidth < 10 || cropHeight < 10) {
      toast.error("Crop area too small");
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = cropWidth;
    canvas.height = cropHeight;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = displayUrl;
    
    await new Promise((resolve) => {
      img.onload = resolve;
    });

    ctx.drawImage(
      img,
      cropX, cropY, cropWidth, cropHeight,
      0, 0, cropWidth, cropHeight
    );

    const croppedDataUrl = canvas.toDataURL('image/png');
    setCroppedImageUrl(croppedDataUrl);
    
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;
    
    const cropStartPercent = {
      x: (Math.min(cropStart.x, cropEnd.x) / containerWidth) * 100,
      y: (Math.min(cropStart.y, cropEnd.y) / containerHeight) * 100
    };
    const cropEndPercent = {
      x: (Math.max(cropStart.x, cropEnd.x) / containerWidth) * 100,
      y: (Math.max(cropStart.y, cropEnd.y) / containerHeight) * 100
    };
    
    const newMarkers = markers.map(marker => {
      const newX = ((marker.x - cropStartPercent.x) / (cropEndPercent.x - cropStartPercent.x)) * 100;
      const newY = ((marker.y - cropStartPercent.y) / (cropEndPercent.y - cropStartPercent.y)) * 100;
      return {
        ...marker,
        x: Math.max(0, Math.min(100, newX)),
        y: Math.max(0, Math.min(100, newY))
      };
    }).filter(m => m.x >= 0 && m.x <= 100 && m.y >= 0 && m.y <= 100);
    
    setMarkers(newMarkers);
    setIsCropping(false);
    setCropStart(null);
    setCropEnd(null);
    toast.success("Image cropped!");
  };

  const removeMarker = (markerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMarkers(markers.filter(m => m.id !== markerId));
    if (selectedMarkerId === markerId) {
      setSelectedMarkerId(null);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      let finalImageUrl = imageUrl;
      
      if (croppedImageUrl) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast.error("You must be logged in");
          return;
        }

        const response = await fetch(croppedImageUrl);
        const blob = await response.blob();

        const fileName = `${user.id}/${tradeId}-cropped-${Date.now()}.png`;
        const { error: uploadError } = await supabase.storage
          .from('review-screenshots')
          .upload(fileName, blob);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('review-screenshots')
          .getPublicUrl(fileName);

        finalImageUrl = publicUrl;
      }

      onSave(finalImageUrl, markers);
      onOpenChange(false);
      toast.success("Changes saved!");
    } catch (error: any) {
      toast.error(error.message || "Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const resetChanges = () => {
    setMarkers(initialMarkers);
    setCroppedImageUrl(null);
    setIsCropping(false);
    setCropStart(null);
    setCropEnd(null);
    setZoom(100);
    setSelectedMarkerId(null);
    setMarkerSize(24);
    setUseLineMode(false);
  };

  const getCropRect = () => {
    if (!cropStart || !cropEnd) return null;
    return {
      left: Math.min(cropStart.x, cropEnd.x),
      top: Math.min(cropStart.y, cropEnd.y),
      width: Math.abs(cropEnd.x - cropStart.x),
      height: Math.abs(cropEnd.y - cropStart.y),
    };
  };

  const getMarkerIcon = (type: 'entry' | 'stop_loss' | 'take_profit' | 'time', size: number) => {
    const config = MARKER_TYPES.find(m => m.type === type);
    if (!config) return null;
    const Icon = config.icon;
    const iconSize = Math.max(12, size - 8);
    return <Icon style={{ width: iconSize, height: iconSize }} />;
  };

  const renderMarker = (marker: Marker) => {
    const config = MARKER_TYPES.find(m => m.type === marker.type);
    if (!config) return null;
    
    const isSelected = selectedMarkerId === marker.id;
    const baseSize = marker.markerSize || markerSize;
    const isTimeMarker = marker.type === 'time';
    const shouldUseLineMode = marker.useLineMode !== undefined ? marker.useLineMode : (marker.type === 'time' || useLineMode);
    
    if (shouldUseLineMode) {
      // Render as horizontal line - vertical indicator ONLY for time marker
      return (
        <div
          key={marker.id}
          className={`absolute ${isSelected ? 'z-20' : 'z-10'}`}
          style={{ 
            left: 0, 
            right: 0,
            top: `${marker.y}%`,
            transform: 'translateY(-50%)',
            pointerEvents: 'none'
          }}
        >
          {/* Horizontal line - draggable vertically */}
          <div 
            className="w-full flex items-center cursor-ns-resize"
            style={{ height: baseSize / 2 }}
            onMouseDown={(e) => handleMarkerMouseDown(e, marker.id, 'vertical')}
            onDoubleClick={(e) => removeMarker(marker.id, e)}
            title="Drag vertically to move line, double-click to remove"
          >
            <div 
              className="w-full"
              style={{ 
                height: Math.max(2, baseSize / 8),
                backgroundColor: config.lineColor,
                boxShadow: isSelected ? `0 0 8px ${config.lineColor}` : 'none',
                pointerEvents: 'auto'
              }}
            />
          </div>
          
          {/* Vertical time indicator - ONLY for time marker type - draggable horizontally */}
          {isTimeMarker && (
            <div
              className={`absolute cursor-ew-resize ${isSelected ? 'ring-2 ring-white/50' : ''}`}
              style={{ 
                left: `${marker.x}%`,
                transform: 'translateX(-50%)',
                top: '-200%',
                bottom: '-200%',
                width: Math.max(4, baseSize / 4),
                backgroundColor: config.lineColor,
                boxShadow: `0 0 6px ${config.lineColor}`,
                borderRadius: 2,
                pointerEvents: 'auto'
              }}
              onMouseDown={(e) => handleMarkerMouseDown(e, marker.id, 'horizontal')}
              onDoubleClick={(e) => removeMarker(marker.id, e)}
              title="Drag horizontally to set trade time position, double-click to remove"
            />
          )}
          
          {/* Label on the horizontal line - slideable for all markers including time */}
          <div
            className={`absolute px-2 py-0.5 rounded text-white text-xs font-medium cursor-ew-resize`}
            style={{ 
              left: `${(marker.labelX ?? marker.x)}%`,
              top: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: config.lineColor,
              fontSize: Math.max(9, baseSize / 2.5),
              pointerEvents: 'auto'
            }}
            onMouseDown={(e) => handleMarkerMouseDown(e, marker.id, 'label')}
            title="Drag to slide label along line, double-click to remove"
          >
            {config.label}
          </div>
        </div>
      );
    }

    // Icon mode
    return (
      <div
        key={marker.id}
        className={`absolute rounded-full ${config.color} ${config.borderColor} border-2 flex items-center justify-center text-white cursor-move transform -translate-x-1/2 -translate-y-1/2 shadow-lg transition-all ${isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-black/50 scale-110' : 'hover:scale-105'} z-10`}
        style={{ 
          left: `${marker.x}%`, 
          top: `${marker.y}%`,
          width: baseSize,
          height: baseSize
        }}
        onMouseDown={(e) => handleMarkerMouseDown(e, marker.id)}
        onDoubleClick={(e) => removeMarker(marker.id, e)}
        title="Drag to move, double-click to remove"
      >
        {getMarkerIcon(marker.type, baseSize)}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle>Edit Screenshot</DialogTitle>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={resetChanges}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                onClick={handleSave}
                disabled={isSaving}
              >
                <Check className="w-4 h-4 mr-2" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Left sidebar - Tools */}
          <div className="w-72 border-r p-4 space-y-5 overflow-y-auto">
            {/* Crop Tool */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Crop</Label>
              <Button
                variant={isCropping ? "default" : "outline"}
                size="sm"
                className="w-full"
                onClick={() => {
                  setIsCropping(!isCropping);
                  setSelectedMarkerType(null);
                  setSelectedMarkerId(null);
                  if (!isCropping) {
                    setCropStart(null);
                    setCropEnd(null);
                  }
                }}
              >
                <Crop className="w-4 h-4 mr-2" />
                {isCropping ? "Cancel Crop" : "Crop Image"}
              </Button>
              {isCropping && cropStart && cropEnd && (
                <Button
                  variant="default"
                  size="sm"
                  className="w-full"
                  onClick={applyCrop}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Apply Crop
                </Button>
              )}
              {isCropping && (
                <p className="text-xs text-muted-foreground">
                  Click and drag on the image to select crop area
                </p>
              )}
            </div>

            {/* Zoom */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Zoom: {zoom}%</Label>
              <div className="flex items-center gap-2">
                <ZoomOut className="w-4 h-4 text-muted-foreground" />
                <Slider
                  value={[zoom]}
                  onValueChange={([v]) => setZoom(v)}
                  min={50}
                  max={200}
                  step={10}
                  className="flex-1"
                />
                <ZoomIn className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>

            {/* Marker Style */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Marker Style</Label>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Use Lines</span>
                <Switch 
                  checked={useLineMode} 
                  onCheckedChange={setUseLineMode}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Size: {markerSize}px</span>
                </div>
                <div className="flex items-center gap-2">
                  <Minus className="w-4 h-4 text-muted-foreground" />
                  <Slider
                    value={[markerSize]}
                    onValueChange={([v]) => setMarkerSize(v)}
                    min={16}
                    max={48}
                    step={4}
                    className="flex-1"
                  />
                  <ArrowUpCircle className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            </div>

            {/* Markers */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Add Markers</Label>
              <p className="text-xs text-muted-foreground">
                Select type below, then click on the image. Or click existing markers to drag them.
              </p>
              <div className="space-y-2">
                {MARKER_TYPES.map((marker) => (
                  <Button
                    key={marker.type}
                    variant={selectedMarkerType === marker.type ? "default" : "outline"}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => {
                      setSelectedMarkerType(
                        selectedMarkerType === marker.type ? null : marker.type
                      );
                      setSelectedMarkerId(null);
                      setIsCropping(false);
                    }}
                  >
                    <marker.icon className="w-4 h-4 mr-2" />
                    {marker.label}
                    {markers.some(m => m.type === marker.type) && (
                      <Check className="w-3 h-3 ml-auto text-emerald-500" />
                    )}
                  </Button>
                ))}
              </div>
            </div>

            {/* Current Markers */}
            {markers.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Placed Markers</Label>
                <p className="text-xs text-muted-foreground">
                  Click to select, double-click on chart to remove
                </p>
                <div className="space-y-2">
                  {markers.map((marker) => {
                    const config = MARKER_TYPES.find(m => m.type === marker.type);
                    if (!config) return null;
                    const isSelected = selectedMarkerId === marker.id;
                    return (
                      <div 
                        key={marker.id}
                        className={`flex items-center justify-between p-2 rounded-lg text-sm cursor-pointer transition-colors ${isSelected ? 'bg-primary/20 ring-1 ring-primary' : 'bg-muted/50 hover:bg-muted'}`}
                        onClick={() => setSelectedMarkerId(isSelected ? null : marker.id)}
                      >
                        <div className="flex items-center gap-2">
                          <config.icon className="w-4 h-4" />
                          <span>{config.label}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => removeMarker(marker.id, e)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Main image area */}
          <div className="flex-1 p-4 bg-muted/20 overflow-auto">
            <div 
              className="relative inline-block min-w-full min-h-full flex items-center justify-center"
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center center' }}
            >
              <div
                ref={containerRef}
                className={`relative select-none ${isCropping ? 'cursor-crosshair' : selectedMarkerType ? 'cursor-crosshair' : isDraggingMarker ? 'cursor-grabbing' : 'cursor-default'}`}
                onClick={handleImageClick}
                onMouseDown={handleCropMouseDown}
                onMouseMove={handleCropMouseMove}
                onMouseUp={handleCropMouseUp}
                onMouseLeave={handleMarkerMouseUp}
                style={{ maxWidth: '100%', maxHeight: '100%' }}
              >
                <img
                  ref={imageRef}
                  src={displayUrl}
                  alt="Trade screenshot"
                  className="max-w-full max-h-[70vh] object-contain"
                  draggable={false}
                />

                {/* Crop overlay */}
                {isCropping && cropStart && cropEnd && (
                  <>
                    <div className="absolute inset-0 bg-black/50 pointer-events-none" />
                    <div
                      className="absolute border-2 border-white border-dashed bg-transparent pointer-events-none"
                      style={{
                        left: getCropRect()?.left,
                        top: getCropRect()?.top,
                        width: getCropRect()?.width,
                        height: getCropRect()?.height,
                        boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)',
                        clipPath: 'inset(0)',
                      }}
                    />
                  </>
                )}

                {/* Markers */}
                {!isCropping && markers.map(renderMarker)}

                {/* Click hint */}
                {selectedMarkerType && !isCropping && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/90 border rounded-lg px-4 py-2 text-sm shadow-lg">
                    <Move className="w-4 h-4 inline mr-2" />
                    Click anywhere to place {MARKER_TYPES.find(m => m.type === selectedMarkerType)?.label}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
