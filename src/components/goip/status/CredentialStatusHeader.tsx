
import React from 'react';
import { GoipStatusBadge } from '../GoipStatusBadge';
import { ConfigSyncButton } from '../ConfigSyncButton';

interface CredentialStatusHeaderProps {
  userId: string;
  hasCredentials: boolean;
}

export const CredentialStatusHeader: React.FC<CredentialStatusHeaderProps> = ({ 
  userId, 
  hasCredentials 
}) => {
  if (!hasCredentials) {
    return null;
  }

  return (
    <div className="flex flex-col md:flex-row gap-2 md:items-center">
      <GoipStatusBadge userId={userId} portNumber={1} />
      <ConfigSyncButton userId={userId} />
    </div>
  );
};
