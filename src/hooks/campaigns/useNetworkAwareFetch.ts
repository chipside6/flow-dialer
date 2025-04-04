
import { useCallback } from "react";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { FetchCampaignsParams, FetchCampaignsResult } from "./types";

/**
 * Hook providing network-aware fetch capabilities
 */
export const useNetworkAwareFetch = () => {
  const { isOnline } = useNetworkStatus();

  const createTimeoutController = (timeoutMs: number = 5000) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    return {
      controller,
      clearTimeout: () => clearTimeout(timeoutId)
    };
  };

  const handleOfflineState = useCallback((): FetchCampaignsResult => {
    console.log("Network is offline, cannot fetch campaigns");
    return { 
      data: [], 
      error: new Error('You appear to be offline. Please check your internet connection.'),
      isOfflineError: true,
      isTimeoutError: false,
      isAuthError: false
    };
  }, []);

  return {
    isOnline,
    createTimeoutController,
    handleOfflineState
  };
};
