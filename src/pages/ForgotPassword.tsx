
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

import { AuthAlert } from '@/components/auth/AuthAlert';
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
      // Ensure email is trimmed and valid
      const trimmedEmail = email.trim();
      if (!trimmedEmail) {
        setErrorMessage("Please enter your email address");
        setIsLoading(false);
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

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
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-1 flex items-center justify-center">
            🔐 Reset Password
          </h1>
        </div>
        
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

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground text-center">
              Enter your email address and we'll send you instructions to reset your password.
            </p>
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
                Sending...
              </>
            ) : (
              "Send Reset Link"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            type="button" 
            onClick={() => navigate('/login')}
            className="text-blue-500 hover:text-blue-700 text-sm"
          >
            Back to login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
