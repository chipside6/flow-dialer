
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/auth';
import { goipService } from '@/utils/asterisk/services/goipService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingErrorBoundary } from '@/components/common/LoadingErrorBoundary';
import { Loader2, Server } from 'lucide-react';

// Define the form schema
const formSchema = z.object({
  deviceName: z.string().min(3, { message: 'Device name must be at least 3 characters' }),
  deviceIp: z.string().ip({ message: 'Please enter a valid IP address' }).or(z.string().regex(/^[\w.-]+\.[\w.-]+/, { message: 'Please enter a valid hostname or IP address' })),
  sipPortRange: z.string().regex(/^\d+-\d+$/, { message: 'Please enter a valid port range (e.g., 5060-5063)' }).optional(),
  numPorts: z.coerce.number().min(1).max(8),
  defaultCallerId: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

interface GoipDeviceRegistrationProps {
  onDeviceRegistered?: () => void;
}

export const GoipDeviceRegistration: React.FC<GoipDeviceRegistrationProps> = ({ onDeviceRegistered }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      deviceName: '',
      deviceIp: '',
      sipPortRange: '5060-5068',
      numPorts: 4,
      defaultCallerId: ''
    }
  });

  const onSubmit = async (values: FormValues) => {
    if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to register devices",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await goipService.registerDevice(
        user.id,
        values.deviceName,
        values.deviceIp,
        values.numPorts
      );

      if (result.success) {
        toast({
          title: "Device registered successfully",
          description: result.message,
        });

        // Reset form
        form.reset({
          deviceName: '',
          deviceIp: '',
          sipPortRange: '5060-5068',
          numPorts: 4,
          defaultCallerId: ''
        });

        // Notify parent component to refresh devices list
        if (onDeviceRegistered) {
          onDeviceRegistered();
        }
      } else {
        setError(new Error(result.message));
        toast({
          title: "Error registering device",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (err: any) {
      setError(err);
      toast({
        title: "Error registering device",
        description: err.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setError(null);
  };

  return (
    <LoadingErrorBoundary
      isLoading={isSubmitting}
      error={error}
      onRetry={handleRetry}
      loadingComponent={
        <Card>
          <CardContent className="flex items-center justify-center p-6">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="ml-2">Registering your device...</p>
          </CardContent>
        </Card>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Server className="h-5 w-5 mr-2" />
            GoIP Device Registration
          </CardTitle>
          <CardDescription>
            Register a new GoIP device to use with the autodialer system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="deviceName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GoIP Device Name</FormLabel>
                    <FormControl>
                      <Input placeholder="My GoIP Device" {...field} />
                    </FormControl>
                    <FormDescription>
                      A friendly name to identify your GoIP device
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="deviceIp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Public IP Address</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 192.168.1.100" {...field} />
                    </FormControl>
                    <FormDescription>
                      Public IP address or hostname of your GoIP device
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="sipPortRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SIP Port Range</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 5060-5063" {...field} />
                    </FormControl>
                    <FormDescription>
                      The range of SIP ports your device uses
                    </FormDescription>
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
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select number of ports" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[1, 2, 4, 8].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} {num === 1 ? 'Port' : 'Ports'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      How many ports does your GoIP device have?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="defaultCallerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Caller ID (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. +15551234567" {...field} />
                    </FormControl>
                    <FormDescription>
                      Default caller ID to use for outbound calls
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Registering Device...
                  </>
                ) : (
                  <>Register Device</>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </LoadingErrorBoundary>
  );
};
