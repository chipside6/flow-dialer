
import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { GoipHeader } from '@/components/goip/GoipHeader';
import { CredentialSection } from '@/components/goip/CredentialSection';
import { AsteriskGuide } from '@/components/goip/AsteriskGuide';
import { useAuth } from '@/contexts/auth/useAuth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

const GoipSetupContent = () => {
  const { user } = useAuth();
  
  return (
    <DashboardLayout>
      <div className="container mx-auto p-4">
        <GoipHeader />
        
        <Alert className="mb-6">
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Bring Your Own Device</AlertTitle>
          <AlertDescription>
            This system is designed for users to bring their own GoIP devices. You only need to generate 
            SIP credentials and configure your device - no system-wide Asterisk configuration is needed.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 gap-6">
          {/* SIP Credentials Generator */}
          <CredentialSection userId={user?.id} />

          {/* Asterisk Integration Guide */}
          <AsteriskGuide />
        </div>
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
