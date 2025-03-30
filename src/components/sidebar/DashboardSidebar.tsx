
import React, { useState } from "react";
import {
  Home,
  Users,
  Mic2,
  PhoneForwarded,
  Phone,
  CreditCard,
  ShieldCheck,
  User,
} from "lucide-react";
import { SidebarNavItem } from "./SidebarNavItem";
import { Logo } from "@/components/ui/Logo";
import { useAuth } from "@/contexts/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function DashboardSidebar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const isAdmin = user?.email === "admin@example.com";

  return (
    <div className="hidden md:flex h-screen w-64 flex-col fixed inset-y-0 z-50">
      <div className="flex flex-col flex-grow bg-background border-r pt-5 pb-4 overflow-y-auto">
        <div className="flex-shrink-0 px-4">
          <Logo />
        </div>
        <div className="mt-5 flex-grow flex flex-col">
          <nav className="flex-1 px-2 space-y-1">
            <SidebarNavItem to="/dashboard" icon={Home}>
              Dashboard
            </SidebarNavItem>
            <SidebarNavItem to="/contacts" icon={Users}>
              Contacts
            </SidebarNavItem>
            <SidebarNavItem to="/greetings" icon={Mic2}>
              Greetings
            </SidebarNavItem>
            <SidebarNavItem to="/transfers" icon={PhoneForwarded}>
              Transfer Numbers
            </SidebarNavItem>
            <SidebarNavItem to="/sip-providers" icon={Phone}>
              SIP Providers
            </SidebarNavItem>
            <SidebarNavItem to="/upgrade" icon={CreditCard}>
              Upgrade
            </SidebarNavItem>
            {isAdmin && (
              <SidebarNavItem to="/admin" icon={ShieldCheck}>
                Admin
              </SidebarNavItem>
            )}
          </nav>
        </div>
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <div className="flex items-center">
            <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.email ? `https://avatar.vercel.sh/${user.email}` : undefined} alt={user?.email || ''} />
                    <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mt-2" align="end" forceMount>
                <div className="grid gap-2 px-2">
                  <p className="font-medium text-sm text-center">Signed in as</p>
                  <p className="text-xs text-muted-foreground text-center">
                    {user?.email}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" onClick={() => setIsDropdownOpen(false)}>
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/upgrade" onClick={() => setIsDropdownOpen(false)}>
                    Upgrade
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {
                  signOut();
                  navigate('/login');
                }}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
