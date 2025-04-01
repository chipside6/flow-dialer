
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth";

export const ConnectionInfo: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Connection Information</CardTitle>
        <CardDescription>
          Details about your Supabase connection
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">Project URL</h3>
            <p className="font-mono text-sm text-muted-foreground break-all">
              {import.meta.env.VITE_SUPABASE_URL || 'https://grhvoclalziyjbjlhpml.supabase.co'}
            </p>
          </div>
          
          <div>
            <h3 className="font-medium">Auth Configuration</h3>
            <p className="font-mono text-sm text-muted-foreground">
              Storage: {typeof localStorage !== 'undefined' ? 'localStorage' : 'unavailable'}
            </p>
            <p className="font-mono text-sm text-muted-foreground">
              Persist Session: true
            </p>
            <p className="font-mono text-sm text-muted-foreground">
              Auto Refresh Token: true
            </p>
          </div>
          
          <div>
            <h3 className="font-medium">User Info</h3>
            {isAuthenticated && user ? (
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="font-medium">User ID:</p>
                  <p className="font-mono break-all text-muted-foreground">{user.id}</p>
                </div>
                <div>
                  <p className="font-medium">Email:</p>
                  <p className="font-mono break-all text-muted-foreground">{user.email}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Not authenticated</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
