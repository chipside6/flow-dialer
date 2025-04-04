import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

import { AuthContainer } from '@/components/auth/AuthContainer';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { AuthAlert } from '@/components/auth/AuthAlert';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { AuthButton } from '@/components/auth/AuthButton';
import { AuthFooter } from '@/components/auth/AuthFooter';
import { Input } from '@/components/ui/input';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Simple check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      setCheckingSession(true);
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate('/dashboard');
      }
      setCheckingSession(false);
    };
    
    checkAuth();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data?.user) {
        // Store session immediately if available
        if (data.session) {
          localStorage.setItem('sessionLastUpdated', Date.now().toString());
          
          toast({
            title: "Account created",
            description: "Your account has been created successfully.",
          });
          
          navigate('/dashboard');
        } else {
          setSuccessMessage("Your account has been created. You can now log in.");
          toast({
            title: "Account created",
            description: "Your account has been created successfully.",
          });
          
          // Redirect to login after a short delay
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        }
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      setErrorMessage(error.message || "An unexpected error occurred");
      toast({
        title: "Signup failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-lg text-muted-foreground">Checking session...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContainer>
      <AuthHeader title="Create your account" />
      
      {errorMessage && (
        <AuthAlert 
          type="error" 
          message={errorMessage}
        />
      )}
      
      {successMessage && (
        <AuthAlert 
          type="success" 
          message={successMessage}
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
          />
          
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password"
            minLength={6}
          />
        </div>

        <AuthButton 
          isLoading={isLoading} 
          buttonText="Create Account" 
          loadingText="Creating account..."
        />
      </form>

      <AuthFooter type="signup" />
    </AuthContainer>
  );
};

export default SignUp;
