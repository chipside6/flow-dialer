
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, AlertCircle, LogIn, ArrowLeft, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';

const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const [adminEmail] = useState('admin@example.com'); 
  const [adminPassword] = useState('admin123');
  
  // Check if user came from admin panel
  const isFromAdmin = location.state?.from?.pathname === '/admin';
  
  const handleCreateAdmin = async () => {
    setIsCreatingAdmin(true);
    
    try {
      console.log("UnauthorizedPage - Checking admin privileges directly for user:", supabase.auth.getUser());
      
      // Use the Supabase Edge Function to create admin user
      const { data, error } = await supabase.functions.invoke('create-admin-user', {
        body: {
          email: adminEmail,
          password: adminPassword
        }
      });
      
      if (error) {
        console.error("Error creating admin user:", error);
        alert(`Failed to create admin user: ${error.message}`);
        setIsCreatingAdmin(false);
        return;
      }
      
      alert(`Admin user created! You can now login with:\nEmail: ${adminEmail}\nPassword: ${adminPassword}`);
      
      // Navigate to login page with redirect to admin
      navigate('/login', { state: { from: { pathname: '/admin' } } });
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("An unexpected error occurred while creating admin user");
      setIsCreatingAdmin(false);
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center mb-6">
          <div className="p-3 bg-destructive/10 rounded-full mb-4">
            <Shield className="h-10 w-10 text-destructive" />
          </div>
          <h1 className="text-3xl font-bold text-center">Access Restricted</h1>
          <p className="text-muted-foreground text-center mt-2">
            You don't have permission to access this area
          </p>
        </div>
        
        {isFromAdmin && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Admin privileges required</AlertTitle>
            <AlertDescription>
              This section requires administrator privileges to access.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="text-md font-medium mb-2">Quick Admin Access</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Click the button below to create an admin user, then login with:
              <br />Email: {adminEmail}
              <br />Password: {adminPassword}
            </p>
            <Button 
              onClick={handleCreateAdmin} 
              disabled={isCreatingAdmin}
              className="w-full"
            >
              {isCreatingAdmin ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Admin...
                </>
              ) : (
                "Create Admin User"
              )}
            </Button>
          </div>
          
          <Button 
            onClick={() => navigate('/login', { state: { from: { pathname: '/admin' } } })} 
            className="w-full"
          >
            <LogIn className="mr-2 h-4 w-4" />
            Login as Administrator
          </Button>
          
          <Button 
            onClick={() => navigate(-1)} 
            variant="outline" 
            className="w-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
          
          <Button 
            onClick={() => navigate('/')} 
            variant="outline" 
            className="w-full"
          >
            Go to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
