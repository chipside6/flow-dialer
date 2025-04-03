
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
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      console.log("Attempting to sign up with email:", email);
      
      // Use Supabase directly for signup
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Account created",
        description: "Your account has been created successfully with Supabase.",
      });

      // Check if email confirmation is required
      if (data.session) {
        // User is already confirmed and logged in
        navigate('/dashboard');
      } else {
        // User needs to confirm email
        toast({
          title: "Email verification required",
          description: "Please check your email to verify your account before logging in.",
        });
        navigate('/login');
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

  return (
    <AuthContainer>
      <AuthHeader title="Create your account" />
      
      {errorMessage && (
        <AuthAlert 
          type="error" 
          message={errorMessage}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-6 text-center">
        <div className="space-y-4">
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-12 text-center"
            placeholder="Enter your email"
          />
          
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password"
            minLength={6}
            className="text-center"
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
