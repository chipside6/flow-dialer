
import { Link } from 'react-router-dom';
import { Menu, LogIn } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { NavLinks } from './NavLinks';
import { MobileMenu } from './MobileMenu';
import { Dispatch, SetStateAction } from 'react';
import { useAuth } from '@/contexts/auth';
import LogoutButton from '@/components/LogoutButton';
import { Logo } from '@/components/ui/Logo';
import { useLocation } from 'react-router-dom';

interface PublicNavbarProps {
  isScrolled: boolean;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: Dispatch<SetStateAction<boolean>>;
}

export const PublicNavbar = ({ isScrolled, isMobileMenuOpen, setIsMobileMenuOpen }: PublicNavbarProps) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  
  // Add a data attribute to body for page-specific styling
  if (typeof document !== 'undefined') {
    document.body.setAttribute('data-page', location.pathname.replace('/', '') || 'home');
  }
  
  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out px-4 py-2 ${isScrolled ? 'bg-background/80 backdrop-blur-sm shadow-sm border-b' : 'border-transparent bg-background'}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link 
            to={isAuthenticated ? "/dashboard" : "/"} 
            className="flex items-center gap-2"
          >
            <Logo size="sm" />
          </Link>
        </div>
        
        <div className="hidden md:flex items-center gap-6">
          <nav className="flex items-center gap-6">
            <NavLinks />
          </nav>
        </div>
        
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Button variant="ghost" asChild className="hidden md:flex">
                <Link to="/dashboard">Dashboard</Link>
              </Button>
              <LogoutButton variant="ghost" className="hidden md:flex" />
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/login">
                  <span>Log In</span>
                </Link>
              </Button>
              <Button className="bg-sky-500 hover:bg-sky-600 text-white rounded-full" asChild>
                <Link to="/signup">Get Started</Link>
              </Button>
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2 flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted ml-2"
                aria-label="Open mobile menu"
              >
                <Menu size={24} />
              </button>
            </>
          )}
        </div>
      </div>
      
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
    </header>
  );
};
