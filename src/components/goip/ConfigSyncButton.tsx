
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCw, Server } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { getSupabaseUrl } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { clearSession } from '@/services/auth/session';
import { withSessionRefresh } from '@/utils/sessionRefresher';

interface ConfigSyncButtonProps {
  userId: string;
  operation?: 'reload' | 'sync_user' | 'sync_all';
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const ConfigSyncButton = ({ 
  userId, 
  operation = 'sync_user',
  variant = 'default',
  size = 'default'
}: ConfigSyncButtonProps) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleSync = async () => {
    if (!userId) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to sync configurations.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSyncing(true);
    
    try {
      // Use the withSessionRefresh utility to ensure we have a valid session
      await withSessionRefresh(async () => {
        // Check if we have a valid session first
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !sessionData.session) {
          throw new Error(sessionError?.message || "No active session found");
        }

        // Get the access token from the session
        const accessToken = sessionData.session.access_token;
        
        // Get the Supabase URL
        const supabaseUrl = getSupabaseUrl();
        
        if (!supabaseUrl) {
          throw new Error('Could not determine Supabase URL');
        }
        
        console.log('Making request to sync config with URL:', `${supabaseUrl}/functions/v1/sync-goip-config`);
        
        // Make the request to the edge function
        const response = await fetch(`${supabaseUrl}/functions/v1/sync-goip-config`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            userId,
            operation
          })
        });
        
        // Log the response status for debugging
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          // If we get a 401 or 403, it's likely an auth issue - redirect to login
          if (response.status === 401 || response.status === 403) {
            toast({
              title: "Session Expired",
              description: "Your session has expired. Please log in again.",
              variant: "destructive"
            });
            
            clearSession();
            navigate('/login', { replace: true });
            return;
          }
          
          // Try to get error message from response
          let errorMessage = `Error syncing configuration: ${response.status}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || errorMessage;
          } catch (e) {
            // If parsing fails, use status text
            errorMessage = `Error syncing configuration: ${response.statusText}`;
          }
          
          throw new Error(errorMessage);
        }
        
        // Parse the response and show appropriate message
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.message || "Unknown error occurred");
        }
        
        toast({
          title: "Configuration Synced",
          description: result.message || "Your GoIP configuration has been synced with the Asterisk server.",
        });
      });
    } catch (error) {
      console.error('Error syncing configuration:', error);
      
      // Show a user-friendly error message
      toast({
        title: "Error Syncing Configuration",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };
  
  return (
    <Button 
      variant={variant} 
      size={size}
      onClick={handleSync}
      disabled={isSyncing}
    >
      {isSyncing ? (
        <>
          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
          Syncing...
        </>
      ) : (
        <>
          <Server className="h-4 w-4 mr-2" />
          Sync Config
        </>
      )}
    </Button>
  );
};
