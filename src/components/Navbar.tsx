
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { DashboardNavbar } from './navbar/DashboardNavbar';
import { PublicNavbar } from './navbar/PublicNavbar';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();
  
  const isDashboard = location.pathname.includes('/dashboard') || 
                      location.pathname.includes('/campaign') || 
                      location.pathname.includes('/greetings') ||
                      location.pathname.includes('/contacts') ||
                      location.pathname.includes('/transfers') ||
                      location.pathname.includes('/sip-providers') ||
                      location.pathname.includes('/admin') ||
                      location.pathname.includes('/profile') ||
                      location.pathname.includes('/billing') ||
                      location.pathname.includes('/upgrade');
  
  // Only use the sidebar hook when in dashboard mode
  const sidebar = isDashboard ? useSidebar() : { toggleSidebar: () => {}, openMobile: false, setOpenMobile: () => {} };
  const { toggleSidebar, openMobile, setOpenMobile } = sidebar;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Add a body class when menu is open to prevent scrolling
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
    
    return () => {
      document.body.classList.remove('menu-open');
    };
  }, [isMobileMenuOpen]);

  // Make sure we handle the sidebar's openMobile state
  useEffect(() => {
    if (isDashboard && openMobile) {
      document.body.classList.add('mobile-menu-open');
    } else {
      document.body.classList.remove('mobile-menu-open');
    }
    
    return () => {
      document.body.classList.remove('mobile-menu-open');
    };
  }, [isDashboard, openMobile]);

  // Don't render navbar on dashboard pages - use the sidebar with dashboard header instead
  if (isDashboard) {
    return <DashboardNavbar toggleSidebar={toggleSidebar} />;
  }

  // On regular pages, render the PublicNavbar
  return (
    <PublicNavbar 
      isScrolled={isScrolled}
      isMobileMenuOpen={isMobileMenuOpen}
      setIsMobileMenuOpen={setIsMobileMenuOpen}
    />
  );
}
