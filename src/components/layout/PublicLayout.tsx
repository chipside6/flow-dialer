
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
      {/* Only render one header type based on the path */}
      {useSipHeader ? <SipHeader /> : <Navbar />}
      <main className={`flex-1 ${useSipHeader ? 'pt-0 mt-2' : 'pt-16'}`}>
        {children || <Outlet />}
      </main>
    </div>
  );
};

export default PublicLayout;
