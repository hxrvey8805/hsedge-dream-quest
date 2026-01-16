import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Lightbulb, BookOpen } from "lucide-react";

interface LessonsLearnedSlideProps {
  content: string;
  onContentChange: (content: string) => void;
}

export const LessonsLearnedSlide = ({ content, onContentChange }: LessonsLearnedSlideProps) => {
  const prompts = [
    "What would you do differently?",
    "What patterns should you avoid?",
    "Any rules you need to add or modify?",
    "What will you focus on tomorrow?",
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 text-center justify-center">
        <Lightbulb className="w-8 h-8 text-yellow-500" />
        <h3 className="text-2xl font-bold">Lessons Learned</h3>
      </div>
      
      <p className="text-center text-muted-foreground">
        Every trading day teaches us something. Capture your insights for continuous improvement.
      </p>

      {/* Prompts */}
      <div className="grid grid-cols-2 gap-3">
        {prompts.map((prompt, index) => (
          <div
            key={index}
            className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-sm"
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            <span>{prompt}</span>
          </div>
        ))}
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label className="text-base font-semibold">Key Takeaways</Label>
        <Textarea
          placeholder="What are the most important lessons from today's trading session? What insights will help you improve?"
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          className="min-h-[250px] resize-none"
        />
      </div>
    </div>
  );
};
