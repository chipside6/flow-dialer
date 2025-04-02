import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Eye, EyeOff, ChevronLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ShieldAlert } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { Checkbox } from '@/components/ui/checkbox';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, isAdmin, initialized } = useAuth();
  
  // Get the intended destination from location state, or default to dashboard
  const from = location.state?.from?.pathname || '/dashboard';
  const isAdminRedirect = from === '/admin';

  // Redirect authenticated users to appropriate pages
  useEffect(() => {
    if (isAuthenticated && initialized) {
      if (isAdminRedirect && !isAdmin) {
        // If trying to reach admin but not an admin
        navigate('/unauthorized', { 
          state: { from: { pathname: '/admin' } },
          replace: true 
        });
      } else {
        // Normal authenticated redirect
        console.log("User is already authenticated, redirecting to:", from);
        navigate(from, { replace: true });
      }
    }
  }, [isAuthenticated, navigate, from, isAdmin, isAdminRedirect, initialized]);

  // handleSubmit function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      console.log("Attempting to sign in with:", email);
      
      // Use Supabase directly for authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error("Login error:", error);
        throw error;
      }

      console.log("Login successful, user:", data.user);
      
      toast({
        title: "Login successful",
        description: "You've been successfully logged in",
      });

      // For admin redirects, we'll let the useEffect handle it based on isAdmin status
      // For regular redirects, navigate directly
      if (!isAdminRedirect) {
        navigate(from, { replace: true });
      }
      // Otherwise the useEffect will handle redirecting when auth state updates
      
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full mx-auto">
        <div className="absolute top-6 left-4">
          <button 
            onClick={() => navigate('/')} 
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="h-6 w-6 text-gray-700" />
          </button>
        </div>
        
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
            <span className="text-2xl">👋</span> Welcome back
          </h1>
        </div>

        {isAdminRedirect && (
          <Alert className="mb-6 bg-amber-50 border-amber-200 text-left">
            <ShieldAlert className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              This area requires administrator privileges
            </AlertDescription>
          </Alert>
        )}
        
        {errorMessage && (
          <Alert variant="destructive" className="mb-6 animate-fade-in text-left">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-12 px-3 bg-transparent border-0 border-b-2 border-gray-300 focus:border-primary focus:ring-0 text-gray-700 text-base placeholder:text-gray-500"
              placeholder="Enter your email"
            />
            
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-12 px-3 bg-transparent border-0 border-b-2 border-gray-300 focus:border-primary focus:ring-0 text-gray-700 text-base placeholder:text-gray-500"
                placeholder="Enter your password"
              />
              <button 
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-2 bottom-2 text-primary focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="terms" className="data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
            <div className="text-sm text-gray-600">
              I acknowledge and agree to the{' '}
              <Link to="/terms" className="text-primary hover:underline">
                Terms of Use
              </Link>
              , <Link to="/disclosure" className="text-primary hover:underline">
                911 Disclosures
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
              .
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 py-3 px-4 bg-gray-200 hover:bg-gray-300 rounded-full text-gray-800 font-medium transition-colors"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Signing in...
              </span>
            ) : (
              <span>Log In</span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/forgot-password" className="text-primary hover:underline text-sm">
            Forgot Password?
          </Link>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary font-medium hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
