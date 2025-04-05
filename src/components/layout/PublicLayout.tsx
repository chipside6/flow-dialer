
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { SipHeader } from '@/components/header/SipHeader';

interface PublicLayoutProps {
  children?: React.ReactNode;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  const location = useLocation();
  const isDashboardPage = location.pathname.includes('/dashboard') || 
                         location.pathname.includes('/campaign') || 
                         location.pathname.includes('/profile') ||
                         location.pathname.includes('/billing') ||
                         location.pathname.includes('/admin');
  
  return (
    <div className="flex flex-col min-h-screen">
      {isDashboardPage ? <Navbar /> : <SipHeader />}
      <main className={`flex-1 ${isDashboardPage ? 'pt-16 md:pt-20' : 'pt-0'}`}>
        {children || <Outlet />}
      </main>
    </div>
  );
};

export default PublicLayout;
