
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader,
  SidebarInset
} from "@/components/ui/sidebar";
import { DashboardNav } from "@/components/DashboardNav";
import { Phone } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const isDashboard = location.pathname.includes('/dashboard') || 
                      location.pathname.includes('/campaign') || 
                      location.pathname.includes('/campaigns') || // Added campaigns (plural)
                      location.pathname.includes('/greetings') ||
                      location.pathname.includes('/contacts') ||
                      location.pathname.includes('/transfers') ||
                      location.pathname.includes('/sip-providers') ||
                      location.pathname.includes('/admin') ||
                      location.pathname.includes('/profile') ||
                      location.pathname.includes('/billing');

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  if (isDashboard) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex flex-1 w-full pt-16">
          <Sidebar collapsible="offcanvas">
            <SidebarHeader>
              <div className="flex items-center p-2">
                <span className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white mr-2">
                  <Phone size={16} />
                </span>
                <span className="font-semibold text-lg">Flow Dialer</span>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <DashboardNav />
            </SidebarContent>
          </Sidebar>
          <SidebarInset className="p-6">
            <div className="max-w-6xl mx-auto w-full">
              <div className="text-center max-w-md mx-auto">
                <h1 className="text-6xl md:text-8xl font-display font-bold text-primary mb-6">404</h1>
                <p className="text-xl md:text-2xl font-medium mb-8">Oops! We couldn't find that page</p>
                <p className="text-muted-foreground mb-8">
                  The page you're looking for doesn't exist or has been moved.
                </p>
                <Button asChild size="lg" className="rounded-full px-8">
                  <Link to="/dashboard">Return to Dashboard</Link>
                </Button>
              </div>
            </div>
          </SidebarInset>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="text-center max-w-md">
          <h1 className="text-6xl md:text-8xl font-display font-bold text-primary mb-6">404</h1>
          <p className="text-xl md:text-2xl font-medium mb-8">Oops! We couldn't find that page</p>
          <p className="text-muted-foreground mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Button asChild size="lg" className="rounded-full px-8">
            <Link to="/">Return Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
