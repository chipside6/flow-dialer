
import React from 'react';
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { UploadGreetingForm } from '@/components/greeting-files/UploadGreetingForm';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import ProtectedRoute from '@/components/ProtectedRoute';

const GreetingUploadPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="container mx-auto py-4 max-w-3xl">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              className="pl-0"
              onClick={() => navigate('/greetings')}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Greetings
            </Button>
            
            <h1 className="text-2xl font-bold mt-4">Upload Greeting File</h1>
            <p className="text-muted-foreground">
              Upload or record a new audio greeting for your campaigns
            </p>
          </div>
          
          <UploadGreetingForm userId={user?.id} />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default GreetingUploadPage;
