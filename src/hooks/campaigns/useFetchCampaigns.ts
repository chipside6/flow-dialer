
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logSupabaseOperation, OperationType, isAuthError } from "@/utils/supabaseDebug";
import { FetchCampaignsParams, FetchCampaignsResult } from "./types";
import { useTransformCampaigns } from "./useTransformCampaigns";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

/**
 * Hook for fetching campaigns from Supabase
 */
export const useFetchCampaigns = () => {
  const { transformCampaignData } = useTransformCampaigns();
  const { isOnline } = useNetworkStatus();

  const fetchCampaigns = useCallback(async ({ user, isAuthenticated }: FetchCampaignsParams): Promise<FetchCampaignsResult> => {
    // If network is offline, return appropriate error immediately
    if (!isOnline) {
      console.log("Network is offline, cannot fetch campaigns");
      return { 
        data: [], 
        error: new Error('You appear to be offline. Please check your internet connection.'),
        isOfflineError: true,
        isTimeoutError: false,
        isAuthError: false
      };
    }
    
    // If no user is logged in, fetch all campaigns instead of returning empty array
    if (!user || !isAuthenticated) {
      console.log("No authenticated user, fetching all campaigns");
      
      try {
        // Set a timeout for the fetch operation - using a reasonable 5 second timeout
        const abortController = new AbortController();
        const timeoutId = setTimeout(() => abortController.abort(), 5000);
        
        const { data, error } = await supabase
          .from('campaigns')
          .select('*')
          .abortSignal(abortController.signal);
        
        // Clear timeout
        clearTimeout(timeoutId);
        
        if (error) {
          // Log operation failure
          logSupabaseOperation({
            operation: OperationType.READ,
            table: "campaigns",
            user_id: null,
            auth_status: "UNAUTHENTICATED",
            success: false,
            error
          });
          
          // Handle timeout error
          if (error.message?.includes('abort') || error.message?.includes('signal')) {
            return { 
              data: [], 
              error: new Error('Connection timed out. The server may be busy or there might be a network issue.'),
              isTimeoutError: true,
              isAuthError: false,
              isOfflineError: false
            };
          }
          
          return { 
            data: [], 
            error, 
            isTimeoutError: false,
            isAuthError: false,
            isOfflineError: false
          };
        }
        
        // Log successful operation
        logSupabaseOperation({
          operation: OperationType.READ,
          table: "campaigns",
          user_id: null,
          auth_status: "UNAUTHENTICATED",
          success: true,
          data: data
        });
        
        // Transform data to match the Campaign interface
        const transformedData = transformCampaignData(data);
        
        return { 
          data: transformedData, 
          error: null, 
          isTimeoutError: false,
          isAuthError: false,
          isOfflineError: false
        };
      } catch (error: any) {
        console.error('Error fetching campaigns:', error.message);
        
        // Check if this is an AbortError (timeout)
        if (error.name === 'AbortError' || error.message?.includes('abort')) {
          console.log('Fetch operation timed out');
          return { 
            data: [], 
            error: new Error('Connection timed out. The server may be busy or there might be a network issue.'),
            isTimeoutError: true,
            isAuthError: false,
            isOfflineError: false
          };
        }
        
        return { 
          data: [], 
          error,
          isAuthError: false,
          isTimeoutError: false,
          isOfflineError: false
        };
      }
    }

    console.log("Fetching campaigns for user:", user.id);
    
    try {
      // Use a reasonable 5 second timeout to improve user experience
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), 5000);
      
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('user_id', user.id)
        .abortSignal(abortController.signal);
      
      // Clear timeout
      clearTimeout(timeoutId);

      if (error) {
        // Log operation failure
        logSupabaseOperation({
          operation: OperationType.READ,
          table: "campaigns",
          user_id: user.id,
          auth_status: "AUTHENTICATED",
          success: false,
          error
        });
        
        // Check if this was a connection error
        if (error.message?.includes('abort') || error.message?.includes('signal')) {
          return { 
            data: [], 
            error: new Error('Connection timed out. The server may be busy or there might be a network issue.'),
            isTimeoutError: true,
            isAuthError: false,
            isOfflineError: false
          };
        }
        
        // Check if this is an auth error
        const authIssue = isAuthError(error);
        
        return { 
          data: [], 
          error, 
          isTimeoutError: false,
          isAuthError: authIssue,
          isOfflineError: false
        };
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
      
      return { 
        data: transformedData, 
        error: null, 
        isTimeoutError: false,
        isAuthError: false,
        isOfflineError: false
      };
    } catch (error: any) {
      console.error('Error fetching campaigns:', error.message);
      
      // Check if this is an AbortError (timeout)
      if (error.name === 'AbortError' || error.message?.includes('abort')) {
        console.log('Fetch operation timed out');
        return { 
          data: [], 
          error: new Error('Connection timed out. The server may be busy or there might be a network issue.'),
          isTimeoutError: true,
          isAuthError: false,
          isOfflineError: false
        };
      }
      
      const authIssue = isAuthError(error);
      
      return { 
        data: [], 
        error,
        isAuthError: authIssue,
        isTimeoutError: false,
        isOfflineError: false
      };
    }
  }, [transformCampaignData, isOnline]);

  return { fetchCampaigns };
};
