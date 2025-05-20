
import React from 'react';

export const CredentialLoading: React.FC = () => {
  return (
    <div className="text-center py-8">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
      <p className="mt-2 text-muted-foreground">Loading your SIP credentials...</p>
    </div>
  );
};
