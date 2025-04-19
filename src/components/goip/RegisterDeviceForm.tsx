
import React from 'react';
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

const formSchema = z.object({
  deviceName: z.string().min(3, 'Device name must be at least 3 characters'),
  ipAddress: z.string().ip({ message: 'Must be a valid IP address' }).or(z.string().regex(/^[\w.-]+\.[\w.-]+/, { message: 'Must be a valid hostname' }))
});

export const RegisterDeviceForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      deviceName: '',
      ipAddress: ''
    }
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('goip_devices')
        .insert({
          user_id: user.id,
          device_name: values.deviceName,
          ip_address: values.ipAddress
        });

      if (error) throw error;

      toast({
        title: "Device registered successfully",
        description: "Your GoIP device has been registered."
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
            <Button type="submit" className="w-full">Register Device</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
