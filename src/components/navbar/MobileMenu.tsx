
import { NavLinks } from './NavLinks';
import { X, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import LogoutButton from '@/components/LogoutButton';
import { Logo } from '@/components/ui/Logo';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  const { isAuthenticated } = useAuth();
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto mobile-menu">
      <div className="px-6 py-6 border-b flex items-center justify-between bg-primary text-white">
        <Logo size="xl" withText={true} className="text-white" />
        <button
          onClick={onClose}
          className="p-2 flex items-center justify-center w-14 h-14 rounded-full hover:bg-white/20 ml-4"
          aria-label="Close mobile menu"
          data-mobile-menu-close
        >
          <X size={28} />
        </button>
      </div>
      
      <nav className="px-6 py-8 flex flex-col gap-8">
        <div className="flex flex-col gap-6 text-xl">
          <NavLinks mobile onClick={onClose} />
        </div>
        
        <div className="flex flex-col gap-4 mt-6">
          {isAuthenticated ? (
            <>
              <Button asChild variant="default" size="lg" className="w-full">
                <Link to="/dashboard" onClick={onClose}>Dashboard</Link>
              </Button>
              <LogoutButton variant="outline" size="lg" className="w-full" onClick={onClose} position="left" />
            </>
          ) : (
            <>
              <Button asChild variant="default" size="lg" className="w-full">
                <Link to="/signup" onClick={onClose}>Get Started</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full">
                <Link to="/login" onClick={onClose} className="flex items-center">
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
