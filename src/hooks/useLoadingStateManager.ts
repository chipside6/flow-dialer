
import { useState, useEffect, useCallback } from 'react';

interface LoadingStateManagerOptions {
  /** Initial loading state */
  initialState?: boolean;
  /** Timeout in ms after which loading is automatically set to false */
  timeout?: number;
  /** Callback to run when timeout is reached */
  onTimeout?: () => void;
}

/**
 * Hook for managing loading states with automatic timeout fallback
 * to prevent UI from being stuck in loading state
 */
export function useLoadingStateManager({
  initialState = false,
  timeout = 10000,
  onTimeout
}: LoadingStateManagerOptions = {}) {
  const [isLoading, setIsLoading] = useState(initialState);
  const [timeoutReached, setTimeoutReached] = useState(false);
  
  // Reset timeout reached state when loading state changes
  useEffect(() => {
    if (!isLoading) {
      setTimeoutReached(false);
    }
  }, [isLoading]);
  
  // Set up timeout to prevent stuck loading states
  useEffect(() => {
    if (!isLoading || !timeout) return;
    
    const timer = setTimeout(() => {
      if (isLoading) {
        setTimeoutReached(true);
        setIsLoading(false);
        
        if (onTimeout) {
          onTimeout();
        }
      }
    }, timeout);
    
    return () => clearTimeout(timer);
  }, [isLoading, timeout, onTimeout]);
  
  // Convenient start/stop loading functions
  const startLoading = useCallback(() => {
    setIsLoading(true);
    setTimeoutReached(false);
  }, []);
  
  const stopLoading = useCallback(() => {
    setIsLoading(false);
  }, []);
  
  return {
    isLoading,
    timeoutReached,
    startLoading,
    stopLoading,
    setIsLoading
  };
}
