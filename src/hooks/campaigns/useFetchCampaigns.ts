
import { useCallback } from "react";
import { useTransformCampaigns } from "./useTransformCampaigns";
import { useNetworkAwareFetch } from "./useNetworkAwareFetch";
import { executeFetchCampaigns } from "./utils/campaignFetchUtils";
import { FetchCampaignsParams, FetchCampaignsResult } from "./types";

/**
 * Hook for fetching campaigns from Supabase
 */
export const useFetchCampaigns = () => {
  const { transformCampaignData } = useTransformCampaigns();
  const { isOnline, createTimeoutController, handleOfflineState } = useNetworkAwareFetch();

  const fetchCampaigns = useCallback(async (params: FetchCampaignsParams): Promise<FetchCampaignsResult> => {
    // If network is offline, return appropriate error immediately
    if (!isOnline) {
      return handleOfflineState();
    }
    
    // Set a timeout for the fetch operation - reduced timeout for faster feedback
    const { controller, clearTimeout } = createTimeoutController(3000);
    
    try {
      const result = await executeFetchCampaigns({
        ...params,
        abortController: controller,
        transformData: transformCampaignData
      });
      
      return result;
    } catch (error: any) {
      console.error("Error in fetchCampaigns:", error);
      return {
        data: [],
        error: error instanceof Error ? error : new Error(String(error)),
        isTimeoutError: false,
        isAuthError: false,
        isOfflineError: false
      };
    } finally {
      // Clear timeout
      clearTimeout();
    }
  }, [transformCampaignData, isOnline, handleOfflineState, createTimeoutController]);

  return { fetchCampaigns };
};
