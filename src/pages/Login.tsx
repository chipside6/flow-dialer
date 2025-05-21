
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { storeSession, storeAdminStatus } from '@/services/auth/session';
import { clearAllAuthData } from '@/utils/sessionCleanup';
import { Eye, EyeOff } from 'lucide-react';

import { AuthContainer } from '@/components/auth/AuthContainer';
import { AuthAlert } from '@/components/auth/AuthAlert';
import { AuthButton } from '@/components/auth/AuthButton';
import { AuthFooter } from '@/components/auth/AuthFooter';
import { Input } from '@/components/ui/input';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
  // Extract returnTo from location state if available
  const returnTo = location.state?.returnTo || '/dashboard';
  
  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate(returnTo, { replace: true });
    }
  }, [isAuthenticated, navigate, returnTo]);
  
  // Clear error when user changes inputs
  useEffect(() => {
    if (errorMessage) {
      setErrorMessage(null);
    }
  }, [email, password, errorMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading) return;
    
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Clear any existing sessions to prevent conflicts
      await supabase.auth.signOut({ scope: 'local' });
      clearAllAuthData(); // Use our enhanced cleanup function
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        // Format error messages to be more user-friendly
        let message = error.message || "Failed to login";
        
        if (message.includes("credentials") || message.includes("Invalid") || 
            message.includes("password") || message.includes("user")) {
          message = "Invalid email or password. Please check your credentials and try again.";
        } else if (message.includes("network") || message.includes("connect")) {
          message = "Unable to connect to the server. Please check your internet connection.";
        }
        
        setErrorMessage(message);
        setIsLoading(false);
        return;
      }
      
      // Store the session information in sessionStorage for persistence
      if (data.session) {
        const userData = data.session.user;
        
        storeSession({
          user: {
            id: userData.id,
            email: userData.email || '',
            created_at: userData.created_at,
            last_sign_in_at: userData.last_sign_in_at
          },
          token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at
        });
        
        // Fetch admin status and store it
        try {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', userData.id)
            .maybeSingle();
            
          if (profileData) {
            storeAdminStatus(!!profileData.is_admin);
          }
        } catch (profileError) {
          console.error("Error fetching admin status:", profileError);
        }
        
        sessionStorage.setItem('sessionLastUpdated', Date.now().toString());
      }
      
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      
      // Navigate to the returnTo path
      navigate(returnTo, { replace: true });
      
    } catch (error: any) {
      console.error("Login error:", error);
      setErrorMessage("An unexpected error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-1 flex items-center justify-center">
            👋 Welcome back
          </h1>
        </div>

        {errorMessage && (
          <AuthAlert 
            type="error" 
            message={errorMessage}
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 w-full"
              placeholder="Enter your email"
              disabled={isLoading}
            />
            
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 w-full pr-10"
                placeholder="Enter your password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-500"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging In...
              </>
            ) : (
              "Log In"
            )}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <button 
            type="button"
            onClick={() => navigate('/forgot-password')}
            className="text-sm text-blue-500 hover:text-blue-700"
          >
            Forgot your password?
          </button>
        </div>
        
        <div className="mt-4 text-center">
          <span className="text-gray-600">Don't have an account? </span>
          <button 
            type="button"
            onClick={() => navigate('/signup')}
            className="text-blue-500 hover:text-blue-700 font-medium"
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
