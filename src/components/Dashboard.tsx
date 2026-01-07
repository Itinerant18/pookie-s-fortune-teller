import { Button } from "@/components/ui/button";
import PredictionCard from "./PredictionCard";
import GeneratePrediction from "./GeneratePrediction";
import { LogOut, User, Sparkles } from "lucide-react";

interface Prediction {
  id: string;
  category: string;
  timeframe: string;
  combined_prediction?: {
    recommendation?: string;
  };
  created_at?: string;
}

interface DashboardProps {
  userEmail: string;
  predictions: Prediction[];
  onLogout: () => void;
  onGenerate: (category: string, timeframe: string) => Promise<void>;
  isGenerating?: boolean;
}

const Dashboard = ({ userEmail, predictions, onLogout, onGenerate, isGenerating }: DashboardProps) => {
  return (
    <div className="min-h-screen cosmic-bg">
      <div className="star-field" />
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-border/50 backdrop-blur-md bg-background/30">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-serif font-semibold text-gradient-gold hidden sm:block">
                Pookie's Predictions
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">{userEmail}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={onLogout}>
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline ml-2">Sign Out</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Generate Section */}
            <div className="lg:col-span-1">
              <GeneratePrediction onGenerate={onGenerate} isGenerating={isGenerating} />
            </div>

            {/* Predictions List */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-serif font-semibold">Your Predictions</h2>
                <span className="text-sm text-muted-foreground">
                  {predictions.length} reading{predictions.length !== 1 ? "s" : ""}
                </span>
              </div>

              {predictions.length === 0 ? (
                <div className="text-center py-16 glass-card rounded-xl">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center float-animation">
                    <Sparkles className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-serif font-medium mb-2">No predictions yet</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Generate your first cosmic prediction to unlock insights about your future
                  </p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {predictions.map((prediction, index) => (
                    <div
                      key={prediction.id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <PredictionCard prediction={prediction} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
