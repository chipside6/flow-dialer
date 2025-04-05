
import React from 'react';
import { Link } from 'react-router-dom';
import { X, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/contexts/auth';

interface SipMobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SipMobileMenu = ({ isOpen, onClose }: SipMobileMenuProps) => {
  const { isAuthenticated } = useAuth();
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto overflow-x-hidden mobile-menu">
      <div className="px-6 py-4 border-b flex items-center justify-between">
        <Logo size="lg" />
        <button
          onClick={onClose}
          className="p-2 flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100"
          aria-label="Close mobile menu"
        >
          <X size={24} />
        </button>
      </div>
      
      <nav className="px-6 py-8 flex flex-col gap-6">
        <div className="flex flex-col gap-4 text-lg">
          <Link to="/" onClick={onClose} className="py-2 hover:text-[#0EA5E9]">Home</Link>
          <Link to="/features" onClick={onClose} className="py-2 hover:text-[#0EA5E9]">Features</Link>
          <Link to="/pricing" onClick={onClose} className="py-2 hover:text-[#0EA5E9]">Pricing</Link>
          <Link to="/support" onClick={onClose} className="py-2 hover:text-[#0EA5E9]">Support</Link>
        </div>
        
        <div className="flex flex-col gap-4 mt-4">
          {isAuthenticated ? (
            <Button asChild variant="default" size="lg" className="w-full bg-[#0EA5E9] hover:bg-[#0284c7]">
              <Link to="/dashboard" onClick={onClose}>Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="default" size="lg" className="w-full bg-[#0EA5E9] hover:bg-[#0284c7]">
                <Link to="/signup" onClick={onClose}>Get Started</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full">
                <Link to="/login" onClick={onClose} className="flex items-center justify-center">
                  <LogIn className="h-4 w-4 mr-2" />
                  <span>Log In</span>
                </Link>
              </Button>
            </>
          )}
        </div>
      </nav>
    </div>
  );
};
