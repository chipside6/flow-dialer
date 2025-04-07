
/**
 * Component preloading service to improve perceived performance
 */

// Array to track preloaded components
const preloadedComponents: string[] = [];

/**
 * Preload components in the background during idle times
 */
export const preloadComponents = (componentPaths: string[]) => {
  if (typeof window === 'undefined') {
    return;
  }
  
  // Filter out already preloaded components
  const toPreload = componentPaths.filter(path => !preloadedComponents.includes(path));
  
  if (toPreload.length === 0) return;
  
  // Use setTimeout instead of requestIdleCallback for better compatibility
  setTimeout(() => {
    toPreload.forEach(path => {
      try {
        import(`../pages/${path}.tsx`)
          .then(() => {
            preloadedComponents.push(path);
            console.log(`Preloaded: ${path}`);
          })
          .catch(err => {
            console.error(`Failed to preload ${path}:`, err);
          });
      } catch (error) {
        console.error(`Error initiating preload for ${path}:`, error);
      }
    });
  }, 1000);
};

/**
 * Preload common components used across the application
 */
export const preloadCommonComponents = () => {
  preloadComponents([
    'Dashboard',
    'Campaign',
    'Profile'
  ]);
};

/**
 * Preload next likely pages based on current route
 */
export const preloadRelatedComponents = (currentPath: string) => {
  const relatedPaths: Record<string, string[]> = {
    '/dashboard': ['Campaign', 'GreetingsPage', 'ContactLists'],
    '/campaign': ['Dashboard', 'GreetingsPage', 'ContactLists', 'TransferNumbers'],
    '/greetings': ['Campaign', 'Dashboard'],
    '/contacts': ['Campaign', 'Dashboard'],
    '/transfers': ['Campaign', 'Dashboard'],
    '/profile': ['Dashboard']
  };
  
  if (relatedPaths[currentPath]) {
    preloadComponents(relatedPaths[currentPath]);
  }
};
