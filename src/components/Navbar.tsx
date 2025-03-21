
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
                      location.pathname.includes('/billing');
  
  // Use the sidebar hook directly, handling the case where sidebar might not be available
  const sidebarContext = isDashboard ? useSidebar() : { toggleSidebar: () => {}, openMobile: false, setOpenMobile: () => {} };
  const { toggleSidebar } = sidebarContext;

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

  // For dashboard routes, only render DashboardNavbar if we're not on mobile
  // This prevents duplicate headers when the sidebar with its own header is open
  if (isDashboard) {
    // For dashboard routes, don't show navbar on mobile as the sidebar has its own header
    if (isMobile && sidebarContext.openMobile) {
      return null; // Don't render the navbar on mobile for dashboard routes when sidebar is open
    }
    return <DashboardNavbar toggleSidebar={toggleSidebar} />;
  }

  return (
    <PublicNavbar 
      isScrolled={isScrolled}
      isMobileMenuOpen={isMobileMenuOpen}
      setIsMobileMenuOpen={setIsMobileMenuOpen}
    />
  );
};
