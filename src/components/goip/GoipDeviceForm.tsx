
import React from 'react';
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

    try {
      // Register the device
      const { error } = await supabase.from('goip_devices').insert({
        user_id: user.id,
        device_name: values.deviceName,
        ip_address: values.ipAddress,
      });

      if (error) throw error;

      toast({
        title: "Device registered successfully",
        description: "Your GoIP device has been registered and configured."
      });

      form.reset();
    } catch (error) {
      console.error('Error registering device:', error);
      toast({
        title: "Error registering device",
        description: "Failed to register your device. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Register New Device</CardTitle>
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

            <Button type="submit" className="w-full">Register Device</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
