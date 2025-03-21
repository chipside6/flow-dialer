
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, CheckCircle, XCircle, Phone } from 'lucide-react';

const VerifyEmail = () => {
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Extract token from URL if it exists
  const token = new URLSearchParams(location.search).get('token');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setIsVerifying(false);
        return;
      }

      try {
        // In a real app, this would call an API to verify the email
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
        
        // Simulate successful verification
        setIsSuccess(true);
        toast({
          title: "Email verified",
          description: "Your email has been successfully verified.",
        });
      } catch (error: any) {
        toast({
          title: "Verification failed",
          description: error.message || "Failed to verify email",
          variant: "destructive",
        });
        setIsSuccess(false);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, [token, toast]);

  return (
    <div className="container max-w-md mx-auto py-10">
      <Card className="border border-border/40 shadow-sm">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-2">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white">
              <Phone size={32} />
            </div>
          </div>
          <CardTitle className="text-2xl font-semibold text-center">
            Email Verification
          </CardTitle>
          <CardDescription className="text-center">
            {isVerifying 
              ? "Verifying your email address..." 
              : isSuccess 
                ? "Your email has been verified!" 
                : "Email verification failed"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center py-6">
          {isVerifying ? (
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
          ) : isSuccess ? (
            <CheckCircle className="h-16 w-16 text-green-500" />
          ) : (
            <XCircle className="h-16 w-16 text-red-500" />
          )}

          {!isVerifying && (
            <p className="mt-4 text-center text-muted-foreground">
              {isSuccess 
                ? "Thank you for verifying your email address. You can now log in to your account."
                : "The verification link is invalid or has expired. Please request a new verification link."}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button 
            onClick={() => navigate(isSuccess ? '/login' : '/signup')}
            className="w-full sm:w-auto"
          >
            {isSuccess ? "Go to Login" : "Back to Sign Up"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default VerifyEmail;
