
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Logo } from '@/components/ui/Logo';
import { SipMobileMenu } from './SipMobileMenu';

interface SipHeaderProps {
  className?: string;
}

export const SipHeader: React.FC<SipHeaderProps> = ({ className }) => {
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

  // Log on mount to confirm the component is rendering
  useEffect(() => {
    console.log('SipHeader mounted and visible');
    
    // Force display after component mounts
    const forceDisplay = () => {
      const header = document.querySelector('.sip-header');
      if (header) {
        (header as HTMLElement).style.display = 'block';
        (header as HTMLElement).style.visibility = 'visible';
        (header as HTMLElement).style.opacity = '1';
        console.log('Force applied to header element');
      }
    };
    
    // Run immediately and after a small delay to ensure it takes effect
    forceDisplay();
    const timer = setTimeout(forceDisplay, 100);
    return () => clearTimeout(timer);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    console.log('Mobile menu toggled:', !isMobileMenuOpen);
  };

  console.log("SipHeader rendering with className:", className);

  return (
    <header 
      className={`w-full flex flex-col sip-header ${className || ''}`} 
      style={{
        display: 'block', 
        visibility: 'visible', 
        opacity: '1',
        position: 'relative',
        zIndex: 50
      }}
      data-header-element="true"
    >
      {/* Top info bar */}
      <div className="w-full bg-gray-100 py-2 px-4 md:px-8 text-sm">
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
            <Link to="/login" className="text-[#ff6c2c] hover:underline font-medium">
              Customer Login
            </Link>
          </div>
        </div>
      </div>
      
      {/* Main header */}
      <div className="w-full bg-white py-4 px-4 md:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo aligned to the extreme left */}
          <Link to="/" className="flex items-center mr-auto">
            <Logo size="lg" />
          </Link>
          
          {/* Button and menu aligned to the extreme right */}
          <div className="flex items-center gap-4 ml-auto">
            <Button 
              className="bg-[#0EA5E9] hover:bg-[#0284c7] text-white rounded-full px-6 py-2 font-medium transition-colors"
              asChild
              variant="skyblue"
            >
              <Link to="/signup">
                Get Started
              </Link>
            </Button>
            
            <button 
              className="p-2" 
              aria-label="Menu" 
              onClick={toggleMobileMenu}
            >
              <Menu size={28} className="text-slate-700" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <SipMobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </header>
  );
};
