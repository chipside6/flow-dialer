
import { useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { generateRandomPassword } from '@/utils/passwordGenerator';
import { toast } from 'sonner';

export interface SipUserCredential {
  id?: string;
  trunk_name: string;
  sip_user: string;
  sip_pass: string;
  port_number: number;
  status?: string;
}

export const useGoipSetup = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [credentials, setCredentials] = useState<SipUserCredential[]>([]);
  const { user } = useAuth();
  
  // Create four SIP trunk users
  const createSipUsers = async (trunkName: string) => {
    if (!user?.id) {
      toast.error('You must be logged in to create SIP users');
      return false;
    }
    
    setIsSubmitting(true);
    
    try {
      // Generate credentials for 4 ports
      const newCredentials: SipUserCredential[] = [];
      
      for (let portNumber = 1; portNumber <= 4; portNumber++) {
        const sipUser = `user_${user.id.substring(0, 8)}_port${portNumber}`;
        const sipPass = generateRandomPassword(10);
        
        // Create credential object
        newCredentials.push({
          trunk_name: trunkName,
          sip_user: sipUser,
          sip_pass: sipPass,
          port_number: portNumber,
        });
      }
      
      // Insert all 4 trunks into the database
      const { error } = await supabase.from('user_trunks').insert(
        newCredentials.map(cred => ({
          user_id: user.id,
          trunk_name: cred.trunk_name,
          sip_user: cred.sip_user,
          sip_pass: cred.sip_pass,
          port_number: cred.port_number,
          status: 'active'
        }))
      );
      
      if (error) {
        console.error('Error creating SIP users:', error);
        toast.error('Failed to create SIP users');
        return false;
      }
      
      // Set credentials for display
      setCredentials(newCredentials);
      toast.success('Successfully created SIP credentials for your GoIP');
      return true;
    } catch (error) {
      console.error('Error in createSipUsers:', error);
      toast.error('An unexpected error occurred');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Copy text to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success('Copied to clipboard'))
      .catch(() => toast.error('Failed to copy'));
  };
  
  return {
    isSubmitting,
    credentials,
    createSipUsers,
    copyToClipboard
  };
};
