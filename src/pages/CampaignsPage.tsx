import React, { useEffect } from 'react';
import Campaign from './Campaign';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { touchSession } from '@/services/auth/session';

const CampaignsPage = () => {
  // Touch the session when the component mounts to keep it alive
  useEffect(() => {
    touchSession();
    
    // Set up interval to touch session periodically while on this page
    const intervalId = setInterval(() => {
      touchSession();
    }, 15000); // Touch every 15 seconds
    
    return () => clearInterval(intervalId);
  }, []);
  
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <Campaign />
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default CampaignsPage;
