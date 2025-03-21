
import React from 'react';
import { useAuth } from '@/contexts/auth';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* You could add a header, navbar, or other global UI elements here */}
      <main className="min-h-screen">
        {children}
      </main>
      {/* You could add a footer here */}
    </div>
  );
};

export default Layout;
