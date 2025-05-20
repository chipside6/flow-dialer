
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { CredentialGenerator } from './CredentialGenerator';
import { CredentialTable } from './CredentialTable';
import { EmptyCredentialsState } from './EmptyCredentialsState';
import { SetupInstructions } from './SetupInstructions';
import { DeleteCredentialDialog } from './dialogs/DeleteCredentialDialog';
import { CredentialStatusHeader } from './status/CredentialStatusHeader';
import { useCredentialManagement } from './hooks/useCredentialManagement';

interface CredentialSectionProps {
  userId: string | undefined;
}

export const CredentialSection = ({ userId }: CredentialSectionProps) => {
  const {
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
  } = useCredentialManagement(userId);

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
            
            <CredentialStatusHeader 
              userId={userId || ''} 
              hasCredentials={credentials.length > 0} 
            />
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
                onDeleteCredential={initiateDeleteCredential}
              />
              <SetupInstructions />
            </>
          ) : (
            <EmptyCredentialsState />
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <DeleteCredentialDialog 
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmDeleteCredential}
      />
    </>
  );
};
