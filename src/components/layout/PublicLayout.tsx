
import React from 'react';
import { Outlet } from 'react-router-dom';
import { SipHeader } from '@/components/header/SipHeader';

interface PublicLayoutProps {
  children?: React.ReactNode;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <SipHeader />
      <main className="flex-1 pt-0">
        {children || <Outlet />}
      </main>
    </div>
  );
};

export default PublicLayout;
