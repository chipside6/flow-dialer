
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { SidebarNavItem } from './SidebarNavItem';
import { Separator } from '@/components/ui/separator';
import { Layout, PhoneOutgoing, Users, MessageSquare, PhoneForwarded, Server, User } from 'lucide-react';

interface DashboardSidebarProps {
  // Add any props needed
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = () => {
  const location = useLocation();
  const [activeItem, setActiveItem] = useState('');
  
  // Update active item based on path - use useCallback to prevent infinite loops
  const updateActiveItem = useCallback(() => {
    const path = location.pathname;
    
    if (path.includes('/dashboard')) {
      setActiveItem('dashboard');
    } else if (path.includes('/campaigns')) {
      setActiveItem('campaigns');
    } else if (path.includes('/contacts')) {
      setActiveItem('contacts');
    } else if (path.includes('/greetings')) {
      setActiveItem('greetings');
    } else if (path.includes('/transfers')) {
      setActiveItem('transfers');
    } else if (path.includes('/goip-setup')) {
      setActiveItem('goip-setup');
    } else if (path.includes('/profile')) {
      setActiveItem('profile');
    }
  }, [location.pathname]);

  // Use effect with proper dependency array to prevent infinite loops
  useEffect(() => {
    updateActiveItem();
  }, [updateActiveItem]);

  // Rest of sidebar implementation
  return (
    <div className="h-screen pb-12">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Navigation
          </h2>
          <div className="space-y-1">
            <SidebarNavItem 
              href="/dashboard" 
              isActive={activeItem === 'dashboard'}
              icon={<Layout />}
              label="Dashboard" 
            />
            
            <SidebarNavItem 
              href="/campaigns" 
              isActive={activeItem === 'campaigns'}
              icon={<PhoneOutgoing />}
              label="Campaigns" 
            />

            <SidebarNavItem 
              href="/contacts" 
              isActive={activeItem === 'contacts'}
              icon={<Users />}
              label="Contact Lists" 
            />

            <SidebarNavItem 
              href="/greetings" 
              isActive={activeItem === 'greetings'}
              icon={<MessageSquare />}
              label="Greeting Files" 
            />

            <SidebarNavItem 
              href="/transfers" 
              isActive={activeItem === 'transfers'}
              icon={<PhoneForwarded />}
              label="Transfer Numbers" 
            />

            <SidebarNavItem 
              href="/goip-setup" 
              isActive={activeItem === 'goip-setup'}
              icon={<Server />}
              label="GoIP Setup" 
            />
          </div>
        </div>
        
        <Separator />
        
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Settings
          </h2>
          <div className="space-y-1">
            <SidebarNavItem 
              href="/profile" 
              isActive={activeItem === 'profile'}
              icon={<User />}
              label="Profile" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSidebar;
