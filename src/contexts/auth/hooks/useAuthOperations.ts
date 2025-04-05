
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export function useAuthOperations() {
  const [signingIn, setSigningIn] = useState(false);
  const [signingUp, setSigningUp] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);

  const signIn = async (email: string, password: string) => {
    setSigningIn(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        return { error, data: null };
      }

      // Show success toast on successful login
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });

      return { data, error: null };
    } catch (error: any) {
      console.error('Unexpected login error:', error);
      return { 
        error: new Error(error.message || 'An unexpected error occurred'),
        data: null
      };
    } finally {
      setSigningIn(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    setSigningUp(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error('Signup error:', error);
        return { error, data: null };
      }

      toast({
        title: "Account created",
        description: "Please check your email to confirm your registration.",
      });

      return { data, error: null };
    } catch (error: any) {
      console.error('Unexpected signup error:', error);
      return { 
        error: new Error(error.message || 'An unexpected error occurred'),
        data: null 
      };
    } finally {
      setSigningUp(false);
    }
  };

  const resetPassword = async (email: string) => {
    setResettingPassword(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error('Reset password error:', error);
        return { error };
      }

      toast({
        title: "Reset link sent",
        description: "Please check your email for the password reset link.",
      });

      return { error: null };
    } catch (error: any) {
      console.error('Unexpected reset password error:', error);
      return { error: new Error(error.message || 'An unexpected error occurred') };
    } finally {
      setResettingPassword(false);
    }
  };

  return {
    signIn,
    signUp,
    resetPassword,
    signingIn,
    signingUp,
    resettingPassword
  };
}
