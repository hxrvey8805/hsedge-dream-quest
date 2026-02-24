import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { DaySummarySlide } from "./slides/DaySummarySlide";
import { TradesOverviewSlide } from "./slides/TradesOverviewSlide";
import { TradeReviewSlide } from "./slides/TradeReviewSlide";
import { MissedOpportunitiesSlide, type MissedOpportunityScreenshot } from "./slides/MissedOpportunitiesSlide";
import { WhatWentWellSlide } from "./slides/WhatWentWellSlide";
import { LessonsLearnedSlide } from "./slides/LessonsLearnedSlide";
import type { Json } from "@/integrations/supabase/types";

interface Trade {
  id: string;
  trade_date: string;
  profit: number | null;
  outcome: string;
  symbol: string | null;
  pair: string | null;
  buy_sell: string;
  entry_price: number | null;
  exit_price: number | null;
  pips: number | null;
  time_opened: string | null;
  time_closed: string | null;
}

interface DailyReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date;
  trades: Trade[];
  totalPL: number;
}

interface ReviewData {
  id?: string;
  what_went_well: string;
  lessons_learned: string;
  missed_opportunities: string;
}

interface TradeSlideData {
  trade_id: string;
  screenshot_url: string | null;
  markers: Marker[];
  reflection: string;
  screenshot_slots?: ScreenshotSlot[];
}

interface ScreenshotSlot {
  id: string;
  label: string;
  screenshot_url: string | null;
  markers: Marker[];
}

interface Marker {
  id: string;
  type: 'entry' | 'stop_loss' | 'take_profit' | 'time';
  x: number;
  y: number;
  useLineMode?: boolean;
  markerSize?: number;
  labelX?: number; // Separate x position for label (for time markers, allows label and vertical indicator to be at different positions)
}

