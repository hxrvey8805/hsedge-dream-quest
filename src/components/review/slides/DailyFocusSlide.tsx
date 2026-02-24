import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { TrendingUp, Star } from "lucide-react";

interface PreviousFocus {
  id: string;
  focus_text: string;
  review_date: string;
}

interface DailyFocusSlideProps {
  previousFocus: PreviousFocus | null;
  executionRating: number | null;
  executionNotes: string;
  newFocusText: string;
  onExecutionRatingChange: (rating: number) => void;
  onExecutionNotesChange: (notes: string) => void;
  onNewFocusTextChange: (text: string) => void;
}

export const DailyFocusSlide = ({
  previousFocus,
  executionRating,
  executionNotes,
  newFocusText,
  onExecutionRatingChange,
  onExecutionNotesChange,
  onNewFocusTextChange,
}: DailyFocusSlideProps) => {
  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3">
          <span className="text-5xl font-black text-primary">1%</span>
          <TrendingUp className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-foreground">Better Every Day</h3>
        <p className="text-sm text-muted-foreground">
          Small daily improvements lead to massive long-term results
        </p>
      </div>

      {/* Rate Yesterday's Focus */}
      {previousFocus && (
        <Card className="p-5 border-primary/20 bg-primary/5">
          <h4 className="text-sm font-semibold text-primary uppercase tracking-wide mb-3">
            Yesterday's Focus
          </h4>
          <p className="text-foreground font-medium mb-4 italic">
            "{previousFocus.focus_text}"
          </p>

          <div className="space-y-3">
            <Label className="text-sm text-muted-foreground">
              How well did you execute on this? (1-5)
            </Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => onExecutionRatingChange(rating)}
                  className={`flex items-center justify-center w-12 h-12 rounded-lg border-2 transition-all duration-200 ${
                    executionRating === rating
                      ? rating >= 3
                        ? "border-accent bg-accent/20 text-accent"
                        : "border-destructive bg-destructive/20 text-destructive"
                      : "border-border bg-card hover:border-muted-foreground/50 text-muted-foreground"
                  }`}
                >
                  <Star
                    className={`w-5 h-5 ${
                      executionRating !== null && rating <= executionRating
                        ? "fill-current"
                        : ""
                    }`}
                  />
                </button>
              ))}
            </div>

            <div>
              <Label className="text-sm text-muted-foreground">
                Brief reflection (optional)
              </Label>
              <Textarea
                placeholder="What helped or hindered your execution..."
                value={executionNotes}
                onChange={(e) => onExecutionNotesChange(e.target.value)}
                className="mt-1 bg-card border-border resize-none"
                rows={2}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Set Tomorrow's Focus */}
      <Card className="p-5 border-accent/20 bg-accent/5">
        <h4 className="text-sm font-semibold text-accent uppercase tracking-wide mb-3">
          Tomorrow's 1% Focus
        </h4>
        <p className="text-sm text-muted-foreground mb-3">
          What's the one specific thing you'll focus on improving tomorrow?
        </p>
        <Textarea
          placeholder="e.g., Wait for confirmation candle before entering, Cut position size when trading against trend..."
          value={newFocusText}
          onChange={(e) => onNewFocusTextChange(e.target.value)}
          className="bg-card border-border resize-none"
          rows={3}
        />
      </Card>
    </div>
  );
};
