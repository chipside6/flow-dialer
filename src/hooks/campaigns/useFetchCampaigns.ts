
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logSupabaseOperation, OperationType, isAuthError } from "@/utils/supabaseDebug";
import { FetchCampaignsParams } from "./types";
import { useTransformCampaigns } from "./useTransformCampaigns";
import { User } from "@/contexts/auth/types"; // Import our own User type

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
      // Set a timeout for the fetch operation
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), 10000); // Increased timeout from 5s to 10s
      
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('user_id', user.id)
        .abortSignal(abortController.signal);
      
      // Clear timeout
      clearTimeout(timeoutId);

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
      const transformedData = transformCampaignData(data || []);
      console.log("Campaigns fetched:", transformedData);
      
      return { data: transformedData, error: null };
    } catch (error: any) {
      console.error('Error fetching campaigns:', error.message);
      
      // Check if this is an AbortError (timeout)
      if (error.name === 'AbortError') {
        console.log('Fetch operation timed out');
        return { 
          data: [], 
          error: new Error('Connection timed out. Please check your internet connection and try again.'),
          isTimeoutError: true
        };
      }
      
      const authIssue = isAuthError(error);
      
      return { 
        data: [], 
        error,
        isAuthError: authIssue
      };
    }
  }, [transformCampaignData]);

  return { fetchCampaigns };
};
