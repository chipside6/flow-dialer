
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
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  deviceName: z.string().min(3, 'Device name must be at least 3 characters'),
  ipAddress: z.string().ip({ message: 'Must be a valid IP address' }).or(z.string().regex(/^[\w.-]+\.[\w.-]+/, { message: 'Must be a valid hostname' })),
  numPorts: z.coerce.number().int().min(1).max(8).default(1)
});

export const RegisterDeviceForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isRegistering, setIsRegistering] = useState(false);
  
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
        description: `Your GoIP device "${values.deviceName}" has been registered with ${values.numPorts} ports.`,
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
        <CardTitle>Register GoIP Device</CardTitle>
        <CardDescription>Add a new GoIP device to your account</CardDescription>
      </CardHeader>
      <CardContent>
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
