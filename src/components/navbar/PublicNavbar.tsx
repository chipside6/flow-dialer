
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { NavLinks } from './NavLinks';
import { MobileMenu } from './MobileMenu';

interface PublicNavbarProps {
  isScrolled: boolean;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
}

export const PublicNavbar = ({ 
  isScrolled, 
  isMobileMenuOpen, 
  setIsMobileMenuOpen 
}: PublicNavbarProps) => {
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

      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
    </>
  );
};
