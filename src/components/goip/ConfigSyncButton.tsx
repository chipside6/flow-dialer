
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCw, Server } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { getSupabaseUrl } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { clearSession } from '@/services/auth/session';

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
      // Get fresh session to ensure we have valid tokens
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        toast({
          title: "Session Error",
          description: "Your session has expired. Please log in again.",
          variant: "destructive"
        });
        
        // Clear session and redirect to login
        clearSession();
        navigate('/login', { replace: true });
        return;
      }
      
      const accessToken = sessionData.session.access_token;
      
      // Get the Supabase URL from the utility function
      const supabaseUrl = getSupabaseUrl();
      
      if (!supabaseUrl) {
        throw new Error('Could not determine Supabase URL');
      }
      
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
      
      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = `Error syncing configuration: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          // If we can't parse JSON, use the status text
          errorMessage = `Error syncing configuration: ${response.statusText}`;
        }
        
        // Check if it's an auth error (401, 403)
        if (response.status === 401 || response.status === 403) {
          toast({
            title: "Authentication Error",
            description: "Your session has expired. Please log in again.",
            variant: "destructive"
          });
          
          // Clear session and redirect to login
          clearSession();
          navigate('/login', { replace: true });
          return;
        }
        
        throw new Error(errorMessage);
      }
      
      // Check content type
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.message || result.error || 'Unknown error syncing configuration');
        }
        
        toast({
          title: "Configuration Synced",
          description: result.message || "Your GoIP configuration has been synced with the Asterisk server.",
        });
      } else {
        // If we didn't get JSON back, it's an error
        const responseText = await response.text();
        console.error('Invalid response format:', responseText);
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Error syncing configuration:', error);
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
