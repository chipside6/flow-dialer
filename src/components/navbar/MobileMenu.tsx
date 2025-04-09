
import React from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 bg-white">
      <div className="flex justify-end p-4">
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-100"
          aria-label="Close menu"
        >
          <X size={24} />
        </button>
      </div>
      
      <nav className="flex flex-col p-4 space-y-4">
        <Link 
          to="/" 
          className="px-4 py-3 text-lg hover:bg-gray-100 rounded-md"
          onClick={onClose}
        >
          Home
        </Link>
        <Link 
          to="/features" 
          className="px-4 py-3 text-lg hover:bg-gray-100 rounded-md"
          onClick={onClose}
        >
          Features
        </Link>
        <Link 
          to="/pricing" 
          className="px-4 py-3 text-lg hover:bg-gray-100 rounded-md"
          onClick={onClose}
        >
          Pricing
        </Link>
        <Link 
          to="/support" 
          className="px-4 py-3 text-lg hover:bg-gray-100 rounded-md"
          onClick={onClose}
        >
          Support
        </Link>
        
        <div className="pt-4 mt-4 border-t">
          <Button
            className="w-full bg-sky-500 hover:bg-sky-600 text-white rounded-full py-6"
            onClick={onClose}
            asChild
          >
            <Link to="/signup">Get Started</Link>
          </Button>
          
          <Button
            variant="outline"
            className="w-full mt-3 rounded-full py-6"
            onClick={onClose}
            asChild
          >
            <Link to="/login">Log In</Link>
          </Button>
        </div>
      </nav>
    </div>
  );
};
