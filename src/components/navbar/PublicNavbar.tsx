
import { Link } from 'react-router-dom';
import { Menu, LogIn } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { NavLinks } from './NavLinks';
import { MobileMenu } from './MobileMenu';
import { Dispatch, SetStateAction } from 'react';
import { useAuth } from '@/contexts/auth';
import LogoutButton from '@/components/LogoutButton';
import { Logo } from '@/components/ui/Logo';

interface PublicNavbarProps {
  isScrolled: boolean;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: Dispatch<SetStateAction<boolean>>;
}

export const PublicNavbar = ({ isScrolled, isMobileMenuOpen, setIsMobileMenuOpen }: PublicNavbarProps) => {
  const { isAuthenticated } = useAuth();
  
  return (
    <header className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-300 ease-in-out px-6 py-4 bg-background border-b ${isScrolled ? 'header-shadow' : ''}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted mobile-menu-button"
            aria-label="Open mobile menu"
          >
            <Menu size={24} className="text-foreground" />
            <span className="sr-only">Menu</span>
          </button>
          <Link 
            to={isAuthenticated ? "/dashboard" : "/"} 
            className="flex items-center gap-2 logo-container"
          >
            <Logo className="text-foreground" />
          </Link>
        </div>
        
        <div className="hidden md:flex items-center gap-6">
          <nav className="flex items-center gap-6 text-foreground">
            <NavLinks />
          </nav>
        </div>
        
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Button variant="ghost" asChild className="hidden md:inline-flex text-foreground">
                <Link to="/dashboard">
                  <span className="visible">Dashboard</span>
                </Link>
              </Button>
              <LogoutButton variant="ghost" className="hidden md:inline-flex text-foreground" />
            </>
          ) : (
            <>
              <Button variant="ghost" asChild className="hidden md:inline-flex text-foreground">
                <Link to="/login">
                  <LogIn className="h-4 w-4 mr-2" />
                  <span className="visible">Log In</span>
                </Link>
              </Button>
              <Button className="bg-primary rounded-full text-primary-foreground inline-flex items-center" asChild>
                <Link to="/signup">
                  <span className="visible">Get Started</span>
                </Link>
              </Button>
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