export const DailyReviewDialog = ({ 
  open, 
  onOpenChange, 
  date, 
  trades, 
  totalPL 
}: DailyReviewDialogProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [reviewData, setReviewData] = useState<ReviewData>({
    what_went_well: "",
    lessons_learned: "",
    missed_opportunities: "",
  });
  const [tradeSlides, setTradeSlides] = useState<TradeSlideData[]>([]);
  const [missedScreenshots, setMissedScreenshots] = useState<MissedOpportunityScreenshot[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [reviewId, setReviewId] = useState<string | null>(null);

  // Calculate slide count dynamically
  // Slides: 1 (Day Summary) + 1 (Trades Overview) + trades.length + 1 (Missed) + 1 (What Went Well) + 1 (Lessons)
  const totalSlides = 2 + trades.length + 3;

  useEffect(() => {
    if (open && date) {
      loadExistingReview();
      initializeTradeSlides();
    }
  }, [open, date, trades]);

  const initializeTradeSlides = () => {
    setTradeSlides(trades.map(trade => ({
      trade_id: trade.id,
      screenshot_url: null,
      markers: [],
      reflection: "",
      screenshot_slots: undefined,
    })));
  };

  const loadExistingReview = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const reviewDate = format(date, 'yyyy-MM-dd');
    
    // Load daily review
    const { data: review } = await supabase
      .from("daily_reviews")
      .select("*")
      .eq("user_id", user.id)
      .eq("review_date", reviewDate)
      .single();

    if (review) {
      setReviewId(review.id);
      setReviewData({
        what_went_well: review.what_went_well || "",
        lessons_learned: review.lessons_learned || "",
        missed_opportunities: review.missed_opportunities || "",
      });

      // Load missed opportunity screenshots with markers
      const missedData = (review as any).missed_opportunities_data;
      if (Array.isArray(missedData) && missedData.length > 0) {
        setMissedScreenshots(missedData as MissedOpportunityScreenshot[]);
      } else {
        // Backward compat: migrate old string[] screenshots
        const oldScreenshots = (review as any).missed_opportunities_screenshots;
        if (Array.isArray(oldScreenshots) && oldScreenshots.length > 0) {
          setMissedScreenshots(oldScreenshots.map((url: string, i: number) => ({
            id: `migrated-${i}`,
            screenshot_url: url,
            markers: [],
          })));
        } else {
          setMissedScreenshots([]);
        }
      }

      // Load trade slides
      const { data: slides } = await supabase
        .from("trade_review_slides")
        .select("*")
        .eq("daily_review_id", review.id)
        .order("slide_order");

      if (slides && slides.length > 0) {
        setTradeSlides(trades.map(trade => {
          const existingSlide = slides.find(s => s.trade_id === trade.id);
          const markersData = existingSlide?.markers;
          const parsedMarkers: Marker[] = Array.isArray(markersData) 
            ? (markersData as unknown as Marker[]) 
            : [];
          const slotsData = (existingSlide as any)?.screenshot_slots;
          const parsedSlots: ScreenshotSlot[] = Array.isArray(slotsData)
            ? (slotsData as unknown as ScreenshotSlot[])
            : [];
          return {
            trade_id: trade.id,
            screenshot_url: existingSlide?.screenshot_url || null,
            markers: parsedMarkers,
            reflection: existingSlide?.reflection || "",
            screenshot_slots: parsedSlots.length > 0 ? parsedSlots : undefined,
          };
        }));
      }
    } else {
      // Reset state if no review exists
      setReviewId(null);
      setReviewData({
        what_went_well: "",
        lessons_learned: "",
        missed_opportunities: "",
      });
      setMissedScreenshots([]);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("You must be logged in");
      setIsSaving(false);
      return;
    }

    try {
      const reviewDate = format(date, 'yyyy-MM-dd');
      
      // Upsert daily review
      const { data: review, error: reviewError } = await supabase
        .from("daily_reviews")
        .upsert({
          id: reviewId || undefined,
          user_id: user.id,
          review_date: reviewDate,
          total_pl: totalPL,
          what_went_well: reviewData.what_went_well,
          lessons_learned: reviewData.lessons_learned,
          missed_opportunities: reviewData.missed_opportunities,
          missed_opportunities_screenshots: missedScreenshots.length > 0 ? missedScreenshots.map(s => s.screenshot_url) : null,
          missed_opportunities_data: missedScreenshots.length > 0 ? JSON.parse(JSON.stringify(missedScreenshots)) : null,
        }, { onConflict: 'user_id,review_date' })
        .select()
        .single();

      if (reviewError) throw reviewError;

      // Delete existing trade slides and re-insert
      await supabase
        .from("trade_review_slides")
        .delete()
        .eq("daily_review_id", review.id);

      // Insert trade slides
      const slidesToInsert = tradeSlides.map((slide, index) => ({
        daily_review_id: review.id,
        trade_id: slide.trade_id,
        user_id: user.id,
        screenshot_url: slide.screenshot_url,
        markers: JSON.parse(JSON.stringify(slide.markers)) as Json,
        reflection: slide.reflection,
        screenshot_slots: slide.screenshot_slots ? JSON.parse(JSON.stringify(slide.screenshot_slots)) : null,
        slide_order: index,
      } as any));

      if (slidesToInsert.length > 0) {
        const { error: slidesError } = await supabase
          .from("trade_review_slides")
          .insert(slidesToInsert);

        if (slidesError) throw slidesError;
      }

      setReviewId(review.id);
      toast.success("Review saved successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to save review");
    } finally {
      setIsSaving(false);
    }
  };

  const updateTradeSlide = (tradeId: string, updates: Partial<TradeSlideData>) => {
    // Find the symbol of the trade being updated
    const currentTrade = trades.find(t => t.id === tradeId);
    const symbol = currentTrade?.symbol || currentTrade?.pair;
    
    setTradeSlides(prev => prev.map(slide => {
      if (slide.trade_id === tradeId) {
        // This is the trade being directly updated
        return { ...slide, ...updates };
      }
      
      // If screenshot_slots are being updated, sync ONLY the base image URLs to other trades with the same symbol
      // Do NOT sync markers or cropping - each trade gets its own unique annotations
      if (updates.screenshot_slots && symbol) {
        const slideTrade = trades.find(t => t.id === slide.trade_id);
        const slideSymbol = slideTrade?.symbol || slideTrade?.pair;
        
        if (slideSymbol === symbol) {
          // Get the current slots for this slide, or create default structure
          const currentSlots = slide.screenshot_slots || [{
            id: `slot-${slide.trade_id}-entry-${Date.now()}`,
            label: 'Entry TF',
            screenshot_url: slide.screenshot_url,
            markers: slide.markers || []
          }];
          
          // Sync only NEW timeframe slots (by label) with their base images
          // Preserve existing markers/cropping for slots that already exist
          const syncedSlots = updates.screenshot_slots.map(sourceSlot => {
            // Find existing slot with same label in this trade's slots
            const existingSlot = currentSlots.find(s => s.label === sourceSlot.label);
            
            if (existingSlot) {
              // Slot exists - only update the base image URL if it's a NEW image
              // Preserve the existing markers (allows each trade to have unique annotations)
              // If the source image is null (deleted), don't propagate deletion - each trade controls its own
              if (sourceSlot.screenshot_url && !existingSlot.screenshot_url) {
                // New image added to source - sync it but with empty markers for this trade
                return {
                  ...existingSlot,
                  screenshot_url: sourceSlot.screenshot_url,
                  markers: [] // Fresh markers for this trade to annotate
                };
              }
              // Keep existing slot unchanged (preserve its own markers/image)
              return existingSlot;
            } else {
              // New timeframe slot - create it with the base image but empty markers
              return {
                id: `slot-${slide.trade_id}-${sourceSlot.label}-${Date.now()}`,
                label: sourceSlot.label,
                screenshot_url: sourceSlot.screenshot_url,
                markers: [] // Each trade gets fresh markers to annotate
              };
            }
          });
          
          return { 
            ...slide, 
            screenshot_slots: syncedSlots,
            screenshot_url: syncedSlots[0]?.screenshot_url || null,
            markers: syncedSlots[0]?.markers || []
          };
        }
      }
      
      return slide;
    }));
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const getSlideTitle = () => {
    if (currentSlide === 0) return "Day Summary";
    if (currentSlide === 1) return "Trades Overview";
    if (currentSlide >= 2 && currentSlide < 2 + trades.length) {
      const tradeIndex = currentSlide - 2;
      const trade = trades[tradeIndex];
      return `Trade ${tradeIndex + 1}: ${trade.symbol || trade.pair || 'Unknown'}`;
    }
    if (currentSlide === 2 + trades.length) return "Missed Opportunities";
    if (currentSlide === 3 + trades.length) return "What Went Well";
    return "Lessons Learned";
  };

  const renderSlide = () => {
    // Slide 0: Day Summary
    if (currentSlide === 0) {
      return <DaySummarySlide date={date} totalPL={totalPL} tradesCount={trades.length} />;
    }
    
    // Slide 1: Trades Overview
    if (currentSlide === 1) {
      return <TradesOverviewSlide trades={trades} />;
    }
    
    // Trade slides
    if (currentSlide >= 2 && currentSlide < 2 + trades.length) {
      const tradeIndex = currentSlide - 2;
      const trade = trades[tradeIndex];
      const slideData = tradeSlides[tradeIndex];
      
      return (
        <TradeReviewSlide 
          trade={trade}
          slideData={slideData}
          onUpdate={(updates) => updateTradeSlide(trade.id, updates)}
        />
      );
    }
    
    // Missed Opportunities
    if (currentSlide === 2 + trades.length) {
      return (
        <MissedOpportunitiesSlide
          content={reviewData.missed_opportunities}
          screenshots={missedScreenshots}
          onContentChange={(content) => setReviewData(prev => ({ ...prev, missed_opportunities: content }))}
          onScreenshotsChange={setMissedScreenshots}
        />
      );
    }
    
    // What Went Well
    if (currentSlide === 3 + trades.length) {
      return (
        <WhatWentWellSlide
          content={reviewData.what_went_well}
          onContentChange={(content) => setReviewData(prev => ({ ...prev, what_went_well: content }))}
        />
      );
    }
    
    // Lessons Learned
    return (
      <LessonsLearnedSlide
        content={reviewData.lessons_learned}
        onContentChange={(content) => setReviewData(prev => ({ ...prev, lessons_learned: content }))}
      />
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[85vh] flex flex-col p-0 gap-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-xl font-bold">{getSlideTitle()}</h2>
            <p className="text-sm text-muted-foreground">
              Slide {currentSlide + 1} of {totalSlides}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSave}
              disabled={isSaving}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save Review"}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Slide Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderSlide()}
        </div>

        {/* Navigation Footer */}
        <div className="flex items-center justify-between p-4 border-t bg-muted/30">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentSlide === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          {/* Slide indicators */}
          <div className="flex gap-1">
            {Array.from({ length: totalSlides }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === currentSlide ? 'bg-primary' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
              />
            ))}
          </div>
          
          <Button
            variant="outline"
            onClick={handleNext}
            disabled={currentSlide === totalSlides - 1}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
