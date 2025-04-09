
import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Phone, 
  FileAudio, 
  Users, 
  Settings, 
  X,
  UserCircle,
  Server,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarNavItem } from './SidebarNavItem';
import { useAuth } from '@/contexts/auth';
import { useSidebar } from '@/components/ui/sidebar';
import { Logo } from '@/components/ui/Logo';
import { clearAllAuthData, forceLogoutWithReload } from '@/utils/sessionCleanup';

export const DashboardSidebar = () => {
  const location = useLocation();
  const { isAdmin, signOut } = useAuth();
  const [activeItem, setActiveItem] = useState('');
  const { openMobile, setOpenMobile, isMobile } = useSidebar();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/dashboard')) {
      setActiveItem('dashboard');
    } else if (path.includes('/campaigns') || path.includes('/campaign')) {
      setActiveItem('campaigns');
    } else if (path.includes('/contacts')) {
      setActiveItem('leads');
    } else if (path.includes('/transfers')) {
      setActiveItem('transfers');
    } else if (path.includes('/greetings')) {
      setActiveItem('audio');
    } else if (path.includes('/goip-setup')) {
      setActiveItem('device');
    } else if (path.includes('/profile')) {
      setActiveItem('profile');
    } else if (path.includes('/settings')) {
      setActiveItem('settings');
    }
  }, [location]);

  const handleCloseSidebar = () => {
    if (setOpenMobile) {
      setOpenMobile(false);
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    
    try {
      // IMMEDIATELY clear all auth data to prevent auto re-login
      clearAllAuthData();
      
      // Call the signOut function from auth context
      if (signOut) await signOut();
      
      // Force app reload after signOut to ensure complete state reset
      forceLogoutWithReload();
    } catch (error) {
      console.error("Logout error:", error);
      
      // If all else fails, clear session directly and force reload
      clearAllAuthData();
      forceLogoutWithReload();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div 
      data-sidebar="sidebar"
      className={`fixed inset-y-0 left-0 z-50 flex h-full flex-col border-r bg-background transition-transform duration-300 ease-in-out ${
        openMobile || !isMobile ? 'translate-x-0' : '-translate-x-full'
      } md:flex w-64`}
    >
      {/* Header - Fixed at top */}
      <div className="flex h-12 items-center px-3 border-b" data-sidebar="header">
        <Link to="/dashboard" className="flex items-center gap-2">
          <Logo size="sm" withText={true} />
        </Link>
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto"
            onClick={handleCloseSidebar}
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {/* Main content - with proper scrolling */}
      <div className="flex-1 overflow-y-auto" data-sidebar="content">
        <nav className="flex flex-col gap-px px-1 py-1">
          <SidebarNavItem
            icon={<LayoutDashboard className="h-4 w-4" />}
            href="/dashboard"
            label="Dashboard"
            isActive={activeItem === 'dashboard'}
            onClick={handleCloseSidebar}
            className="py-1"
          />
          <SidebarNavItem
            icon={<Phone className="h-4 w-4" />}
            href="/campaigns"
            label="Campaigns"
            isActive={activeItem === 'campaigns'}
            onClick={handleCloseSidebar}
            className="py-1"
          />
          <SidebarNavItem
            icon={<Users className="h-4 w-4" />}
            href="/contacts"
            label="Leads"
            isActive={activeItem === 'leads'}
            onClick={handleCloseSidebar}
            className="py-1"
          />
          <SidebarNavItem
            icon={<Phone className="h-4 w-4" />}
            href="/transfers"
            label="Transfer Numbers"
            isActive={activeItem === 'transfers'}
            onClick={handleCloseSidebar}
            className="py-1"
          />
          <SidebarNavItem
            icon={<FileAudio className="h-4 w-4" />}
            href="/greetings"
            label="Audio Files"
            isActive={activeItem === 'audio'}
            onClick={handleCloseSidebar}
            className="py-1"
          />
          <SidebarNavItem
            icon={<Server className="h-4 w-4" />}
            href="/goip-setup"
            label="Device Setup"
            isActive={activeItem === 'device'}
            onClick={handleCloseSidebar}
            className="py-1"
          />
        </nav>
        
        {/* Hidden on mobile most of the time */}
        {(isAdmin && !isMobile) && (
          <div className="px-1">
            <SidebarNavItem
              icon={<Settings className="h-4 w-4" />}
              href="/asterisk-config"
              label="Asterisk Config"
              isActive={activeItem === 'asterisk'}
              onClick={handleCloseSidebar}
              className="py-1"
            />
          </div>
        )}
      </div>
      
      {/* Logout button - Fixed at bottom */}
      <div className="mt-auto px-1 py-2 border-t">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleLogout} 
          className="w-full justify-start h-8 py-1"
          disabled={isLoggingOut}
        >
          <LogOut className="h-4 w-4 mr-2" /> 
          <span>Logout</span>
        </Button>
      </div>
    </div>
  );
};
