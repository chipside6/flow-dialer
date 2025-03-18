
import { Link } from 'react-router-dom';
import { Menu, Phone } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { NavLinks } from './NavLinks';
import { MobileMenu } from './MobileMenu';
import { Dispatch, SetStateAction } from 'react';

interface PublicNavbarProps {
  isScrolled: boolean;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: Dispatch<SetStateAction<boolean>>;
}

export const PublicNavbar = ({ isScrolled, isMobileMenuOpen, setIsMobileMenuOpen }: PublicNavbarProps) => {
  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out px-6 py-4 ${isScrolled ? 'bg-background/80 backdrop-blur-sm shadow-sm border-b' : 'border-transparent'}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted"
            aria-label="Open mobile menu"
          >
            <Menu size={24} />
          </button>
          <Link 
            to="/" 
            className="flex items-center gap-2 text-xl font-display font-bold tracking-tight"
          >
            <span className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white">
              <Phone size={18} />
            </span>
            Flow Dialer
          </Link>
        </div>
        
        <div className="hidden md:flex items-center gap-6">
          <nav className="flex items-center gap-6">
            <NavLinks />
          </nav>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild className="hidden md:flex">
            <Link to="/login">Log In</Link>
          </Button>
          <Button className="bg-primary rounded-full" asChild>
            <Link to="/signup">Get Started</Link>
          </Button>
        </div>
      </div>
      
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
    </header>
  );
};
