
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

import { AuthContainer } from '@/components/auth/AuthContainer';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { AuthAlert } from '@/components/auth/AuthAlert';
import { AuthButton } from '@/components/auth/AuthButton';
import { PasswordInput } from '@/components/auth/PasswordInput';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if we have access to recovery token via URL
  useEffect(() => {
    // The recovery token is automatically handled by Supabase Auth
    const checkRecoveryToken = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      // If there's no session and no recovery flow, redirect to login
      if (!data.session && !window.location.hash) {
        toast({
          title: "Invalid or expired link",
          description: "Please request a new password reset link",
          variant: "destructive",
        });
        navigate('/forgot-password');
      }
    };
    
    checkRecoveryToken();
  }, [navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Password validation
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters long");
      }

      // Update password using Supabase
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Password updated",
        description: "Your password has been successfully updated",
      });

      // Navigate to login page
      setTimeout(() => navigate('/login'), 1500);
      
    } catch (error: any) {
      console.error("Password reset error:", error);
      setErrorMessage(error.message || "Failed to reset password");
      toast({
        title: "Password reset failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContainer>
      <AuthHeader title="Create New Password" emoji="🔐" />
      
      {errorMessage && (
        <AuthAlert 
          type="error" 
          message={errorMessage}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
            minLength={6}
          />
          
          <PasswordInput
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            minLength={6}
          />
        </div>

        <AuthButton 
          isLoading={isLoading} 
          buttonText="Reset Password" 
          loadingText="Updating..."
        />
      </form>
    </AuthContainer>
  );
};

export default ResetPassword;
