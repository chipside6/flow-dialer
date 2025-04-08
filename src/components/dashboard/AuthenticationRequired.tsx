
import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AuthenticationRequired = () => {
  const navigate = useNavigate();
  
  return (
    <DashboardLayout>
      <div className="w-full h-full flex flex-col items-center justify-center p-8">
        <Alert variant="destructive" className="mb-4 mx-auto max-w-lg">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You need to be logged in to view your campaigns.
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate('/login')}>
          Go to Login
        </Button>
      </div>
    </DashboardLayout>
  );
};
