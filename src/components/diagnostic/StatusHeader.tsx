
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { DatabaseIcon } from 'lucide-react';
import { CardTitle } from '@/components/ui/card';

interface StatusHeaderProps {
  isAuthenticated: boolean;
  user: any;
  errorCount: number;
}

export const StatusHeader: React.FC<StatusHeaderProps> = ({ 
  isAuthenticated, 
  user, 
  errorCount 
}) => {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <DatabaseIcon className="h-5 w-5" />
        <CardTitle>Supabase Diagnostic</CardTitle>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={isAuthenticated ? "default" : "destructive"}>
          {isAuthenticated ? "Authenticated" : "Not Authenticated"}
        </Badge>
        {isAuthenticated && user && (
          <Badge variant="outline">{user.id.substring(0, 8)}...</Badge>
        )}
        {errorCount > 0 && (
          <Badge variant="destructive">{errorCount} Errors</Badge>
        )}
      </div>
    </div>
  );
};
