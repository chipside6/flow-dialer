import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, AlertCircle, ShieldAlert, Mail, Lock, LogIn } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { Logo } from '@/components/ui/Logo';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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

  return (
    <div className="container flex flex-col items-center justify-center min-h-screen px-4 py-8 mx-auto">
      <Card className="w-full max-w-md border border-border/40 shadow-lg rounded-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 z-0 rounded-xl"></div>
        <CardHeader className="space-y-1 relative z-10 pb-2 text-left">
          <div className="flex justify-center mb-4">
            <Logo size="lg" className="animate-fade-in" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            {isAdminRedirect ? "Administrator Login" : "Welcome back"}
          </CardTitle>
          <CardDescription className="text-center text-base">
            {isAdminRedirect 
              ? "Enter your administrator credentials" 
              : "Sign in to your Flow Dialer account"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 relative z-10 pt-0">
          {isAdminRedirect && (
            <Alert className="bg-amber-50 border-amber-200 text-left">
              <ShieldAlert className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                This area requires administrator privileges
              </AlertDescription>
            </Alert>
          )}
          
          {errorMessage && (
            <Alert variant="destructive" className="animate-fade-in text-left">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-left block font-medium text-sm">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="Enter your email address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-left block font-medium text-sm">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Enter your password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full font-semibold transition-all group mt-4" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  {isAdminRedirect ? "Sign in as Administrator" : "Sign in"} 
                  <LogIn className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center pt-0 pb-6 relative z-10">
          <p className="text-sm text-center text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary font-medium hover:underline transition-colors">
              Create an account
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
