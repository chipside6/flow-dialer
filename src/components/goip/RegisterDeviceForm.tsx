
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Loader2, Shield } from 'lucide-react';
import { DeviceFormFields } from './form/DeviceFormFields';
import { deviceFormSchema, DeviceFormValues } from './form/deviceFormSchema';
import { RegistrationResultAlert } from './form/RegistrationResultAlert';
import { useDeviceRegistration } from './hooks/useDeviceRegistration';

export const RegisterDeviceForm = () => {
  const { isRegistering, registrationResult, registerDevice } = useDeviceRegistration();
  
  const form = useForm<DeviceFormValues>({
    resolver: zodResolver(deviceFormSchema),
    defaultValues: {
      deviceName: '',
      ipAddress: '',
      numPorts: 1,
    }
  });

  const onSubmit = async (values: DeviceFormValues) => {
    const success = await registerDevice(values);
    if (success) {
      form.reset();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Register GoIP Device</CardTitle>
      </CardHeader>
      <CardContent>
        {registrationResult && (
          <RegistrationResultAlert 
            success={registrationResult.success} 
            message={registrationResult.message} 
          />
        )}
      
        <Form {...form}>
          <form id="register-device-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DeviceFormFields form={form} />
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
