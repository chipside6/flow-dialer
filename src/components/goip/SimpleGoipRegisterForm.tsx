
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/auth';
import { Loader2, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { goipService } from '@/utils/asterisk/services/goipService';

// Simple schema that only requires essential fields
const formSchema = z.object({
  deviceName: z.string().min(2, 'Device name must be at least 2 characters'),
  ipAddress: z.string().min(1, 'IP address is required'),
  numPorts: z.coerce.number().int().min(1).max(8).default(1)
});

interface SimpleGoipRegisterFormProps {
  onSuccess?: () => void;
}

export const SimpleGoipRegisterForm: React.FC<SimpleGoipRegisterFormProps> = ({ onSuccess }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationResult, setRegistrationResult] = useState<{success: boolean; message: string} | null>(null);
  
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
    setRegistrationResult(null);
    
    try {
      // Use the goipService to register the device
      const result = await goipService.registerDevice(
        user.id,
        values.deviceName,
        values.ipAddress,
        values.numPorts
      );
      
      setIsRegistering(false);
      
      if (result.success) {
        setRegistrationResult({
          success: true,
          message: `Device "${values.deviceName}" registered successfully`
        });
        
        toast({
          title: "Device Registered",
          description: `GoIP device "${values.deviceName}" registered successfully.`,
          variant: "default"
        });
        
        // Reset form on success
        form.reset();
        
        // Trigger refresh if provided
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setRegistrationResult({
          success: false,
          message: result.message || "Failed to register device"
        });
        
        toast({
          title: "Registration Failed",
          description: result.message || "Failed to register device",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error registering device:", error);
      
      setIsRegistering(false);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Unknown error occurred";
      
      setRegistrationResult({
        success: false,
        message: errorMessage
      });
      
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Register GoIP Device</CardTitle>
        <CardDescription>Enter your device details below</CardDescription>
      </CardHeader>
      <CardContent>
        {registrationResult && (
          <Alert 
            variant={registrationResult.success ? "default" : "destructive"}
            className={`mb-4 ${registrationResult.success ? "bg-green-50 border-green-200" : ""}`}
          >
            <AlertDescription>
              {registrationResult.message}
              {registrationResult.success && <CheckCircle className="h-4 w-4 inline ml-1 text-green-600" />}
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
                    <Input placeholder="Office-GoIP1" {...field} />
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
                      onChange={e => field.onChange(parseInt(e.target.value))}
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
