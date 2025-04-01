
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function ConnectionInfo() {
  // Check environment variables
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Connection Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-1">Environment Variables</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold">VITE_SUPABASE_URL</p>
              <p className="text-sm text-muted-foreground">
                {supabaseUrl ? (
                  <span className="text-green-600">Set</span>
                ) : (
                  <span className="text-red-600">Not set</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold">VITE_SUPABASE_ANON_KEY</p>
              <p className="text-sm text-muted-foreground">
                {supabaseKey ? (
                  <span className="text-green-600">Set</span>
                ) : (
                  <span className="text-red-600">Not set</span>
                )}
              </p>
            </div>
          </div>
        </div>
        
        <Alert>
          <AlertDescription>
            <p className="text-sm">
              If environment variables are missing, the application will use fallback values for development purposes.
              In production, make sure to properly set these environment variables.
            </p>
          </AlertDescription>
        </Alert>
        
        <div>
          <h3 className="text-sm font-medium mb-1">Project Information</h3>
          <p className="text-sm text-muted-foreground">
            Project ID: grhvoclalziyjbjlhpml
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
