import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { supabase } from '../services/supabase';
import { setUser, setLoading, setError, logout as logoutAction } from '../store/authSlice';
import { RootState } from '../store/store';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, loading, isAuthenticated, error } = useSelector((state: RootState) => state.auth);

  const login = useCallback(async (email: string, password: string) => {
    dispatch(setLoading(true));
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      dispatch(setUser(data.user));
      return data.user;
    } catch (err: any) {
      dispatch(setError(err.message || 'Login failed'));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const signup = useCallback(async (email: string, password: string, metaData?: any) => {
    dispatch(setLoading(true));
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metaData
            }
        });

      if (error) throw error;

      if (data.user) {
          dispatch(setUser(data.user));
      }
      return data.user;
    } catch (err: any) {
      dispatch(setError(err.message || 'Signup failed'));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const logout = useCallback(async () => {
    dispatch(setLoading(true));
    try {
      await supabase.auth.signOut();
      dispatch(logoutAction());
    } catch (err: any) {
      dispatch(setError(err.message));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const resetPassword = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
    } catch (err: any) {
      throw new Error(err.message);
    }
  }, []);

  return {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    resetPassword,
    isAuthenticated,
  };
};
