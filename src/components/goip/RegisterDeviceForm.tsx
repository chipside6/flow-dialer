
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/auth';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { goipService } from '@/utils/asterisk/services/goipService';
import { useState } from 'react';
import { Alert } from '@/components/ui/alert';
import { Server } from 'lucide-react';

interface RegisterDeviceFormProps {
  onSuccess?: () => void;
}

interface DeviceForm {
  deviceName: string;
  deviceIp: string;
  numPorts: number;
}

export const RegisterDeviceForm = ({ onSuccess }: RegisterDeviceFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<DeviceForm>({
    defaultValues: {
      deviceName: '',
      deviceIp: '',
      numPorts: 4
    }
  });
  
  const onSubmit = async (data: DeviceForm) => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to register a device",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await goipService.registerDevice(
        user.id,
        data.deviceName,
        data.deviceIp,
        data.numPorts
      );
      
      if (result.success) {
        toast({
          title: "Device Registered",
          description: result.message || "Your GoIP device was successfully registered"
        });
        reset();
        
        // Notify parent to refresh the device list
        if (onSuccess) onSuccess();
      } else {
        toast({
          title: "Registration Failed",
          description: result.message || "Failed to register your device",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Device registration error:", error);
      toast({
        title: "Registration Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Register GoIP Device</CardTitle>
        <CardDescription>Add your GoIP hardware to connect with Asterisk</CardDescription>
      </CardHeader>
      <CardContent>
        <form id="device-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="deviceName">Device Name</Label>
            <Input 
              id="deviceName"
              placeholder="Office-GoIP1"
              {...register("deviceName", { required: "Device name is required" })}
            />
            {errors.deviceName && <p className="text-sm text-destructive">{errors.deviceName.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="deviceIp">IP Address</Label>
            <Input 
              id="deviceIp"
              placeholder="192.168.1.100 or goip.example.com"
              {...register("deviceIp", { required: "Device IP or hostname is required" })}
            />
            {errors.deviceIp && <p className="text-sm text-destructive">{errors.deviceIp.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="numPorts">Number of Ports</Label>
            <Select defaultValue="4" onValueChange={(value) => register("numPorts").onChange({ target: { value } })}>
              <SelectTrigger>
                <SelectValue placeholder="Select port count" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Port</SelectItem>
                <SelectItem value="4">4 Ports</SelectItem>
                <SelectItem value="8">8 Ports</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button 
          type="submit" 
          form="device-form"
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? 'Registering...' : 'Register Device'}
        </Button>
      </CardFooter>
    </Card>
  );
};
