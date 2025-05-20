
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCredentialManagement } from './useCredentialManagement';
import { useSyncWithAsterisk } from './useSyncWithAsterisk';
import { supabase } from '@/integrations/supabase/client';

export function useCredentialSection(userId: string | undefined) {
  const {
    credentials,
    isLoading,
    isGenerating,
    generateCredentials,
    handleRegenerateCredential,
    fetchCredentials
  } = useCredentialManagement(userId);
  
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [credentialToDelete, setCredentialToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  const { syncWithAsterisk } = useSyncWithAsterisk();

  // Initiate delete credential process
  const initiateDeleteCredential = (id: string) => {
    setCredentialToDelete(id);
    setShowDeleteDialog(true);
  };

  // Confirm delete credential
  const confirmDeleteCredential = async () => {
    if (!credentialToDelete || !userId) return;
    
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
      
      // Sync with Asterisk
      await syncWithAsterisk(userId);
      
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

  return {
    credentials,
    isLoading,
    isGenerating,
    showDeleteDialog,
    credentialToDelete,
    generateCredentials,
    handleRegenerateCredential,
    initiateDeleteCredential,
    confirmDeleteCredential,
    setShowDeleteDialog
  };
}
