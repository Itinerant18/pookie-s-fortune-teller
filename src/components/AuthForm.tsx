import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Star, Moon } from "lucide-react";

interface AuthFormProps {
  onLogin: (email: string, password: string) => void;
  onSignUp: (email: string, password: string) => void;
  isLoading?: boolean;
}

const AuthForm = ({ onLogin, onSignUp, isLoading }: AuthFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp) {
      onSignUp(email, password);
    } else {
      onLogin(email, password);
    }
  };

  return (
    <Card variant="cosmic" className="w-full max-w-md mx-auto animate-fade-in">
      <CardHeader className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center float-animation">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <Star className="absolute -top-1 -right-1 w-4 h-4 text-primary animate-pulse" />
            <Moon className="absolute -bottom-1 -left-1 w-4 h-4 text-secondary" />
          </div>
        </div>
        <CardTitle className="text-2xl text-gradient-gold">
          {isSignUp ? "Join the Cosmos" : "Welcome Back"}
        </CardTitle>
        <CardDescription>
          {isSignUp
            ? "Create your account to unlock your cosmic predictions"
            : "Sign in to continue your celestial journey"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <Button
            type="submit"
            variant="cosmic"
            size="lg"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" />
                Loading...
              </span>
            ) : isSignUp ? (
              "Create Account"
            ) : (
              "Sign In"
            )}
          </Button>
          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AuthForm;
