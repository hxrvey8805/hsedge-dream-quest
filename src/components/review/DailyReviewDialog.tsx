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
import { MissedOpportunitiesSlide } from "./slides/MissedOpportunitiesSlide";
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
}

interface Marker {
  id: string;
  type: 'entry' | 'stop_loss' | 'take_profit';
  x: number;
  y: number;
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
  const [missedScreenshots, setMissedScreenshots] = useState<string[]>([]);
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
          return {
            trade_id: trade.id,
            screenshot_url: existingSlide?.screenshot_url || null,
            markers: parsedMarkers,
            reflection: existingSlide?.reflection || "",
          };
        }));
      }
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
        slide_order: index,
      }));

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
    setTradeSlides(prev => prev.map(slide => 
      slide.trade_id === tradeId ? { ...slide, ...updates } : slide
    ));
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
      <DialogContent className="max-w-5xl h-[85vh] flex flex-col p-0 gap-0">
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
