
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
      <div className="h-20 md:h-24"></div> {/* Reduced spacer to prevent excess space */}
      <main className="flex-1 bg-background text-foreground z-10">
        {children || <Outlet />}
      </main>
    </div>
  );
};

export default PublicLayout;
