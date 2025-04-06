
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // First check if the email is already registered
      // Use a count query to avoid type recursion issues
      const { count, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('email', email);
      
      // If count is greater than 0, the email exists
      if (!countError && count && count > 0) {
        throw new Error('An account with this email already exists. Please use a different email or try logging in.');
      }

      // Proceed with signup if email not found
      const { data: authData, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (authData?.user) {
        // Store session immediately if available
        if (authData.session) {
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
      
      // Display user-friendly error messages
      let message = error.message || "An unexpected error occurred";
      
      // Format Supabase error messages to be more user-friendly
      if (message.includes("duplicate")) {
        message = "This email is already registered. Please use a different email or try logging in.";
      } else if (message.includes("password")) {
        message = "Password doesn't meet requirements. Please use at least 6 characters.";
      }
      
      setErrorMessage(message);
      toast({
        title: "Signup failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
