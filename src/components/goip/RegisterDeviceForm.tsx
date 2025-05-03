
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { goipService } from '@/utils/asterisk/services/goipService';
import { Loader2, CheckCircle, Info, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getSupabaseUrl } from '@/integrations/supabase/client';
import { LoadingErrorBoundary } from '@/components/common/LoadingErrorBoundary';
import { tryCatchWithErrorHandling, DialerErrorType } from '@/utils/errorHandlingUtils';

const formSchema = z.object({
  deviceName: z.string().min(3, 'Device name must be at least 3 characters'),
  ipAddress: z.string().ip({ message: 'Must be a valid IP address' }).or(z.string().regex(/^[\w.-]+\.[\w.-]+/, { message: 'Must be a valid hostname' })),
  numPorts: z.coerce.number().int().min(1).max(8).default(1)
});

export const RegisterDeviceForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [requestTimeout, setRequestTimeout] = useState<NodeJS.Timeout | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<{
    checking: boolean;
    error: string | null;
    success: boolean;
  }>({
    checking: false,
    error: null,
    success: false
  });
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      deviceName: '',
      ipAddress: '',
      numPorts: 1
    }
  });

  // Clear any timeouts when component unmounts to prevent memory leaks
  useEffect(() => {
    return () => {
      if (requestTimeout) {
        clearTimeout(requestTimeout);
      }
    };
  }, [requestTimeout]);

  const resetFormState = () => {
    setIsRegistering(false);
    if (requestTimeout) {
      clearTimeout(requestTimeout);
      setRequestTimeout(null);
    }
  };

  const checkAsteriskConnection = async () => {
    try {
      setConnectionStatus({
        checking: true,
        error: null,
        success: false
      });

      // First test the basic connection to Asterisk server
      const result = await fetch('/api/check-asterisk-connection', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!result.ok) {
        const errorData = await result.json();
        throw new Error(errorData.message || 'Failed to connect to Asterisk server');
      }

      const data = await result.json();
      
      if (data.success) {
        setConnectionStatus({
          checking: false,
          error: null,
          success: true
        });
        
        toast({
          title: "Asterisk Server Connected",
          description: "Successfully connected to Asterisk server",
        });
      } else {
        throw new Error(data.message || 'Asterisk server configuration is invalid');
      }
    } catch (error) {
      console.error('Error checking Asterisk connection:', error);
      
      setConnectionStatus({
        checking: false,
        error: error instanceof Error ? error.message : 'Unknown error connecting to Asterisk',
        success: false
      });
      
      toast({
        title: "Asterisk Connection Failed",
        description: error instanceof Error ? error.message : 'Failed to connect to Asterisk server',
        variant: "destructive"
      });
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to register a device.",
        variant: "destructive"
      });
      return;
    }
    
    setIsRegistering(true);
    setRegistrationSuccess(false);
    setRegistrationError(null);

    // Set a timeout to prevent infinite loading state
    const timeout = setTimeout(() => {
      setIsRegistering(false);
      setRegistrationError("Request timed out. The server might be busy or unreachable. Please try again later.");
      toast({
        title: "Request timed out",
        description: "The server took too long to respond. Please try again.",
        variant: "destructive"
      });
    }, 30000); // 30 seconds timeout
    
    setRequestTimeout(timeout);

    try {
      console.log("Starting device registration for:", values);
      
      // Get the Supabase URL to call the edge function
      const supabaseUrl = getSupabaseUrl();
      
      if (!supabaseUrl) {
        throw new Error('Could not determine Supabase URL');
      }
      
      console.log("Using Supabase URL:", supabaseUrl);
      
      // Get session for authentication
      const { data: session, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.session?.access_token) {
        console.error("Authentication error:", sessionError);
        throw new Error('Authentication required: ' + (sessionError?.message || 'Unable to get session'));
      }
      
      console.log("Authentication successful, proceeding with device registration");
      
      // Call the edge function to register the device
      const response = await fetch(`${supabaseUrl}/functions/v1/register-goip-device`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.session.access_token}`
        },
        body: JSON.stringify({
          userId: user.id,
          deviceName: values.deviceName,
          ipAddress: values.ipAddress,
          numPorts: values.numPorts
        })
      });
      
      console.log("Edge function response status:", response.status);
      
      // Check if we got a response
      if (!response) {
        throw new Error("No response received from server");
      }

      // Handle non-OK responses before trying to parse JSON
      if (!response.ok) {
        let errorMessage = `Error: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData?.message || errorMessage;
          console.error("Error response:", errorData);
        } catch (parseError) {
          console.error("Failed to parse error response:", parseError);
        }
        throw new Error(errorMessage);
      }
      
      // Try to parse the successful response
      let responseData;
      try {
        responseData = await response.json();
        console.log("Edge function response data:", responseData);
      } catch (parseError) {
        console.error("Error parsing response:", parseError);
        throw new Error("Server returned an invalid response format");
      }
      
      if (!responseData.success) {
        throw new Error(responseData.message || 'Unknown error occurred during device registration');
      }

      // Registration successful
      setRegistrationSuccess(true);
      toast({
        title: "Device registered successfully",
        description: `Your GoIP device "${values.deviceName}" has been registered with ${values.numPorts} ports.`,
      });

      form.reset();
      
      // Check Asterisk connection after successful registration
      setTimeout(() => {
        checkAsteriskConnection();
      }, 1000);
      
    } catch (error) {
      console.error('Error registering device:', error);
      
      // Set the error message for display
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to register your device. Please try again.";
      
      setRegistrationError(errorMessage);
      
      toast({
        title: "Error registering device",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      resetFormState();
    }
  };

  // Handler for manual retry
  const handleRetry = () => {
    const formValues = form.getValues();
    form.reset(formValues);
    setRegistrationError(null);
    setIsRegistering(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Register GoIP Device</CardTitle>
        <CardDescription>Add a new GoIP device to your account</CardDescription>
      </CardHeader>
      <CardContent>
        <LoadingErrorBoundary
          isLoading={false}
          error={registrationError ? new Error(registrationError) : null}
          onRetry={handleRetry}
        >
          {registrationSuccess && (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                Device registered successfully! SIP credentials have been automatically generated.
                You can view them in your device details.
              </AlertDescription>
            </Alert>
          )}
          
          <Alert className="mb-4 bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700">
              SIP credentials are automatically generated when you register a device.
              No manual configuration needed.
            </AlertDescription>
          </Alert>
          
          {connectionStatus.error && (
            <Alert className="mb-4 bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-700">Asterisk Connection Issue</AlertTitle>
              <AlertDescription className="text-amber-700">
                {connectionStatus.error}
                <p className="mt-2 text-sm">
                  Please check your Asterisk server configuration in the settings page.
                </p>
              </AlertDescription>
            </Alert>
          )}

          {connectionStatus.success && (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-700">Asterisk Connected</AlertTitle>
              <AlertDescription className="text-green-700">
                Your Asterisk server is properly configured and connected.
              </AlertDescription>
            </Alert>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="deviceName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Device Name</FormLabel>
                    <FormControl>
                      <Input placeholder="MyGoIP-1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ipAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IP Address or Hostname</FormLabel>
                    <FormControl>
                      <Input placeholder="192.168.1.100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="numPorts"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Ports</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={1} 
                        max={8} 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={isRegistering}
                >
                  {isRegistering ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    'Register Device'
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={checkAsteriskConnection}
                  disabled={connectionStatus.checking}
                  className="flex-1"
                >
                  {connectionStatus.checking ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    'Check Asterisk Connection'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </LoadingErrorBoundary>
      </CardContent>
    </Card>
  );
};
