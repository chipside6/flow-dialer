import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Phone, 
  FileAudio, 
  Users, 
  Settings, 
  X,
  UserCircle,
  Server,
  LogOut,
  Activity,
  PhoneForwarded,
  Shield,
  CreditCard,
  Database
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarNavItem } from './SidebarNavItem';
import { useAuth } from '@/contexts/auth';
import { useSidebar } from '@/components/ui/sidebar';
import { Logo } from '@/components/ui/Logo';
import { clearAllAuthData, forceLogoutWithReload } from '@/utils/sessionCleanup';
import { useSubscription } from '@/hooks/subscription';

export const DashboardSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin, signOut } = useAuth();
  const [activeItem, setActiveItem] = useState('');
  const { openMobile, setOpenMobile, isMobile } = useSidebar();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  // Only grab what's needed from subscription to prevent unnecessary re-renders
  const { currentPlan, subscription } = useSubscription();
  
  // Memoize isSubscribed check to prevent recalculation on each render
  const isSubscribed = useMemo(() => {
    return currentPlan === 'lifetime' || 
           (subscription?.plan_id === 'lifetime' || 
           (subscription?.status === 'active' && subscription?.plan_id !== 'trial'));
  }, [currentPlan, subscription]);

  // Use useEffect with location dependency to update active item
  useEffect(() => {
    const path = location.pathname;
    let newActiveItem = '';
    
    if (path.includes('/dashboard')) {
      newActiveItem = 'dashboard';
    } else if (path.includes('/campaigns') || path.includes('/campaign')) {
      newActiveItem = 'campaigns';
    } else if (path.includes('/contacts')) {
      newActiveItem = 'leads';
    } else if (path.includes('/transfers')) {
      newActiveItem = 'transfers';
    } else if (path.includes('/greetings')) {
      newActiveItem = 'audio';
    } else if (path.includes('/goip-setup')) {
      newActiveItem = 'device';
    } else if (path.includes('/profile')) {
      newActiveItem = 'profile';
    } else if (path.includes('/settings')) {
      newActiveItem = 'settings';
    } else if (path.includes('/diagnostics')) {
      newActiveItem = 'diagnostics';
    } else if (path.includes('/admin')) {
      newActiveItem = 'admin';
    } else if (path.includes('/upgrade')) {
      newActiveItem = 'upgrade';
    } else if (path.includes('/asterisk-config')) {
      newActiveItem = 'asterisk-config';
    }
    
    setActiveItem(newActiveItem);
  }, [location]);

  // Use useCallback to prevent recreation of these functions on each render
  const handleCloseSidebar = useCallback(() => {
    if (setOpenMobile) {
      setOpenMobile(false);
    }
  }, [setOpenMobile]);

  const handleLogout = useCallback(async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    
    try {
      // IMMEDIATELY clear all auth data to prevent auto re-login
      clearAllAuthData();
      
      // Call the signOut function from auth context
      if (signOut) await signOut();
      
      // Navigate to login page first
      navigate('/login');
      
      // Force app reload after signOut to ensure complete state reset
      setTimeout(() => {
        forceLogoutWithReload();
      }, 100);
    } catch (error) {
      console.error("Logout error:", error);
      
      // If all else fails, clear session directly and force reload
      clearAllAuthData();
      navigate('/login');
      forceLogoutWithReload();
    } finally {
      setIsLoggingOut(false);
    }
  }, [isLoggingOut, signOut, navigate]);

  // Use useEffect with body class for sidebar state
  useEffect(() => {
    if (isMobile && openMobile) {
      document.body.classList.add('mobile-menu-open');
    } else {
      document.body.classList.remove('mobile-menu-open');
    }
    
    return () => {
      document.body.classList.remove('mobile-menu-open');
    };
  }, [isMobile, openMobile]);

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
            icon={<PhoneForwarded className="h-4 w-4" />}
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
          <SidebarNavItem
            icon={<UserCircle className="h-4 w-4" />}
            href="/profile"
            label="Profile"
            isActive={activeItem === 'profile'}
            onClick={handleCloseSidebar}
            className="py-1"
          />
          <SidebarNavItem
            icon={<Settings className="h-4 w-4" />}
            href="/settings"
            label="Settings"
            isActive={activeItem === 'settings'}
            onClick={handleCloseSidebar}
            className="py-1"
          />
          <SidebarNavItem
            icon={<Activity className="h-4 w-4" />}
            href="/diagnostics"
            label="Diagnostics"
            isActive={activeItem === 'diagnostics'}
            onClick={handleCloseSidebar}
            className="py-1"
          />
          
          {/* Only show upgrade link if not subscribed */}
          {!isSubscribed && (
            <SidebarNavItem
              icon={<CreditCard className="h-4 w-4" />}
              href="/upgrade"
              label="Upgrade"
              isActive={activeItem === 'upgrade'}
              onClick={handleCloseSidebar}
              className="py-1"
            />
          )}
          
          {/* Admin-only items */}
          {isAdmin && (
            <>
              <SidebarNavItem
                icon={<Shield className="h-4 w-4" />}
                href="/admin"
                label="Admin Panel"
                isActive={activeItem === 'admin'}
                onClick={handleCloseSidebar}
                className="py-1"
              />
              <SidebarNavItem
                icon={<Database className="h-4 w-4" />}
                href="/asterisk-config"
                label="Asterisk Config"
                isActive={activeItem === 'asterisk-config'}
                onClick={handleCloseSidebar}
                className="py-1"
              />
            </>
          )}
        </nav>
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
          <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
        </Button>
      </div>
    </div>
  );
};
