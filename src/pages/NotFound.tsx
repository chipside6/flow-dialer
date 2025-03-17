
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

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
            <a href="/">Return Home</a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
