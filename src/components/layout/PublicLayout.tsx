
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { SipHeader } from '@/components/header/SipHeader';

interface PublicLayoutProps {
  children?: React.ReactNode;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  const location = useLocation();
  
  // Define which paths should use SipHeader instead of Navbar
  const useSipHeader = ['/', '/features', '/pricing', '/support'].includes(location.pathname);
  
  return (
    <div className="flex flex-col min-h-screen">
      {useSipHeader ? <SipHeader /> : <Navbar />}
      <main className={`flex-1 ${useSipHeader ? 'pt-6 md:pt-8' : ''}`}>
        <div className="px-4 md:px-0">
          {children || <Outlet />}
        </div>
      </main>
    </div>
  );
};

export default PublicLayout;
