
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Eye, EyeOff, ChevronLeft, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-white px-4 pt-6">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <button 
            onClick={() => navigate('/')} 
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="h-6 w-6 text-gray-700" />
          </button>
        </div>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Create your account</h1>
          <p className="text-gray-600 mt-2">Get started with Flow Dialer today</p>
        </div>

        {errorMessage && (
          <Alert variant="destructive" className="mb-6 animate-fade-in text-left">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label htmlFor="email" className="block text-sm font-medium text-primary">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pb-2 bg-transparent border-0 border-b-2 border-gray-300 focus:border-primary focus:ring-0 text-gray-700 text-base"
              placeholder="Enter your email"
            />
          </div>
          
          <div className="space-y-1">
            <label htmlFor="password" className="block text-sm font-medium text-primary">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full pb-2 bg-transparent border-0 border-b-2 border-gray-300 focus:border-primary focus:ring-0 text-gray-700 text-base"
                placeholder="Create a password"
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-gray-200 hover:bg-gray-300 rounded-full text-gray-800 font-medium transition-colors"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Creating account...
              </span>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
