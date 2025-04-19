
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { GoipHeader } from '@/components/goip/GoipHeader';
import { CredentialSection } from '@/components/goip/CredentialSection';
import { useAuth } from '@/contexts/auth/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';

const GoipSetupContent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to the new GoIP Devices page
    navigate('/goip-devices', { replace: true });
  }, [navigate]);
  
  return (
    <DashboardLayout>
      <div className="container mx-auto p-4">
        <GoipHeader />
        
        <div className="grid grid-cols-1 gap-6">
          {/* SIP Credentials Generator */}
          <CredentialSection userId={user?.id} />
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
