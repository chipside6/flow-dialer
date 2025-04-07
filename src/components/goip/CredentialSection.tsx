
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { CredentialGenerator } from './CredentialGenerator';
import { CredentialTable } from './CredentialTable';
import { SetupInstructions } from './SetupInstructions';
import { EmptyCredentialsState } from './EmptyCredentialsState';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { z } from 'zod';
import { generateRandomPassword } from '@/utils/passwordGenerator';

// Schema for the trunk name form
const trunkNameSchema = z.object({
  trunkName: z.string().min(3, "Trunk name must be at least 3 characters").max(50, "Trunk name must be at most 50 characters")
});

// Interface for the SIP credential
interface SipCredential {
  id: string;
  port_number: number;
  sip_user: string;
  sip_pass: string;
  trunk_name: string;
  status: string;
}

interface CredentialSectionProps {
  userId: string | undefined;
}

export const CredentialSection = ({ userId }: CredentialSectionProps) => {
  const [credentials, setCredentials] = useState<SipCredential[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

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
  const generateCredentials = async (data: z.infer<typeof trunkNameSchema>) => {
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

  return (
    <Card className="goip-setup-container">
      <CardHeader>
        <CardTitle>Generate SIP Credentials</CardTitle>
        <CardDescription>
          Generate SIP credentials to connect your GoIP device to our Asterisk server
        </CardDescription>
      </CardHeader>
      <CardContent>
        <CredentialGenerator 
          isGenerating={isGenerating} 
          onGenerate={generateCredentials} 
        />
        
        {isLoading ? (
          <CredentialTable credentials={[]} isLoading={true} />
        ) : credentials.length > 0 ? (
          <>
            <CredentialTable credentials={credentials} isLoading={false} />
            <SetupInstructions />
          </>
        ) : (
          <EmptyCredentialsState />
        )}
      </CardContent>
    </Card>
  );
};
