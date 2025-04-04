
import { supabase } from "@/integrations/supabase/client";
import { logSupabaseOperation, OperationType } from "@/utils/supabaseDebug";
import { Campaign } from "@/types/campaign";
import { FetchCampaignsParams, FetchCampaignsResult } from "../types";

/**
 * Execute the fetch campaigns operation against Supabase
 */
export const executeFetchCampaigns = async (
  params: FetchCampaignsParams & { 
    abortController: AbortController,
    transformData: (data: any[]) => Campaign[] 
  }
): Promise<FetchCampaignsResult> => {
  const { user, isAuthenticated, abortController, transformData } = params;
  
  try {
    // If no user is logged in, fetch all campaigns
    if (!user || !isAuthenticated) {
      console.log("No authenticated user, fetching all campaigns");
      
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .abortSignal(abortController.signal);
      
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
      const transformedData = transformData(data);
      
      return { 
        data: transformedData, 
        error: null, 
        isTimeoutError: false,
        isAuthError: false,
        isOfflineError: false
      };
    }

    console.log("Fetching campaigns for user:", user.id);
    
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('user_id', user.id)
      .abortSignal(abortController.signal);
    
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
      const isAuthIssue = isAuthError(error);
      
      return { 
        data: [], 
        error, 
        isTimeoutError: false,
        isAuthError: isAuthIssue,
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
    const transformedData = transformData(data);
    
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
    
    const isAuthIssue = isAuthError(error);
    
    return { 
      data: [], 
      error,
      isAuthError: isAuthIssue,
      isTimeoutError: false,
      isOfflineError: false
    };
  }
};

/**
 * Check if an error is related to authentication
 */
export const isAuthError = (error: any): boolean => {
  // Check for common auth error patterns in the message
  if (!error) return false;
  
  const errorMessage = error.message?.toLowerCase() || '';
  return errorMessage.includes('auth') || 
         errorMessage.includes('unauthorized') || 
         errorMessage.includes('permission') ||
         errorMessage.includes('not allowed') ||
         error.code === 'PGRST301' || // Postgres unauthorized
         error.code === '42501'; // Postgres insufficient privilege
};
