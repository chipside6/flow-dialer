
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { clearAllAuthData } from '@/utils/sessionCleanup';

import { AuthContainer } from '@/components/auth/AuthContainer';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { AuthAlert } from '@/components/auth/AuthAlert';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { AuthButton } from '@/components/auth/AuthButton';
import { AuthFooter } from '@/components/auth/AuthFooter';
import { Input } from '@/components/ui/input';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Clear existing session on login page load to prevent auth loops
  useEffect(() => {
    // Only clear on initial mount
    const shouldClearAuth = Boolean(localStorage.getItem('sb-grhvoclalziyjbjlhpml-auth-token'));
    
    if (shouldClearAuth) {
      console.log("Clearing existing auth data on login page load");
      clearAllAuthData();
    }
  }, []);
  
  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsCheckingSession(true);
        
        // Add a timeout for the session check
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session check timeout')), 2500)
        );
        
        let data;
        try {
          const result = await Promise.race([sessionPromise, timeoutPromise]) as any;
          data = result.data;
        } catch (error) {
          console.warn("Session check timed out, assuming no session");
          setIsCheckingSession(false);
          return;
        }
        
        if (data.session) {
          // Verify the session is valid by making a simple API call
          try {
            const { error } = await supabase
              .from('profiles')
              .select('id')
              .limit(1);
              
            if (error) {
              console.warn("Session appears invalid, clearing:", error);
              clearAllAuthData();
              setIsCheckingSession(false);
              return;
            }
            
            // Session is valid, redirect to dashboard
            navigate('/dashboard');
          } catch (e) {
            console.warn("Error validating session, clearing:", e);
            clearAllAuthData();
          }
        }
        
        setIsCheckingSession(false);
      } catch (error) {
        console.error("Auth check error:", error);
        setIsCheckingSession(false);
      }
    };
    
    checkAuth();
  }, [navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      // Store session timestamp
      localStorage.setItem('sessionLastUpdated', Date.now().toString());
      
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });

      navigate('/dashboard');
    } catch (error: any) {
      console.error("Login error:", error);
      setErrorMessage(error.message || "Failed to login");
      toast({
        title: "Login failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Render the login form immediately, without showing a loading screen
  return (
    <AuthContainer>
      <AuthHeader title="Welcome back" emoji="👋" />
      
      {errorMessage && (
        <AuthAlert 
          type="error" 
          message={errorMessage}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-6 px-1">
        <div className="space-y-4">
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-12"
            placeholder="Enter your email"
            disabled={isLoading || isCheckingSession}
          />
          
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading || isCheckingSession}
          />
        </div>

        <AuthButton 
          isLoading={isLoading} 
          buttonText={isCheckingSession ? "Checking session..." : "Log In"}
          disabled={isCheckingSession}
        />
      </form>

      <AuthFooter type="login" />
    </AuthContainer>
  );
};

export default Login;
