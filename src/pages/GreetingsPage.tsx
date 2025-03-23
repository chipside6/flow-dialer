
import React from 'react';
import GreetingFiles from '../pages/GreetingFiles';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Navbar } from '@/components/Navbar';

const GreetingsPage = () => {
  return (
    <>
      <Navbar />
      <DashboardLayout>
        <GreetingFiles />
      </DashboardLayout>
    </>
  );
};

export default GreetingsPage;
