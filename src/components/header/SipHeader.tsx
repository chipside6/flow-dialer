
import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Menu } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Logo } from '@/components/ui/Logo';

export const SipHeader = () => {
  return (
    <div className="w-full flex flex-col">
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
          <Link to="/" className="flex items-center">
            <Logo size="lg" />
          </Link>
          
          <div className="flex items-center gap-6">
            <Button 
              className="bg-[#ff6c2c] hover:bg-[#e95d1e] text-white rounded-full px-8 py-6 text-lg font-medium transition-colors"
              asChild
            >
              <Link to="/signup">
                Get Started
              </Link>
            </Button>
            
            <button className="lg:hidden p-2" aria-label="Menu">
              <Menu size={28} className="text-slate-700" />
            </button>
            
            <nav className="hidden lg:flex items-center gap-8">
              {/* Desktop menu would go here */}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};
