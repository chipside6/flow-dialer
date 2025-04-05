
import React, { useEffect } from 'react';
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
  
  // Force header to be visible on public pages
  useEffect(() => {
    if (!isDashboardPage) {
      console.log('Public page detected, ensuring header is visible');
      // Add a class to the body to help with CSS targeting
      document.body.classList.add('public-page-active');
      
      // Force header to be visible with direct DOM manipulation
      const forceHeaderVisibility = () => {
        const headers = document.querySelectorAll('.sip-header, .sip-header-container');
        headers.forEach(header => {
          if (header instanceof HTMLElement) {
            header.style.display = 'block';
            header.style.visibility = 'visible';
            header.style.opacity = '1';
          }
        });
      };
      
      // Run immediately and after a small delay
      forceHeaderVisibility();
      const timer = setTimeout(forceHeaderVisibility, 100);
      
      return () => {
        document.body.classList.remove('public-page-active');
        clearTimeout(timer);
      };
    }
  }, [isDashboardPage, location.pathname]);
  
  return (
    <div className="flex flex-col min-h-screen public-layout">
      {isDashboardPage ? 
        <Navbar /> : 
        <div className="sip-header-wrapper" style={{display: 'block', position: 'relative', zIndex: 50}}>
          <SipHeader className="sip-header-container" />
        </div>
      }
      <main className={`flex-1 ${isDashboardPage ? 'pt-16 md:pt-20' : 'pt-0'}`}>
        {children || <Outlet />}
      </main>
    </div>
  );
};

export default PublicLayout;
