
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Logo } from '@/components/ui/Logo';
import { SipMobileMenu } from './SipMobileMenu';

export const SipHeader = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    const handleRouteChange = () => setIsMobileMenuOpen(false);
    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    console.log('Mobile menu toggled:', !isMobileMenuOpen);
  };

  return (
    <div className="w-full flex flex-col sip-header">
      {/* Main header */}
      <div className="w-full bg-white py-2 px-3 md:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center w-full">
          {/* Logo aligned to the extreme left */}
          <Link to="/" className="flex-shrink-0">
            <Logo size="sm" />
          </Link>
          
          {/* Button and menu aligned to the extreme right with no spacing between them */}
          <div className="flex items-center gap-1">
            <Button 
              className="text-white rounded-full px-4 py-1 text-sm font-medium transition-colors h-8 mr-1"
              asChild
              variant="skyblue"
            >
              <Link to="/signup">
                Get Started
              </Link>
            </Button>

            <Button 
              className="rounded-full px-4 py-1 text-sm font-medium transition-colors h-8 mr-1 border border-sky-500 text-sky-500 hover:bg-sky-50"
              asChild
            >
              <Link to="/login">
                Login
              </Link>
            </Button>
            
            <button 
              className="p-2 rounded-md hover:bg-gray-100" 
              aria-label="Menu" 
              onClick={toggleMobileMenu}
            >
              <Menu size={24} className="text-slate-700" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <SipMobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </div>
  );
};
