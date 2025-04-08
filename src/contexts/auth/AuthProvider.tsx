
import React, { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { User } from './types';
import { clearAllAuthData } from '@/utils/sessionCleanup';
import { toast } from '@/components/ui/use-toast';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    // Check for existing session on mount
    const getSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        
        if (data.session?.user) {
          setUser(data.session.user);
          
          // Simple admin check
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .maybeSingle();
            
          if (profileData) {
            setProfile(profileData);
            setIsAdmin(!!profileData.is_admin);
          }
        }
      } catch (error) {
        console.error("Auth session check error:", error);
        setError(error instanceof Error ? error : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
        setInitialized(true);
        setSessionChecked(true);
      }
    };
    
    getSession();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          
          // Fetch user profile
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
            
          if (profileData) {
            setProfile(profileData);
            setIsAdmin(!!profileData.is_admin);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
          clearAllAuthData();
        }
        
        setIsLoading(false);
        setInitialized(true);
        setSessionChecked(true);
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Simplified profile update
  const updateProfile = async (data: any) => {
    if (!user) {
      return { error: new Error('No authenticated user') };
    }

    try {
      const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id)
        .single();

      if (error) throw error;

      // Update local state
      setProfile(prev => prev ? { ...prev, ...data } : null);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully"
      });

      return { error: null };
    } catch (error) {
      console.error("Error updating profile:", error);
      return { error: error instanceof Error ? error : new Error(String(error)) };
    }
  };

  // Simple sign out function
  const signOut = async () => {
    try {
      // Clear user state
      setUser(null);
      setProfile(null);
      setIsAdmin(false);
      clearAllAuthData();
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      return { success: true, error: null };
    } catch (error) {
      console.error("Error during sign out:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error(String(error)) 
      };
    }
  };

  const value = {
    user,
    profile,
    isLoading,
    isAuthenticated: !!user,
    isAdmin,
    error,
    initialized,
    sessionChecked,
    setProfile,
    updateProfile,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
