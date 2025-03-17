import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { ArrowRight, Mail, Globe } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Navbar } from "@/components/Navbar";

const SignUp = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUpWithEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreeToTerms) {
      toast({
        title: "Terms Required",
        description: "You must agree to the terms and conditions to continue.",
        variant: "destructive",
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // In a real app, connect to your authentication provider here
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Account created!",
        description: "Welcome to Dandy! You can now make a test call.",
      });
      
      navigate("/");
    } catch (error) {
      toast({
        title: "Sign up failed",
        description: "There was a problem creating your account.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpWithGoogle = async () => {
    setIsLoading(true);
    
    try {
      // In a real app, connect to your Google auth provider here
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Google sign-in successful!",
        description: "Welcome to Dandy! You can now make a test call.",
      });
      
      navigate("/");
    } catch (error) {
      toast({
        title: "Google sign-in failed",
        description: "There was a problem signing in with Google.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="py-32 px-6 md:px-10">
        <div className="max-w-md mx-auto">
          <Card className="border-border/40 shadow-lg">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
              <CardDescription>
                Get started with a free test call
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                type="button"
                className="w-full"
                onClick={handleSignUpWithGoogle}
                disabled={isLoading}
              >
                <Globe className="mr-2 h-4 w-4" />
                Sign up with Google
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              
              <form onSubmit={handleSignUpWithEmail} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={agreeToTerms}
                    onCheckedChange={(checked) => 
                      setAgreeToTerms(checked === true)
                    }
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I agree to the{" "}
                    <a href="#" className="text-primary hover:underline">
                      terms and conditions
                    </a>
                  </label>
                </div>
                <Button
                  type="submit"
                  className="w-full group"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Create Account"}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center">
              <div className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <a
                  href="/login"
                  className="text-primary font-medium hover:underline"
                >
                  Log in
                </a>
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default SignUp;
