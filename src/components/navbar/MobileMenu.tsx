
import { NavLinks } from './NavLinks';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import LogoutButton from '@/components/LogoutButton';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  const { isAuthenticated } = useAuth();
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto mobile-menu">
      <div className="px-6 py-4 border-b flex items-center justify-between bg-muted/10">
        <h2 className="text-xl font-bold">Menu</h2>
        <button
          onClick={onClose}
          className="p-2 flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted"
          aria-label="Close mobile menu"
        >
          <X size={24} />
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
              <LogoutButton variant="outline" size="lg" className="w-full" onClick={onClose} />
            </>
          ) : (
            <>
              <Button asChild variant="default" size="lg" className="w-full">
                <Link to="/signup" onClick={onClose}>Get Started</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full">
                <Link to="/login" onClick={onClose}>Log In</Link>
              </Button>
            </>
          )}
        </div>
      </nav>
    </div>
  );
};
