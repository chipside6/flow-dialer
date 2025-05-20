
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
import { Loader2, Shield } from 'lucide-react';

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

    setIsRegistering(true);
    
    try {
      // Using the goipService to register the device
      const result = await goipService.registerDevice(
        user.id,
        values.deviceName,
        values.ipAddress,
        values.numPorts
      );
      
      // Always set isRegistering to false regardless of result
      setIsRegistering(false);

      if (!result.success) {
        throw new Error(result.message || "Failed to register device");
      }

      toast({
        title: "Device registered successfully",
        description: "Your GoIP device has been registered with auto-generated SIP credentials."
      });

      // Reset the form
      form.reset();
    } catch (error) {
      console.error('Error registering device:', error);
      
      // Ensure this always gets called even if the error handling has issues
      setIsRegistering(false);
      
      toast({
        title: "Error registering device",
        description: error instanceof Error ? error.message : "An error occurred during device registration.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Register GoIP Device</CardTitle>
      </CardHeader>
      <CardContent>
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
