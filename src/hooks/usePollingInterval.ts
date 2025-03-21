
import { useEffect, useRef } from 'react';

interface PollingOptions {
  enabled: boolean;
  interval?: number;
  onError?: (error: unknown) => void;
}

/**
 * A custom hook for polling at regular intervals
 * 
 * @param callback Function to be called at each interval
 * @param options Polling configuration options
 * @param options.enabled Whether polling is active
 * @param options.interval Time between polls in milliseconds (default: 3000ms)
 * @param options.onError Optional error handler
 */
export const usePollingInterval = (
  callback: () => Promise<void> | void,
  { enabled, interval = 3000, onError }: PollingOptions
) => {
  // Use a ref to store the latest callback to avoid recreating the interval on callback changes
  const callbackRef = useRef(callback);
  
  // Update the ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Set up and clean up the interval
  useEffect(() => {
    if (!enabled) return;
    
    const executeCallback = async () => {
      try {
        await callbackRef.current();
      } catch (error) {
        if (onError) {
          onError(error);
        } else {
          console.error('Error in polling callback:', error);
        }
      }
    };
    
    // Run once immediately
    executeCallback();
    
    // Set up interval
    const intervalId = window.setInterval(executeCallback, interval);
    
    // Clean up interval on unmount or when enabled/interval changes
    return () => {
      window.clearInterval(intervalId);
    };
  }, [enabled, interval, onError]);
};
