
import { Link } from 'react-router-dom';
import { X, Phone } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { NavLinks } from './NavLinks';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  if (!isOpen) return null;
  
  return (
    <div className="mobile-menu-container">
      <div className="mobile-menu-header">
        <Link 
          to="/" 
          className="flex items-center gap-2 text-xl font-display font-bold tracking-tight"
          onClick={onClose}
        >
          <span className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white">
            <Phone size={18} />
          </span>
          Flow Dialer
        </Link>
        <button 
          className="p-2 flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted/20"
          onClick={onClose}
          aria-label="Close menu"
        >
          <X size={24} />
        </button>
      </div>
      
      <div className="mobile-menu-content">
        <nav className="mobile-menu-nav">
          <NavLinks mobile onClick={onClose} />
        </nav>
        <div className="mobile-menu-buttons">
          <Button variant="outline" className="w-full rounded-lg py-2" asChild>
            <Link to="/login" onClick={onClose}>
              Log In
            </Link>
          </Button>
          <Button className="w-full rounded-lg py-2 bg-violet-500 hover:bg-violet-600" asChild>
            <Link to="/signup" onClick={onClose}>
              Get Started
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
