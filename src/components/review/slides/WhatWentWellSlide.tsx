import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ThumbsUp, Sparkles } from "lucide-react";

interface WhatWentWellSlideProps {
  content: string;
  onContentChange: (content: string) => void;
}

export const WhatWentWellSlide = ({ content, onContentChange }: WhatWentWellSlideProps) => {
  const prompts = [
    "Which trades followed your strategy perfectly?",
    "What emotions did you manage well today?",
    "Did you stick to your risk management rules?",
    "What patterns did you recognize correctly?",
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 text-center justify-center">
        <ThumbsUp className="w-8 h-8 text-emerald-500" />
        <h3 className="text-2xl font-bold">What Went Well</h3>
      </div>
      
      <p className="text-center text-muted-foreground">
        Celebrate your wins and positive behaviors - even small ones matter.
      </p>

      {/* Prompts */}
      <div className="grid grid-cols-2 gap-3">
        {prompts.map((prompt, index) => (
          <div
            key={index}
            className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm"
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{prompt}</span>
          </div>
        ))}
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label className="text-base font-semibold">Your Thoughts</Label>
        <Textarea
          placeholder="Write about what you did well today. Even on losing days, there are always positives to recognize..."
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          className="min-h-[250px] resize-none"
        />
      </div>
    </div>
  );
};
