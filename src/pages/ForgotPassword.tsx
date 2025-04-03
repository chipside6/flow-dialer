
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

import { AuthContainer } from '@/components/auth/AuthContainer';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { AuthAlert } from '@/components/auth/AuthAlert';
import { AuthButton } from '@/components/auth/AuthButton';
import { AuthFooter } from '@/components/auth/AuthFooter';
import { Input } from '@/components/ui/input';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      console.log("Attempting to send password reset email to:", email);
      
      // Use Supabase to send password reset email
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error("Password reset error:", error);
        throw error;
      }

      // Success message
      setSuccessMessage("Password reset instructions have been sent to your email.");
      toast({
        title: "Email sent",
        description: "If an account exists with that email, you'll receive password reset instructions.",
      });
      
    } catch (error: any) {
      console.error("Password reset error:", error);
      setErrorMessage(error.message || "Failed to send password reset email");
      toast({
        title: "Failed to send reset email",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContainer>
      <AuthHeader title="Reset Password" emoji="🔐" />
      
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

      <form onSubmit={handleSubmit} className="space-y-6 text-center px-1">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Enter your email address and we'll send you instructions to reset your password.
          </p>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-12 text-center"
            placeholder="Enter your email"
          />
        </div>

        <AuthButton 
          isLoading={isLoading} 
          buttonText="Send Reset Link" 
          loadingText="Sending..."
        />
      </form>

      <div className="mt-6 text-center">
        <button 
          type="button" 
          onClick={() => navigate('/login')}
          className="text-sm text-primary hover:underline"
        >
          Back to login
        </button>
      </div>
    </AuthContainer>
  );
};

export default ForgotPassword;
