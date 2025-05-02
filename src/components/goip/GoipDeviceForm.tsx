
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { goipService } from '@/utils/asterisk/services/goipService';
import { Loader2, Shield, Sparkles } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const formSchema = z.object({
  deviceName: z.string().min(3, 'Device name must be at least 3 characters'),
  ipAddress: z.string().regex(/^[\d.]+$/, 'Must be a valid IP address'),
  sipPorts: z.string().regex(/^\d+(-\d+)?$/, 'Must be a port number or range (e.g. 5060-5063)'),
  numPorts: z.number().min(1).max(8),
  callerId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export const GoipDeviceForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isRegistering, setIsRegistering] = useState(false);
  const [showCredNotice, setShowCredNotice] = useState(true);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      deviceName: '',
      ipAddress: '',
      sipPorts: '5060-5068',
      numPorts: 1,
      callerId: ''
    }
  });

  const onSubmit = async (values: FormValues) => {
    if (!user?.id) return;

    setIsRegistering(true);
    
    try {
      // Use the goipService to register the device with auto-generated credentials
      const result = await goipService.registerDevice(
        user.id,
        values.deviceName,
        values.ipAddress,
        values.numPorts
      );

      if (!result.success) {
        throw new Error(result.message);
      }

      toast({
        title: "Device registered successfully",
        description: "Your GoIP device has been registered and SIP credentials automatically generated."
      });

      form.reset();
    } catch (error) {
      console.error('Error registering device:', error);
      toast({
        title: "Error registering device",
        description: error instanceof Error ? error.message : "Failed to register your device. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Register New Device</CardTitle>
        <CardDescription>Add a new GoIP device to your account</CardDescription>
      </CardHeader>
      <CardContent>
        {showCredNotice && (
          <Alert className="mb-4" variant="default">
            <Sparkles className="h-4 w-4" />
            <AlertTitle>Automatic SIP Credentials</AlertTitle>
            <AlertDescription className="text-sm">
              SIP credentials are now automatically generated when you register a device. 
              You'll find them in the device details after registration.
              <Button 
                variant="link" 
                className="p-0 h-auto text-xs" 
                onClick={() => setShowCredNotice(false)}
              >
                Dismiss
              </Button>
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
                    <Input placeholder="Enter device name" {...field} />
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
              name="sipPorts"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SIP Port Range</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 5060-5063" {...field} />
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
                      onChange={e => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="callerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Caller ID (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter default caller ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full flex gap-2 items-center"
              disabled={isRegistering}
            >
              {isRegistering ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Registering and Generating Credentials...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4" />
                  Register Device with Auto-Generated Credentials
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
