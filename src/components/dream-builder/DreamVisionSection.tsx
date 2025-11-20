import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Save, Sparkles, Home, Car, Shirt, Plane, Utensils, Users, Heart } from "lucide-react";

interface DreamVisionSectionProps {
  dreamProfile: any;
  onSave: (data: any) => void;
}

export const DreamVisionSection = ({ dreamProfile, onSave }: DreamVisionSectionProps) => {
  const [formData, setFormData] = useState({
    title: "",
    dream_type: "future",
    timescale: "",
    living_situation: "",
    vehicle: "",
    style: "",
    travel: "",
    diet_lifestyle: "",
    professional_help: "",
    luxury_approach: "",
    why_motivation: "",
  });

  useEffect(() => {
    if (dreamProfile) {
      setFormData(dreamProfile);
    }
  }, [dreamProfile]);

  const handleSubmit = () => {
    onSave(formData);
  };

  const questions = [
    {
      icon: Home,
      label: "Where do you live? What does your house/apartment look like?",
      field: "living_situation",
      placeholder: "Describe your dream home...",
    },
    {
      icon: Car,
      label: "What car(s) do you drive, if any?",
      field: "vehicle",
      placeholder: "Your dream vehicles...",
    },
    {
      icon: Shirt,
      label: "What clothes or style do you wear daily?",
      field: "style",
      placeholder: "Your style and wardrobe...",
    },
    {
      icon: Plane,
      label: "Where do you travel, and how often?",
      field: "travel",
      placeholder: "Your travel dreams...",
    },
    {
      icon: Utensils,
      label: "What's your diet or lifestyle like?",
      field: "diet_lifestyle",
      placeholder: "Your ideal lifestyle...",
    },
    {
      icon: Users,
      label: "What personal/professional help do you employ?",
      field: "professional_help",
      placeholder: "Chef, accountant, assistant...",
    },
  ];

  const [activeField, setActiveField] = useState<string | null>(null);

  const allQuestions = [
    ...questions,
    {
      icon: Sparkles,
      label: "What's your approach to luxury vs minimalism?",
      field: "luxury_approach",
      placeholder: "Your philosophy on wealth and possessions...",
    },
    {
      icon: Heart,
      label: "What's your WHY?",
      field: "why_motivation",
      placeholder: "This is the most important question. What truly drives you?",
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="p-8 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border-primary/20">
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-3xl font-bold">Dream Vision</h2>
            <p className="text-muted-foreground">Define what your dream life actually looks like</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <Label htmlFor="title">Dream Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., My Ultimate Trading Lifestyle 2025"
              className="mt-2"
            />
          </div>

          <div>
            <Label>Dream Type</Label>
            <RadioGroup
              value={formData.dream_type}
              onValueChange={(value) => setFormData({ ...formData, dream_type: value })}
              className="flex gap-4 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="present" id="present" />
                <Label htmlFor="present">Present Dream</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="future" id="future" />
                <Label htmlFor="future">Future Dream</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="timescale">Timescale</Label>
            <Input
              id="timescale"
              value={formData.timescale || ""}
              onChange={(e) => setFormData({ ...formData, timescale: e.target.value })}
              placeholder="e.g., Within 2 years, By 2026, Next 5 years"
              className="mt-2"
            />
          </div>
        </div>
      </Card>

      <Card className="p-8 bg-card/50 backdrop-blur-sm">
        <h3 className="text-2xl font-bold mb-6">Visualize Your Life</h3>
        
        {/* Horizontal Icon Row */}
        <div className="flex flex-wrap gap-4 mb-6">
          {allQuestions.map(({ icon: Icon, field, label }) => (
            <Button
              key={field}
              variant={activeField === field ? "default" : "outline"}
              size="lg"
              onClick={() => setActiveField(activeField === field ? null : field)}
              className="flex flex-col items-center gap-2 h-auto py-4 px-6"
              type="button"
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs text-center max-w-[100px] leading-tight">
                {label.split("?")[0].replace(/What's your |What |Where do you /gi, "")}
              </span>
            </Button>
          ))}
        </div>

        {/* Active Field Input */}
        {activeField && (
          <div className="space-y-2 animate-fade-in">
            <Label htmlFor={activeField} className="flex items-center gap-2 text-base font-semibold">
              {allQuestions.find((q) => q.field === activeField)?.icon && 
                (() => {
                  const Icon = allQuestions.find((q) => q.field === activeField)!.icon;
                  return <Icon className="h-5 w-5 text-primary" />;
                })()
              }
              {allQuestions.find((q) => q.field === activeField)?.label}
            </Label>
            <Textarea
              id={activeField}
              value={formData[activeField as keyof typeof formData] || ""}
              onChange={(e) => setFormData({ ...formData, [activeField]: e.target.value })}
              placeholder={allQuestions.find((q) => q.field === activeField)?.placeholder}
              className="mt-2"
              rows={activeField === "why_motivation" ? 5 : 4}
              autoFocus
            />
          </div>
        )}

        {!activeField && (
          <p className="text-center text-muted-foreground py-8">
            Click an icon above to add details about your dream life
          </p>
        )}
      </Card>

      <div className="flex justify-center">
        <Button onClick={handleSubmit} size="lg" className="gap-2">
          <Save className="h-5 w-5" />
          Save Dream Vision
        </Button>
      </div>
    </div>
  );
};
