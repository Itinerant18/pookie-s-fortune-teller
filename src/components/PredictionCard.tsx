import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, TrendingUp, Heart, Briefcase, Star } from "lucide-react";

interface Prediction {
  id: string;
  category: string;
  timeframe: string;
  combined_prediction?: {
    recommendation?: string;
  };
  created_at?: string;
}

interface PredictionCardProps {
  prediction: Prediction;
}

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  career: Briefcase,
  love: Heart,
  finance: TrendingUp,
  default: Sparkles,
};

const categoryColors: Record<string, string> = {
  career: "from-[hsl(45,93%,58%)] to-[hsl(35,90%,45%)]",
  love: "from-[hsl(350,80%,60%)] to-[hsl(330,70%,50%)]",
  finance: "from-[hsl(150,70%,45%)] to-[hsl(170,60%,40%)]",
  default: "from-[hsl(260,80%,60%)] to-[hsl(280,70%,50%)]",
};

const PredictionCard = ({ prediction }: PredictionCardProps) => {
  const Icon = categoryIcons[prediction.category] || categoryIcons.default;
  const gradientClass = categoryColors[prediction.category] || categoryColors.default;

  return (
    <Card variant="prediction" className="group hover:scale-[1.02] transition-transform duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradientClass} flex items-center justify-center shadow-lg`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg capitalize">{prediction.category}</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {prediction.timeframe.replace("_", " ")}
              </p>
            </div>
          </div>
          <div className="flex gap-0.5">
            {[...Array(3)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < 2 ? "text-primary fill-primary" : "text-muted-foreground"
                }`}
              />
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-foreground/90 leading-relaxed">
          {prediction.combined_prediction?.recommendation || (
            <span className="flex items-center gap-2 text-muted-foreground">
              <span className="animate-pulse">✨</span>
              Processing your cosmic reading...
            </span>
          )}
        </p>
        {prediction.created_at && (
          <p className="text-xs text-muted-foreground mt-4 pt-3 border-t border-border/50">
            Generated {new Date(prediction.created_at).toLocaleDateString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default PredictionCard;
