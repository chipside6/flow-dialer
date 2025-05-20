
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

interface CredentialNoticeProps {
  onDismiss: () => void;
}

export const CredentialNotice: React.FC<CredentialNoticeProps> = ({ onDismiss }) => {
  return (
    <Alert className="mb-4" variant="default">
      <Sparkles className="h-4 w-4" />
      <AlertTitle>Automatic SIP Credentials</AlertTitle>
      <AlertDescription className="text-sm">
        SIP credentials are now automatically generated when you register a device. 
        You'll find them in the device details after registration.
        <Button 
          variant="link" 
          className="p-0 h-auto text-xs" 
          onClick={onDismiss}
        >
          Dismiss
        </Button>
      </AlertDescription>
    </Alert>
  );
};
