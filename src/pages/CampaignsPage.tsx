import React, { useEffect } from 'react';
import Campaign from './Campaign';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/auth';
import { touchSession } from '@/services/auth/session';

const CampaignsPage = () => {
  const { isAuthenticated, user } = useAuth();

  // Touch session when the component mounts to keep the session alive
  useEffect(() => {
    if (isAuthenticated && user) {
      touchSession();
      
      // Set up interval to touch session periodically
      const intervalId = setInterval(() => {
        touchSession();
        console.log('Session touched in CampaignsPage component');
      }, 10000); // Every 10 seconds
      
      return () => clearInterval(intervalId);
    }
  }, [isAuthenticated, user]);

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <Campaign />
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default CampaignsPage;
