
import React from 'react';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Loader2, Shield } from 'lucide-react';
import { CredentialNotice } from './form/CredentialNotice';
import { GoipFormFields } from './form/GoipFormFields';
import { useGoipForm } from './hooks/useGoipForm';

export const GoipDeviceForm = () => {
  const { form, isRegistering, showCredNotice, setShowCredNotice, onSubmit } = useGoipForm();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Register New Device</CardTitle>
        <CardDescription>Add a new GoIP device to your account</CardDescription>
      </CardHeader>
      <CardContent>
        {showCredNotice && (
          <CredentialNotice onDismiss={() => setShowCredNotice(false)} />
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <GoipFormFields form={form} />

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
