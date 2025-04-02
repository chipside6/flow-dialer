
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logSupabaseOperation, OperationType, isAuthError } from "@/utils/supabaseDebug";
import { FetchCampaignsParams } from "./types";
import { useTransformCampaigns } from "./useTransformCampaigns";

/**
 * Hook for fetching campaigns from Supabase
 */
export const useFetchCampaigns = () => {
  const { transformCampaignData } = useTransformCampaigns();

  const fetchCampaigns = useCallback(async ({ user, isAuthenticated }: FetchCampaignsParams) => {
    // If no user is logged in, return empty array
    if (!user || !isAuthenticated) {
      console.log("No authenticated user, returning empty campaigns array");
      logSupabaseOperation({
        operation: OperationType.READ,
        table: "campaigns",
        user_id: null,
        auth_status: "UNAUTHENTICATED",
        success: true,
        data: []
      });
      
      return { data: [], error: null };
    }

    console.log("Fetching campaigns for user:", user.id);
    
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        logSupabaseOperation({
          operation: OperationType.READ,
          table: "campaigns",
          user_id: user.id,
          auth_status: "AUTHENTICATED",
          success: false,
          error
        });
        return { data: [], error };
      }
      
      // Log successful operation
      logSupabaseOperation({
        operation: OperationType.READ,
        table: "campaigns",
        user_id: user.id,
        auth_status: "AUTHENTICATED",
        success: true,
        data: data
      });

      // Transform data to match the Campaign interface
      const transformedData = transformCampaignData(data);
      console.log("Campaigns fetched:", transformedData);
      
      return { data: transformedData, error: null };
    } catch (error: any) {
      console.error('Error fetching campaigns:', error.message);
      const authIssue = isAuthError(error);
      
      return { 
        data: [], 
        error,
        isAuthError: authIssue
      };
    }
  }, []);

  return { fetchCampaigns };
};
