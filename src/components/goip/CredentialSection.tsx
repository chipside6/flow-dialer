
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
import { ConfigSyncButton } from './ConfigSyncButton';
import { GoipStatusBadge } from './GoipStatusBadge';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [credentialToDelete, setCredentialToDelete] = useState<string | null>(null);
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
      
      // Sync the new credentials with Asterisk
      const { data: session } = await supabase.auth.getSession();
      const accessToken = session.session?.access_token;
      
      if (accessToken) {
        try {
          await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-goip-config`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
              userId,
              operation: 'sync_user'
            })
          });
          
          // No need to handle the response as this is a background task
        } catch (syncError) {
          console.error('Error syncing with Asterisk:', syncError);
          // Don't fail the main operation if this secondary task fails
        }
      }
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
      
      // Sync the updated credential with Asterisk
      const { data: session } = await supabase.auth.getSession();
      const accessToken = session.session?.access_token;
      
      if (accessToken) {
        try {
          await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-goip-config`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
              userId,
              operation: 'sync_user'
            })
          });
        } catch (syncError) {
          console.error('Error syncing with Asterisk:', syncError);
        }
      }
    } catch (error: any) {
      console.error('Error regenerating credential:', error);
      toast({
        title: "Error regenerating credential",
        description: error.message || "Could not regenerate credential. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Delete credential
  const handleDeleteCredential = (id: string) => {
    setCredentialToDelete(id);
    setShowDeleteDialog(true);
  };

  // Confirm delete credential
  const confirmDeleteCredential = async () => {
    if (!credentialToDelete) return;
    
    try {
      const { error } = await supabase
        .from('user_trunks')
        .delete()
        .eq('id', credentialToDelete);
      
      if (error) throw error;
      
      // Refresh the credentials list
      await fetchCredentials();
      
      toast({
        title: "Credential deleted",
        description: "The SIP credential has been deleted.",
      });
      
      // Sync the changes with Asterisk
      const { data: session } = await supabase.auth.getSession();
      const accessToken = session.session?.access_token;
      
      if (accessToken && userId) {
        try {
          await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-goip-config`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
              userId,
              operation: 'sync_user'
            })
          });
        } catch (syncError) {
          console.error('Error syncing with Asterisk:', syncError);
        }
      }
    } catch (error: any) {
      console.error('Error deleting credential:', error);
      toast({
        title: "Error deleting credential",
        description: error.message || "Could not delete credential. Please try again.",
        variant: "destructive"
      });
    } finally {
      setShowDeleteDialog(false);
      setCredentialToDelete(null);
    }
  };

  return (
    <>
      <Card className="goip-setup-container">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
            <div>
              <CardTitle>Generate SIP Credentials</CardTitle>
              <CardDescription>
                Generate SIP credentials to connect your GoIP device to our Asterisk server
              </CardDescription>
            </div>
            
            {credentials.length > 0 && userId && (
              <div className="flex flex-col md:flex-row gap-2 md:items-center">
                <GoipStatusBadge userId={userId} portNumber={1} />
                <ConfigSyncButton userId={userId} />
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <CredentialGenerator 
            isGenerating={isGenerating} 
            onGenerate={generateCredentials} 
          />
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading your SIP credentials...</p>
            </div>
          ) : credentials.length > 0 ? (
            <>
              <CredentialTable 
                credentials={credentials} 
                isLoading={false} 
                onRegenerateCredential={handleRegenerateCredential}
                onDeleteCredential={handleDeleteCredential}
              />
              <SetupInstructions />
            </>
          ) : (
            <EmptyCredentialsState />
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete SIP Credential</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this SIP credential? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteCredential}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
