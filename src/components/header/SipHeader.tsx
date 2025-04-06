
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LogIn, Menu } from 'lucide-react';
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
      {/* Top info bar - only visible on mobile */}
      <div className="w-full bg-gray-100 py-2 px-4 md:px-8 text-sm md:hidden">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center">
          <div className="flex items-center">
            <span className="text-gray-600">Phone: </span>
            <a href="tel:+18002506510" className="text-[#ff6c2c] hover:underline ml-1 font-medium">
              (800) 250-6510
            </a>
            <span className="mx-2 text-gray-400">|</span>
            <Link to="/support" className="text-[#ff6c2c] hover:underline font-medium">
              Support
            </Link>
            <span className="mx-2 text-gray-400">|</span>
            <Link to="/login" className="text-[#ff6c2c] hover:underline font-medium customer-login-link">
              Customer Login
            </Link>
          </div>
        </div>
      </div>
      
      {/* Main header */}
      <div className="w-full bg-white py-2 px-4 md:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo aligned to the extreme left */}
          <Link to="/" className="flex items-center mr-auto">
            <Logo size="md" className="mobile-logo-container" />
          </Link>
          
          {/* Buttons aligned to the right */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Login button - DESKTOP ONLY */}
            <Link 
              to="/login"
              className="header-login-button hidden md:flex bg-white text-[#ff6c2c] hover:bg-[#fff5f0] rounded-full px-6 py-2 border border-[#ff6c2c] font-medium transition-colors items-center gap-2"
            >
              <LogIn size={16} />
              <span>Login</span>
            </Link>
            
            {/* Get Started button - always visible */}
            <Link 
              to="/signup"
              className="bg-sky-500 hover:bg-sky-600 text-white rounded-full px-4 py-2 md:px-6 md:py-2 font-medium transition-colors"
            >
              Get Started
            </Link>

            {/* Mobile menu button - MOBILE ONLY */}
            <button 
              className="mobile-menu-button md:hidden flex items-center justify-center ml-2" 
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
