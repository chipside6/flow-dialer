
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Menu, X, Phone } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isDashboard = location.pathname.includes('/dashboard') || 
                      location.pathname.includes('/campaign') || 
                      location.pathname.includes('/greetings') ||
                      location.pathname.includes('/contacts') ||
                      location.pathname.includes('/transfers') ||
                      location.pathname.includes('/sip-providers');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isDashboard) {
    return (
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out px-4 py-3 bg-background border-b`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden" />
            <Link 
              to="/" 
              className="flex items-center gap-2 text-xl font-display font-bold tracking-tight"
            >
              <span className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white">
                <Phone size={16} />
              </span>
              Flow Dialer
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
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out px-6 md:px-10 ${
        isScrolled 
          ? 'py-3 bg-white/80 backdrop-blur-md shadow-sm' 
          : 'py-5 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center gap-2 text-xl font-display font-bold tracking-tight"
        >
          <span className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white">
            <Phone size={16} />
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
          className="md:hidden p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-white animate-fade-in z-40">
          <div className="flex flex-col p-8 space-y-6">
            <nav className="flex flex-col gap-6 py-8">
              <NavLinks mobile onClick={() => setIsMobileMenuOpen(false)} />
            </nav>
            <div className="flex flex-col gap-4">
              <Button variant="outline" className="rounded-full py-6" asChild>
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  Log In
                </Link>
              </Button>
              <Button className="rounded-full py-6" asChild>
                <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                  Get Started
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

const NavLinks = ({ mobile = false, onClick }: { mobile?: boolean; onClick?: () => void }) => {
  const linkClass = mobile 
    ? "text-lg font-medium" 
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
