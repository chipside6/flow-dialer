
import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { GoipHeader } from '@/components/goip/GoipHeader';
import { CredentialSection } from '@/components/goip/CredentialSection';
import { AsteriskGuide } from '@/components/goip/AsteriskGuide';
import { useAuth } from '@/contexts/auth/useAuth';

const GoipSetup = () => {
  const { user } = useAuth();
  
  return (
    <DashboardLayout>
      <div className="container mx-auto p-4">
        <GoipHeader />

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

export default GoipSetup;
