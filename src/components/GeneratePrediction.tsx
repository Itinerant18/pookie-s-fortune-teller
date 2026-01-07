import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Briefcase, Heart, TrendingUp, Clock } from "lucide-react";

interface GeneratePredictionProps {
  onGenerate: (category: string, timeframe: string) => Promise<void>;
  isGenerating?: boolean;
}

const categories = [
  { id: "career", label: "Career", icon: Briefcase, color: "from-[hsl(45,93%,58%)] to-[hsl(35,90%,45%)]" },
  { id: "love", label: "Love", icon: Heart, color: "from-[hsl(350,80%,60%)] to-[hsl(330,70%,50%)]" },
  { id: "finance", label: "Finance", icon: TrendingUp, color: "from-[hsl(150,70%,45%)] to-[hsl(170,60%,40%)]" },
];

const timeframes = [
  { id: "1_month", label: "1 Month" },
  { id: "3_months", label: "3 Months" },
  { id: "6_months", label: "6 Months" },
  { id: "1_year", label: "1 Year" },
];

const GeneratePrediction = ({ onGenerate, isGenerating }: GeneratePredictionProps) => {
  const [selectedCategory, setSelectedCategory] = useState("career");
  const [selectedTimeframe, setSelectedTimeframe] = useState("6_months");

  const handleGenerate = async () => {
    await onGenerate(selectedCategory, selectedTimeframe);
  };

  return (
    <Card variant="glass" className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gradient-gold">
          <Sparkles className="w-5 h-5 text-primary" />
          Generate Prediction
        </CardTitle>
        <CardDescription>
          Select a category and timeframe to receive your personalized cosmic reading
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">Category</label>
          <div className="grid grid-cols-3 gap-3">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`p-4 rounded-lg border transition-all duration-200 flex flex-col items-center gap-2 ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-[0_0_15px_hsl(45,93%,58%,0.2)]"
                      : "border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${cat.color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            Timeframe
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {timeframes.map((tf) => {
              const isSelected = selectedTimeframe === tf.id;
              return (
                <button
                  key={tf.id}
                  onClick={() => setSelectedTimeframe(tf.id)}
                  className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all duration-200 ${
                    isSelected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-muted/30 text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  }`}
                >
                  {tf.label}
                </button>
              );
            })}
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          variant="cosmic"
          size="lg"
          className="w-full"
          disabled={isGenerating}
        >
          {isGenerating ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" />
              Reading the stars...
            </span>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Cosmic Prediction
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default GeneratePrediction;
