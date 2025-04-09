
import { useEffect, useRef } from 'react';

interface PollingOptions {
  enabled: boolean;
  interval: number;
}

/**
 * Hook for polling at specified intervals
 * @param callback Function to call at each interval
 * @param options Polling options
 */
export const usePollingInterval = (
  callback: () => void | Promise<void>,
  { enabled = true, interval = 5000 }: PollingOptions
) => {
  const savedCallback = useRef<typeof callback>(callback);

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval
  useEffect(() => {
    if (!enabled) return;

    const tick = async () => {
      await savedCallback.current();
    };

    const id = setInterval(tick, interval);
    
    // Run immediately on mount
    tick();
    
    return () => {
      clearInterval(id);
    };
  }, [enabled, interval]);
};
