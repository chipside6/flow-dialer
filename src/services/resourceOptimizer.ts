
/**
 * Resource optimization service to prioritize critical assets
 */

// Script loading priorities
export enum LoadPriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  IDLE = 'idle'
}

// Track loaded scripts to avoid duplicates
const loadedScripts: Set<string> = new Set();

/**
 * Dynamically load a script with specified priority
 */
export const loadScript = (
  src: string,
  priority: LoadPriority = LoadPriority.MEDIUM,
  attributes: Record<string, string> = {}
): Promise<void> => {
  if (loadedScripts.has(src)) {
    return Promise.resolve();
  }
  
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    
    // Set priority using fetchpriority attribute
    if (priority === LoadPriority.CRITICAL || priority === LoadPriority.HIGH) {
      script.setAttribute('fetchpriority', 'high');
    }
    
    // Add custom attributes
    Object.entries(attributes).forEach(([key, value]) => {
      script.setAttribute(key, value);
    });
    
    // Add async for non-critical resources
    if (priority !== LoadPriority.CRITICAL) {
      script.async = true;
    }
    
    // Add defer for low priority resources
    if (priority === LoadPriority.LOW || priority === LoadPriority.IDLE) {
      script.defer = true;
    }
    
    script.onload = () => {
      loadedScripts.add(src);
      resolve();
    };
    
    script.onerror = () => {
      reject(new Error(`Failed to load script: ${src}`));
    };
    
    document.head.appendChild(script);
  });
};

/**
 * Preconnect to important domains to speed up subsequent requests
 */
export const setupPreconnect = (domains: string[]) => {
  domains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
};

// Type definition for Network Information API
interface NetworkInformation {
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g';
  saveData?: boolean;
  rtt?: number;
  downlink?: number;
}

/**
 * Safely checks if the user is on a slow connection
 */
const isSlowConnection = (): boolean => {
  // Check if Network Information API is available
  if (
    'connection' in navigator && 
    (navigator as any).connection && 
    (navigator as any).connection.effectiveType
  ) {
    const connection = (navigator as any).connection as NetworkInformation;
    return connection.effectiveType === 'slow-2g' || 
           connection.effectiveType === '2g' || 
           (connection.saveData === true);
  }
  
  // Fallback: if we can't detect, assume it's not a slow connection
  return false;
};

/**
 * Initialize performance optimizations
 */
export const initResourceOptimizations = () => {
  // Preconnect to essential domains
  setupPreconnect([
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    // Add your Supabase URL here if used frequently
    // Add any other API domains used frequently
  ]);
  
  // Detect slow connections and reduce resource loading
  if (isSlowConnection()) {
    // Set up reduced quality resources for slow connections
    document.documentElement.classList.add('slow-connection');
  }
};
