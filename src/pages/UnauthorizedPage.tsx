
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertCircle, Home } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="container flex flex-col items-center justify-center py-12">
        <div className="w-full max-w-md p-6 text-center">
          <div className="rounded-full bg-red-100 p-4 mx-auto w-fit mb-6">
            <AlertCircle className="h-10 w-10 text-red-600" />
          </div>
          
          <h1 className="text-3xl font-bold tracking-tight mb-3">
            Access Denied
          </h1>
          
          <p className="text-gray-500 mb-6">
            You don't have permission to access this page. This area is restricted to administrators only.
          </p>
          
          <Button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Return to Home
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UnauthorizedPage;
