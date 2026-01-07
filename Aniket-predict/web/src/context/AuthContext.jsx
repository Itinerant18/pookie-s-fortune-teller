import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (event === 'SIGNED_IN' && session?.user) {
          await fetchProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
          setIsOnboardingComplete(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError);
      }

      // Check if user has a birth chart (indicates onboarding completion)
      const { data: birthChartData, error: chartError } = await supabase
        .from('birth_charts')
        .select('id')
        .eq('user_id', userId)
        .single();

      const hasCompletedOnboarding = !!birthChartData && !!profileData?.first_name;

      // Create a combined profile object
      const fullProfile = profileData ? {
        ...profileData,
        full_name: profileData.first_name 
          ? `${profileData.first_name}${profileData.last_name ? ' ' + profileData.last_name : ''}` 
          : null,
      } : null;

      setProfile(fullProfile);
      setIsOnboardingComplete(hasCompletedOnboarding);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const signUp = async (email, password, metadata = {}) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setProfile(null);
      setSession(null);
      setIsOnboardingComplete(false);
      return { error: null };
    } catch (error) {
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const updatePassword = async (newPassword) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const updateProfile = async (updates) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      
      setProfile(data);
      setIsOnboardingComplete(data?.onboarding_completed ?? false);
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const completeOnboarding = async (profileData, birthChartData) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      // Extract first and last name from full_name
      const names = (profileData.full_name || '').split(' ');
      const firstName = names[0] || '';
      const lastName = names.slice(1).join(' ') || '';

      // Update profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          first_name: firstName,
          last_name: lastName,
          gender: profileData.gender,
          updated_at: new Date().toISOString(),
        });

      if (profileError) throw profileError;

      // Save birth chart data
      const { error: chartError } = await supabase
        .from('birth_charts')
        .upsert({
          user_id: user.id,
          birth_date: birthChartData.birth_date,
          birth_time: birthChartData.birth_time,
          birth_location_name: birthChartData.birth_location_name,
          birth_location_lat: birthChartData.birth_location_lat,
          birth_location_lng: birthChartData.birth_location_lng,
          birth_time_accuracy: birthChartData.birth_time_accuracy || 'exact',
          updated_at: new Date().toISOString(),
        });

      if (chartError) throw chartError;

      // Refresh profile
      await fetchProfile(user.id);
      
      return { error: null };
    } catch (error) {
      console.error('Error completing onboarding:', error);
      return { error };
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    isAuthenticated: !!user,
    isOnboardingComplete,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    completeOnboarding,
    refreshProfile: () => user && fetchProfile(user.id),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
