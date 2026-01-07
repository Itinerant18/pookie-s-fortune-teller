import { useState, useCallback } from "react";
import Landing from "@/components/Landing";
import Dashboard from "@/components/Dashboard";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  email: string;
}

interface Prediction {
  id: string;
  category: string;
  timeframe: string;
  combined_prediction?: {
    recommendation?: string;
  };
  created_at?: string;
}

const mockPredictions: Record<string, string[]> = {
  career: [
    "The stars align for a significant career breakthrough. Trust your instincts and take that bold step forward. A mentorship opportunity may arise unexpectedly.",
    "Your professional path shows signs of transformation. Consider upskilling in areas that excite you. Recognition from superiors is on the horizon.",
    "Collaborative projects will bring unexpected rewards. Your leadership qualities will shine in team settings.",
  ],
  love: [
    "Venus enters your chart, bringing warmth to existing relationships. For singles, a meaningful connection may emerge through shared interests.",
    "Communication is key in matters of the heart. Express your feelings openly and watch understanding deepen.",
    "A period of self-love and reflection will attract positive energy. Your emotional intelligence is your greatest asset.",
  ],
  finance: [
    "Financial opportunities are blossoming. Consider diversifying your investments and trust your analytical abilities.",
    "The cosmos suggest a period of steady growth. Avoid impulsive purchases and focus on long-term security.",
    "An unexpected financial gain may come your way. Use it wisely to build a stronger foundation.",
  ],
};

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleLogin = useCallback(async (email: string, _password: string) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    setUser({
      id: crypto.randomUUID(),
      email,
    });
    
    toast({
      title: "Welcome back! ✨",
      description: "You've successfully signed in.",
    });
    setIsLoading(false);
  }, [toast]);

  const handleSignUp = useCallback(async (email: string, _password: string) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    setUser({
      id: crypto.randomUUID(),
      email,
    });
    
    toast({
      title: "Account created! 🌟",
      description: "Welcome to your cosmic journey.",
    });
    setIsLoading(false);
  }, [toast]);

  const handleLogout = useCallback(() => {
    setUser(null);
    setPredictions([]);
    toast({
      title: "Signed out",
      description: "See you among the stars!",
    });
  }, [toast]);

  const handleGenerate = useCallback(async (category: string, timeframe: string) => {
    setIsGenerating(true);
    
    // Simulate API call with delay
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    const categoryPredictions = mockPredictions[category] || mockPredictions.career;
    const randomPrediction = categoryPredictions[Math.floor(Math.random() * categoryPredictions.length)];
    
    const newPrediction: Prediction = {
      id: crypto.randomUUID(),
      category,
      timeframe,
      combined_prediction: {
        recommendation: randomPrediction,
      },
      created_at: new Date().toISOString(),
    };
    
    setPredictions((prev) => [newPrediction, ...prev]);
    
    toast({
      title: "Prediction generated! ✨",
      description: `Your ${category} reading is ready.`,
    });
    
    setIsGenerating(false);
  }, [toast]);

  if (!user) {
    return (
      <Landing
        onLogin={handleLogin}
        onSignUp={handleSignUp}
        isLoading={isLoading}
      />
    );
  }

  return (
    <Dashboard
      userEmail={user.email}
      predictions={predictions}
      onLogout={handleLogout}
      onGenerate={handleGenerate}
      isGenerating={isGenerating}
    />
  );
};

export default Index;
