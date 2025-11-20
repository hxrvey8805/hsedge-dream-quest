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

  const [activeFields, setActiveFields] = useState<Set<string>>(new Set());

  const toggleField = (field: string) => {
    setActiveFields(prev => {
      const newSet = new Set(prev);
      if (newSet.has(field)) {
        newSet.delete(field);
      } else {
        newSet.add(field);
      }
      return newSet;
    });
  };

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
        <p className="text-sm text-muted-foreground mb-6">Click icons below to add details about different aspects of your dream life</p>
        
        {/* Icon Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
          {allQuestions.map(({ icon: Icon, field, label }) => {
            const isActive = activeFields.has(field);
            const shortLabel = label.split("?")[0].replace(/What's your |What |Where do you /gi, "").trim();
            
            return (
              <button
                key={field}
                onClick={() => toggleField(field)}
                className={`
                  relative flex flex-col items-center gap-2 p-4 rounded-xl
                  transition-all duration-300 group
                  ${isActive 
                    ? 'bg-primary text-primary-foreground shadow-lg scale-105' 
                    : 'bg-card hover:bg-accent border border-border hover:border-primary/50 hover:scale-105'
                  }
                `}
                type="button"
              >
                <Icon className={`h-6 w-6 transition-transform duration-300 ${isActive ? '' : 'group-hover:scale-110'}`} />
                <span className={`text-xs text-center leading-tight font-medium ${isActive ? '' : 'text-muted-foreground group-hover:text-foreground'}`}>
                  {shortLabel}
                </span>
                
                {/* Active Indicator Dot */}
                {isActive && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background animate-pulse" />
                )}
              </button>
            );
          })}
        </div>

        {/* Active Fields Inputs - Stacked */}
        {activeFields.size > 0 && (
          <div className="space-y-4 pt-4 border-t border-border">
            {allQuestions.map(({ field, label, placeholder }) => {
              if (!activeFields.has(field)) return null;
              
              return (
                <div key={field} className="space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={field} className="text-base font-semibold">{label}</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleField(field)}
                      className="h-8 text-xs text-muted-foreground hover:text-foreground"
                      type="button"
                    >
                      Close
                    </Button>
                  </div>
                  <Textarea
                    id={field}
                    value={formData[field as keyof typeof formData] as string}
                    onChange={(e) =>
                      setFormData({ ...formData, [field]: e.target.value })
                    }
                    placeholder={placeholder}
                    className="min-h-[120px] resize-none"
                  />
                </div>
              );
            })}
          </div>
        )}

        {activeFields.size === 0 && (
          <p className="text-center text-muted-foreground py-8">
            Click icons above to start building your dream life vision
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
