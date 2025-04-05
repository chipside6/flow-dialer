
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { SipHeader } from '@/components/header/SipHeader';

interface PublicLayoutProps {
  children?: React.ReactNode;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  const location = useLocation();
  const isHomepage = location.pathname === '/';
  
  return (
    <div className="flex flex-col min-h-screen">
      {isHomepage ? <SipHeader /> : <Navbar />}
      <main className="flex-1">
        {children || <Outlet />}
      </main>
    </div>
  );
};

export default PublicLayout;
