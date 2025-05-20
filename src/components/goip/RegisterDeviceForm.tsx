import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { goipService } from '@/utils/asterisk/services/goipService';
import { useAuth } from '@/contexts/auth';
import { Loader2, Shield, AlertCircle, Check } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { getSupabaseUrl } from '@/integrations/supabase/client';

const formSchema = z.object({
  deviceName: z.string().min(3, 'Device name must be at least 3 characters').max(50, 'Device name must be at most 50 characters'),
  ipAddress: z.string().regex(/^[\d.]+$/, 'Enter a valid IP address'),
  numPorts: z.coerce.number().min(1).max(8, 'Maximum 8 ports supported'),
});

type FormValues = z.infer<typeof formSchema>;

export const RegisterDeviceForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationResult, setRegistrationResult] = useState<{success: boolean; message: string} | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      deviceName: '',
      ipAddress: '',
      numPorts: 1,
    }
  });

  const onSubmit = async (values: FormValues) => {
    if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to register a device.",
        variant: "destructive"
      });
      return;
    }

    // Clear any previous registration result
    setRegistrationResult(null);
    // Set registering state to true
    setIsRegistering(true);
    
    try {
      console.log("Registering device with values:", values);
      
      // Call the Supabase Edge Function directly instead of using goipService
      // This approach bypasses any potential schema mismatch
      const { data: session } = await supabase.auth.getSession();
      const supabaseUrl = getSupabaseUrl();
      
      if (!session?.session?.access_token || !supabaseUrl) {
        throw new Error("Authentication required");
      }
      
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
      
      const result = await response.json();
      console.log("Registration result:", result);
      
      if (!result.success) {
        throw new Error(result.message || "Failed to register device");
      }

      // Set successful registration result
      setRegistrationResult({
        success: true,
        message: `Device ${values.deviceName} registered successfully with ${values.numPorts} port(s)`
      });

      toast({
        title: "Device registered successfully",
        description: "Your GoIP device has been registered with auto-generated SIP credentials."
      });

      // Reset the form
      form.reset();
    } catch (error) {
      console.error('Error registering device:', error);
      
      // Set failed registration result
      setRegistrationResult({
        success: false,
        message: error instanceof Error ? error.message : "An error occurred during device registration."
      });
      
      toast({
        title: "Error registering device",
        description: error instanceof Error ? error.message : "An error occurred during device registration.",
        variant: "destructive"
      });
    } finally {
      // Always set isRegistering to false regardless of success or failure
      setIsRegistering(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Register GoIP Device</CardTitle>
      </CardHeader>
      <CardContent>
        {registrationResult && (
          <Alert 
            variant={registrationResult.success ? "default" : "destructive"}
            className={`mb-4 ${registrationResult.success ? "bg-green-50 border-green-200 dark:bg-green-900/20" : ""}`}
          >
            {registrationResult.success ? (
              <Check className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertTitle>
              {registrationResult.success ? "Registration Successful" : "Registration Failed"}
            </AlertTitle>
            <AlertDescription>{registrationResult.message}</AlertDescription>
          </Alert>
        )}
      
        <Form {...form}>
          <form id="register-device-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="deviceName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Device Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Office-GoIP1" {...field} />
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
                  <FormLabel>IP Address</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 192.168.1.100" {...field} />
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
                  <Select 
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select number of ports" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">1 Port</SelectItem>
                      <SelectItem value="2">2 Ports</SelectItem>
                      <SelectItem value="4">4 Ports</SelectItem>
                      <SelectItem value="8">8 Ports</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <Button 
          form="register-device-form"
          type="submit" 
          className="w-full"
          disabled={isRegistering}
        >
          {isRegistering ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Registering Device...
            </>
          ) : (
            <>
              <Shield className="mr-2 h-4 w-4" />
              Register Device
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
