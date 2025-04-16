
import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { GoipHeader } from '@/components/goip/GoipHeader';
import { CredentialSection } from '@/components/goip/CredentialSection';
import { useAuth } from '@/contexts/auth/useAuth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SetupInstructions } from '@/components/goip/SetupInstructions';
import { AsteriskGuide } from '@/components/goip/AsteriskGuide';

const GoipSetupContent = () => {
  const { user } = useAuth();
  
  return (
    <DashboardLayout>
      <div className="container mx-auto p-4">
        <GoipHeader />
        
        <Alert className="mb-6">
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Asterisk Server Configuration</AlertTitle>
          <AlertDescription>
            This page helps you set up and configure Asterisk on your server to work with your GoIP devices.
            If you want to register a GoIP device, please visit the "GoIP Devices" page.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="credentials">
          <TabsList className="mb-6">
            <TabsTrigger value="credentials">SIP Credentials</TabsTrigger>
            <TabsTrigger value="instructions">Asterisk Setup</TabsTrigger>
            <TabsTrigger value="technical">Technical Guide</TabsTrigger>
          </TabsList>
          
          <TabsContent value="credentials">
            <div className="grid grid-cols-1 gap-6">
              {/* SIP Credentials Generator */}
              <CredentialSection userId={user?.id} />
            </div>
          </TabsContent>
          
          <TabsContent value="instructions">
            <SetupInstructions />
          </TabsContent>
          
          <TabsContent value="technical">
            <AsteriskGuide />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

const GoipSetup = () => {
  return (
    <ProtectedRoute>
      <GoipSetupContent />
    </ProtectedRoute>
  );
};

export default GoipSetup;
