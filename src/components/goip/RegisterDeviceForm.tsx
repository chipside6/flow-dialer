
import React, { useState } from 'react';
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
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      deviceName: '',
      ipAddress: '',
      numPorts: 1
    }
  });

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
      
      const responseData = await response.json();
      console.log("Edge function response data:", responseData);
      
      if (!response.ok) {
        throw new Error(responseData.message || `Error: ${response.status} ${response.statusText}`);
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
      setIsRegistering(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Register GoIP Device</CardTitle>
        <CardDescription>Add a new GoIP device to your account</CardDescription>
      </CardHeader>
      <CardContent>
        {registrationSuccess && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              Device registered successfully! SIP credentials have been automatically generated.
              You can view them in your device details.
            </AlertDescription>
          </Alert>
        )}
        
        {registrationError && (
          <Alert className="mb-4 bg-red-50 border-red-200" variant="destructive">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertTitle>Registration Failed</AlertTitle>
            <AlertDescription className="text-red-700">
              {registrationError}
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
            <Button 
              type="submit" 
              className="w-full"
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
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
