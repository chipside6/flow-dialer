
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';

interface PublicLayoutProps {
  children?: React.ReactNode;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="h-16 md:h-20"></div> {/* Spacer div to push content below fixed navbar */}
      <main className="flex-1">
        {children || <Outlet />}
      </main>
    </div>
  );
};

export default PublicLayout;
