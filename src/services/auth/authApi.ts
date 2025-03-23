import { toast } from "@/components/ui/use-toast";
import { User, Session, API_URL } from './types';
import { storeSession, clearSession, getStoredSession } from './session';

// Sign up a new user
export const signUp = async (email: string, password: string): Promise<{ error: Error | null, session?: Session }> => {
  try {
    console.log("Signing up new user:", email);
    
    // Add more detailed error logging
    console.log("Making signup request to:", `${API_URL}/auth/signup`);
    
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password
      }),
      // Add these options to help with CORS and network issues
      mode: 'cors',
      credentials: 'same-origin'
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Signup response not OK:", response.status, errorText);
      throw new Error(errorText || `Server responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Signup successful, received data:", data);
    
    // Check if session data is returned on signup
    if (data.session) {
      console.log("Session data received, storing session");
      // Store the session
      storeSession(data.session);
      return { error: null, session: data.session };
    }
    
    return { error: null };
  } catch (error: any) {
    console.error("Sign up error:", error.message);
    return { error: new Error(error.message || 'Network error occurred during signup') };
  }
};

// Sign in an existing user
export const signIn = async (email: string, password: string): Promise<{ error: Error | null, session?: Session }> => {
  try {
    console.log("Signing in user:", email);
    console.log("Making login request to:", `${API_URL}/auth/login`);
    
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password
      }),
      // Add these options to help with CORS and network issues
      mode: 'cors',
      credentials: 'same-origin'
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Login response not OK:", response.status, errorText);
      throw new Error(errorText || `Invalid login credentials (${response.status})`);
    }
    
    const data = await response.json();
    console.log("Login successful, received data:", data);
    
    if (!data.session) {
      throw new Error('Invalid response format from server - no session data');
    }
    
    // Store the session
    storeSession(data.session);
    
    return { error: null, session: data.session };
  } catch (error: any) {
    console.error("Sign in error:", error.message);
    return { error: new Error(error.message || 'Network error occurred during login') };
  }
};

// Sign out the current user
export const signOut = async (): Promise<{ success: boolean, error: Error | null }> => {
  try {
    console.log("Signing out user");
    const session = getStoredSession();
    
    if (session) {
      console.log("Making logout request to:", `${API_URL}/auth/logout`);
      // Call the logout endpoint
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.token || ''}`
        },
        // Add these options to help with CORS and network issues
        mode: 'cors',
        credentials: 'same-origin'
      });
    }
    
    // Clear the local session regardless of API call result
    clearSession();
    
    return { success: true, error: null };
  } catch (error: any) {
    console.error("Sign out error:", error.message);
    
    // Still clear the session even if API call fails
    clearSession();
    
    return { success: false, error: new Error(error.message || 'Error during sign out') };
  }
};
