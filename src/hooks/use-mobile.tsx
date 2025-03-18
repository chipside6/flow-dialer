
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    // Initial check during first render
    return typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false;
  });

  React.useEffect(() => {
    // Set the initial state
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return isMobile;
}
