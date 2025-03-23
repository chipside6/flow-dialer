
import React from 'react';
import GreetingFiles from './GreetingFiles';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Navbar } from '@/components/Navbar';

const GreetingsPage = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex flex-1 w-full max-w-full overflow-hidden">
        <DashboardLayout>
          <GreetingFiles />
        </DashboardLayout>
      </div>
    </div>
  );
};

export default GreetingsPage;
