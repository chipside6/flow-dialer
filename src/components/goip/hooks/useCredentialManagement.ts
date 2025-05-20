
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { generateRandomPassword } from '@/utils/passwordGenerator';
import { useSyncWithAsterisk } from './useSyncWithAsterisk';

// Interface for the SIP credential
export interface SipCredential {
  id: string;
  port_number: number;
  sip_user: string;
  sip_pass: string;
  trunk_name: string;
  status: string;
}

export const useCredentialManagement = (userId: string | undefined) => {
  const [credentials, setCredentials] = useState<SipCredential[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { syncWithAsterisk } = useSyncWithAsterisk();

  // Fetch existing credentials when user loads the page
  useEffect(() => {
    if (userId) {
      fetchCredentials();
    }
  }, [userId]);

  // Fetch existing credentials from Supabase
  const fetchCredentials = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_trunks')
        .select('*')
        .eq('user_id', userId)
        .order('port_number');
      
      if (error) throw error;
      
      setCredentials(data || []);
    } catch (error: any) {
      console.error('Error fetching credentials:', error);
      toast({
        title: "Error fetching credentials",
        description: error.message || "Could not fetch your credentials. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Generate and save SIP credentials
  const generateCredentials = async (data: { trunkName: string }) => {
    if (!userId) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to generate SIP credentials.",
        variant: "destructive"
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // First, delete any existing credentials for this user
      const { error: deleteError } = await supabase
        .from('user_trunks')
        .delete()
        .eq('user_id', userId);
      
      if (deleteError) throw deleteError;
      
      // Generate new credentials for ports 1-4
      const newCredentials: Omit<SipCredential, 'id'>[] = [];
      
      for (let port = 1; port <= 4; port++) {
        const password = generateRandomPassword(10);
        newCredentials.push({
          port_number: port,
          sip_user: `user_${userId.substring(0, 8)}_port${port}`,
          sip_pass: password,
          trunk_name: data.trunkName,
          status: 'active',
        });
      }
      
      // Insert all new credentials
      const { data: insertedData, error: insertError } = await supabase
        .from('user_trunks')
        .insert(newCredentials.map(cred => ({
          ...cred,
          user_id: userId
        })))
        .select();
      
      if (insertError) throw insertError;
      
      setCredentials(insertedData || []);
      
      toast({
        title: "SIP credentials generated",
        description: "Your SIP credentials have been generated successfully.",
      });
      
      // Sync the new credentials with Asterisk
      await syncWithAsterisk(userId);
      
    } catch (error: any) {
      console.error('Error generating credentials:', error);
      toast({
        title: "Error generating credentials",
        description: error.message || "Could not generate your credentials. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Regenerate a single credential by port number
  const handleRegenerateCredential = async (portNumber: number) => {
    if (!userId) return;
    
    try {
      // Find the credential for this port
      const credential = credentials.find(c => c.port_number === portNumber);
      if (!credential) return;
      
      // Generate new password
      const newPassword = generateRandomPassword(10);
      
      // Update the credential
      const { error } = await supabase
        .from('user_trunks')
        .update({ sip_pass: newPassword })
        .eq('id', credential.id);
      
      if (error) throw error;
      
      // Refresh the credentials list
      await fetchCredentials();
      
      toast({
        title: "Credential regenerated",
        description: `New password for Port ${portNumber} has been generated.`,
      });
      
      // Sync with Asterisk
      await syncWithAsterisk(userId);
      
    } catch (error: any) {
      console.error('Error regenerating credential:', error);
      toast({
        title: "Error regenerating credential",
        description: error.message || "Could not regenerate credential. Please try again.",
        variant: "destructive"
      });
    }
  };

  return {
    credentials,
    isLoading,
    isGenerating,
    fetchCredentials,
    generateCredentials,
    handleRegenerateCredential,
  };
};
