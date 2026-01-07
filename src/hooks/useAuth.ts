import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const STORAGE_KEY = 'pookie_auth_user';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const user = stored ? JSON.parse(stored) : null;
    return {
      user,
      isLoading: false,
      isAuthenticated: !!user,
    };
  });
  const { toast } = useToast();

  const signUp = useCallback(async (email: string, password: string, metadata?: Record<string, any>) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      // Mock signup - in production, this would call your backend
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const user: User = {
        id: crypto.randomUUID(),
        email,
        name: metadata?.name || email.split('@')[0],
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      setAuthState({ user, isLoading: false, isAuthenticated: true });
      
      toast({
        title: "Account Created",
        description: "Welcome to Pookie's Future Predicter!",
      });
      
      return { user };
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      toast({
        title: "Sign Up Failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      // Mock signin
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const user: User = {
        id: crypto.randomUUID(),
        email,
        name: email.split('@')[0],
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      setAuthState({ user, isLoading: false, isAuthenticated: true });
      
      toast({
        title: "Welcome Back",
        description: "You have been signed in successfully.",
      });
      
      return { user };
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      toast({
        title: "Sign In Failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  const signOut = useCallback(async () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setAuthState({ user: null, isLoading: false, isAuthenticated: false });
      
      toast({
        title: "Signed Out",
        description: "You have been signed out successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Sign Out Failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  const resetPassword = useCallback(async (email: string) => {
    toast({
      title: "Reset Email Sent",
      description: "Check your email for the password reset link.",
    });
  }, [toast]);

  return {
    ...authState,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };
}
