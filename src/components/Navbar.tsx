
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Menu, X, Phone } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

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
                      location.pathname.includes('/admin');

  // Only use the sidebar hook when in dashboard mode
  const sidebar = isDashboard ? useSidebar() : { toggleSidebar: () => {} };
  const { toggleSidebar } = sidebar;

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

  if (isDashboard) {
    return (
      <header 
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out px-4 py-3 bg-background border-b shadow-sm"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSidebar}
              className="md:hidden p-2 flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted"
              aria-label="Toggle sidebar"
            >
              <Menu size={24} />
            </button>
            {/* Hide the logo text in dashboard mode on mobile to prevent overlap */}
            <Link 
              to="/" 
              className="flex items-center gap-2 text-xl font-display font-bold tracking-tight"
            >
              <span className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white">
                <Phone size={18} />
              </span>
              <span className="md:inline hidden">Flow Dialer</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Dashboard actions could go here */}
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out px-6 md:px-10 ${
          isScrolled || isMobileMenuOpen
            ? 'py-3 bg-white/95 backdrop-blur-md shadow-sm dark:bg-background/95' 
            : 'py-5 bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link 
            to="/" 
            className="flex items-center gap-2 text-xl font-display font-bold tracking-tight z-50 relative"
          >
            <span className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white">
              <Phone size={18} />
            </span>
            Flow Dialer
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <NavLinks />
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Button variant="outline" size="sm" className="rounded-full px-4 transition-all duration-300" asChild>
              <Link to="/login">Log In</Link>
            </Button>
            <Button size="sm" className="rounded-full px-4 transition-all duration-300" asChild>
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>

          <button 
            className="md:hidden p-2 z-50 relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted/20"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile menu - moved outside header for better positioning */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-container">
          <div className="mobile-menu-content">
            <nav className="mobile-menu-nav">
              <NavLinks mobile onClick={() => setIsMobileMenuOpen(false)} />
            </nav>
            <div className="mobile-menu-buttons">
              <Button variant="outline" className="w-full rounded-full py-6" asChild>
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  Log In
                </Link>
              </Button>
              <Button className="w-full rounded-full py-6" asChild>
                <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                  Get Started
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const NavLinks = ({ mobile = false, onClick }: { mobile?: boolean; onClick?: () => void }) => {
  const linkClass = mobile 
    ? "mobile-nav-link" 
    : "text-sm font-medium hover:text-primary transition-colors";

  return (
    <>
      <Link to="/" className={linkClass} onClick={onClick}>
        Home
      </Link>
      <Link to="/features" className={linkClass} onClick={onClick}>
        Features
      </Link>
      <Link to="/pricing" className={linkClass} onClick={onClick}>
        Pricing
      </Link>
      <Link to="/support" className={linkClass} onClick={onClick}>
        Support
      </Link>
    </>
  );
};
