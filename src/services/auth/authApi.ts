
import { toast } from "@/components/ui/use-toast";
import { User, Session, API_URL } from './types';
import { storeSession, clearSession } from './session';

// Sign up a new user
export const signUp = async (email: string, password: string, metadata?: { full_name?: string }): Promise<{ error: Error | null, session?: Session }> => {
  try {
    console.log("Signing up new user:", email);
    
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password,
        metadata
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to sign up');
    }
    
    // Check if session data is returned on signup
    if (data.session) {
      // Store the session just like we do with login
      storeSession(data.session);
      return { error: null, session: data.session };
    }
    
    return { error: null };
  } catch (error: any) {
    console.error("Sign up error:", error.message);
    return { error: new Error(error.message) };
  }
};

// Sign in an existing user
export const signIn = async (email: string, password: string): Promise<{ error: Error | null, session?: Session }> => {
  try {
    console.log("Signing in user:", email);
    
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Invalid login credentials');
    }
    
    if (!data.session) {
      throw new Error('Invalid response format from server');
    }
    
    // Store the session
    storeSession(data.session);
    
    return { error: null, session: data.session };
  } catch (error: any) {
    console.error("Sign in error:", error.message);
    return { error: new Error(error.message) };
  }
};

// Sign out the current user
export const signOut = async (): Promise<{ success: boolean, error: Error | null }> => {
  try {
    console.log("Signing out user");
    const session = getStoredSession();
    
    if (session) {
      // Call the logout endpoint
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.token || ''}`
        }
      });
    }
    
    // Clear the local session regardless of API call result
    clearSession();
    
    return { success: true, error: null };
  } catch (error: any) {
    console.error("Sign out error:", error.message);
    
    // Still clear the session even if API call fails
    clearSession();
    
    return { success: false, error: new Error(error.message) };
  }
};

import { getStoredSession } from './session';
