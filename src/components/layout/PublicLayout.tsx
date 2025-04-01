
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';

interface PublicLayoutProps {
  children?: React.ReactNode;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="h-28 md:h-32"></div> {/* Increased spacer to ensure content is below the header */}
      <main className="flex-1 bg-background text-foreground">
        {children || <Outlet />}
      </main>
    </div>
  );
};

export default PublicLayout;
