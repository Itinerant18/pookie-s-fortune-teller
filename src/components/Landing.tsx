import { Sparkles, Star, Moon, Compass, Eye } from "lucide-react";
import AuthForm from "./AuthForm";

interface LandingProps {
  onLogin: (email: string, password: string) => void;
  onSignUp: (email: string, password: string) => void;
  isLoading?: boolean;
}

const Landing = ({ onLogin, onSignUp, isLoading }: LandingProps) => {
  return (
    <div className="min-h-screen cosmic-bg overflow-hidden">
      <div className="star-field" />
      
      {/* Decorative orbs */}
      <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-[hsl(260,80%,60%,0.1)] blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-[hsl(180,70%,45%,0.08)] blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[hsl(45,93%,58%,0.05)] blur-3xl pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_20px_hsl(45,93%,58%,0.4)]">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-semibold text-gradient-gold">Pookie's Predictions</h1>
              <p className="text-xs text-muted-foreground">Astrology + AI Analytics</p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20">
          {/* Hero Section */}
          <div className="flex-1 max-w-xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/30 border border-border/50 text-sm text-muted-foreground mb-6">
              <Star className="w-4 h-4 text-primary" />
              Hybrid Prediction Technology
            </div>
            
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold leading-tight mb-6">
              <span className="text-foreground">Unlock Your</span>
              <br />
              <span className="text-gradient-gold glow-text">Cosmic Destiny</span>
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto lg:mx-0">
              Combining ancient astrological wisdom with cutting-edge AI behavior analytics 
              to provide personalized predictions for your journey ahead.
            </p>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0">
              {[
                { icon: Moon, label: "Astrology" },
                { icon: Eye, label: "AI Analysis" },
                { icon: Compass, label: "Guidance" },
              ].map((feature) => (
                <div key={feature.label} className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-muted/30 border border-border/50 flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-xs text-muted-foreground">{feature.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Auth Form */}
          <div className="w-full max-w-md">
            <AuthForm onLogin={onLogin} onSignUp={onSignUp} isLoading={isLoading} />
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-xs text-muted-foreground py-6">
          <p>✨ Your cosmic journey awaits ✨</p>
        </footer>
      </div>
    </div>
  );
};

export default Landing;
