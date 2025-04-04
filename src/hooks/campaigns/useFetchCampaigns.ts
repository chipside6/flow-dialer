
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
    
    // Set a timeout for the fetch operation - using a reasonable 5 second timeout
    const { controller, clearTimeout } = createTimeoutController(5000);
    
    try {
      const result = await executeFetchCampaigns({
        ...params,
        abortController: controller,
        transformData: transformCampaignData
      });
      
      return result;
    } finally {
      // Clear timeout
      clearTimeout();
    }
  }, [transformCampaignData, isOnline, handleOfflineState, createTimeoutController]);

  return { fetchCampaigns };
};
