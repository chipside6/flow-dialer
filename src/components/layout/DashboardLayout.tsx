
import React from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth";
import { Loader2 } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import LogoutButton from "@/components/LogoutButton";
import { NavItem } from "@/components/navigation/NavItem";
import { AffiliateStatus } from "@/components/navigation/AffiliateStatus";

interface DashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardLayout({ children, className }: DashboardLayoutProps) {
  const { user, profile, isLoading, isAdmin, isAuthenticated, initialized } = useAuth();
  const { sidebarOpen } = useSidebar();
  const [timeoutReached, setTimeoutReached] = React.useState(false);

  // Set a timeout to prevent infinite loading state
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setTimeoutReached(true);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  // Show loading state only if auth is still loading and timeout hasn't been reached
  if (isLoading && !timeoutReached && !initialized) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-xl font-medium">Loading...</span>
      </div>
    );
  }

  // Show auth error if we've detected one
  if (!isAuthenticated && initialized && !isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>
            Please log in to access the dashboard.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={cn("flex min-h-screen flex-col", className)}>
      <div className="flex flex-1">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-64 transform overflow-y-auto bg-background border-r transition-transform duration-200 ease-in-out",
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
            "md:w-64"
          )}
        >
          <div className="flex h-full flex-col overflow-y-auto">
            <div className="flex-1 py-6 px-4">
              <div className="mb-8 flex flex-col items-center space-y-3">
                <Avatar className="h-14 w-14">
                  <AvatarFallback className="text-xl">
                    {profile?.full_name?.[0] || user?.email?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <p className="text-sm font-medium">
                    {profile?.full_name || user?.email || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
                {isAdmin && (
                  <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground">
                    Admin
                  </span>
                )}
                <AffiliateStatus />
              </div>

              <nav className="flex flex-col space-y-1">
                <NavItem href="/dashboard" icon="LayoutDashboard">
                  Dashboard
                </NavItem>
                <NavItem href="/campaign" icon="Phone">
                  Campaigns
                </NavItem>
                <NavItem href="/greetings" icon="MessageCircle">
                  Greeting Files
                </NavItem>
                <NavItem href="/contacts" icon="Users">
                  Contact Lists
                </NavItem>
                <NavItem href="/transfers" icon="PhoneForwarded">
                  Transfer Numbers
                </NavItem>
                <NavItem href="/sip-providers" icon="Headphones">
                  SIP Providers
                </NavItem>
                <NavItem href="/billing" icon="CreditCard">
                  Billing
                </NavItem>
                {isAdmin && (
                  <NavItem href="/admin" icon="ShieldCheck">
                    Admin Panel
                  </NavItem>
                )}
              </nav>
            </div>
            
            <div className="p-4 border-t">
              <LogoutButton variant="secondary" className="w-full" />
            </div>
          </div>
        </aside>

        <main
          className={cn(
            "flex-1 overflow-x-hidden px-4 py-8 transition-all duration-200 ease-in-out",
            sidebarOpen ? "md:ml-64" : ""
          )}
        >
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
