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
        <div className="space-y-6">
          {questions.map(({ icon: Icon, label, field, placeholder }) => (
            <div key={field}>
              <Label htmlFor={field} className="flex items-center gap-2 text-base">
                <Icon className="h-5 w-5 text-primary" />
                {label}
              </Label>
              <Textarea
                id={field}
                value={formData[field as keyof typeof formData] || ""}
                onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                placeholder={placeholder}
                className="mt-2"
                rows={3}
              />
            </div>
          ))}

          <div>
            <Label htmlFor="luxury_approach" className="flex items-center gap-2 text-base">
              <Sparkles className="h-5 w-5 text-primary" />
              What's your approach to luxury vs minimalism?
            </Label>
            <Textarea
              id="luxury_approach"
              value={formData.luxury_approach || ""}
              onChange={(e) => setFormData({ ...formData, luxury_approach: e.target.value })}
              placeholder="Your philosophy on wealth and possessions..."
              className="mt-2"
              rows={3}
            />
          </div>

          <div className="border-t border-border/50 pt-6">
            <Label htmlFor="why_motivation" className="flex items-center gap-2 text-lg font-semibold">
              <Heart className="h-6 w-6 text-destructive" />
              What's your WHY?
            </Label>
            <p className="text-sm text-muted-foreground mb-2">
              The emotional or deeper reason behind your goals
            </p>
            <Textarea
              id="why_motivation"
              value={formData.why_motivation || ""}
              onChange={(e) => setFormData({ ...formData, why_motivation: e.target.value })}
              placeholder="This is the most important question. What truly drives you?"
              className="mt-2"
              rows={5}
            />
          </div>
        </div>
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
