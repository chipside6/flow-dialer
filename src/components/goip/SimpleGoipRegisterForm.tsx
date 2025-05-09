
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getSupabaseUrl } from '@/integrations/supabase/client';
import { generateRandomPassword } from '@/utils/passwordGenerator';

// Simple schema that only requires essential fields
const formSchema = z.object({
  deviceName: z.string().min(2, 'Device name must be at least 2 characters'),
  ipAddress: z.string().min(1, 'IP address is required'),
  numPorts: z.coerce.number().int().min(1).max(8).default(1)
});

export const SimpleGoipRegisterForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationResult, setRegistrationResult] = useState<{success: boolean; message: string} | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      deviceName: 'MyGoIP',
      ipAddress: '192.168.1.100',
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
    setDebugInfo(null);
    
    try {
      console.log("Registering device with values:", values);
      
      // Generate user/pass for all ports
      const portsData = [];
      for (let i = 1; i <= values.numPorts; i++) {
        portsData.push({
          user_id: user.id,
          trunk_name: values.deviceName,
          port_number: i,
          sip_user: `goip_${user.id.substring(0, 8)}_port${i}`,
          sip_pass: generateRandomPassword(12),
          status: 'active',
          device_ip: values.ipAddress
        });
      }
      
      // Check if we have existing trunks with the same name - delete them first
      const { error: deleteError } = await supabase
        .from('user_trunks')
        .delete()
        .eq('user_id', user.id)
        .eq('trunk_name', values.deviceName);
      
      if (deleteError) {
        console.warn("Error deleting existing trunks:", deleteError);
        setDebugInfo(`Delete error: ${deleteError.message}`);
        // Continue anyway
      }
      
      // Insert all port records
      const { data, error } = await supabase
        .from('user_trunks')
        .insert(portsData)
        .select();
      
      if (error) {
        throw error;
      }
      
      console.log("Registration successful:", data);
      
      setRegistrationResult({
        success: true,
        message: `Device ${values.deviceName} registered successfully with ${values.numPorts} port(s)`
      });
      
      toast({
        title: "Device Registered",
        description: `GoIP device "${values.deviceName}" registered successfully.`,
        variant: "default"
      });
      
      // Reset form
      form.reset();
      
    } catch (error) {
      console.error("Error registering device:", error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Unknown error occurred";
      
      setRegistrationResult({
        success: false,
        message: `Registration failed: ${errorMessage}`
      });
      
      toast({
        title: "Registration Failed",
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
        <CardTitle>Simple GoIP Registration</CardTitle>
        <CardDescription>Register a new GoIP device with one step</CardDescription>
      </CardHeader>
      <CardContent>
        {registrationResult && (
          <Alert 
            variant={registrationResult.success ? "default" : "destructive"}
            className={`mb-4 ${registrationResult.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
          >
            {registrationResult.success 
              ? <CheckCircle className="h-4 w-4 text-green-600" /> 
              : <AlertCircle className="h-4 w-4 text-red-600" />}
            <AlertTitle>
              {registrationResult.success ? "Registration Successful" : "Registration Failed"}
            </AlertTitle>
            <AlertDescription>
              {registrationResult.message}
            </AlertDescription>
          </Alert>
        )}
        
        {debugInfo && (
          <Alert className="mb-4 bg-yellow-50 border-yellow-200">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertTitle>Debug Info</AlertTitle>
            <AlertDescription className="font-mono text-xs">
              {debugInfo}
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
                    <Input {...field} />
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
                    <Input {...field} />
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
