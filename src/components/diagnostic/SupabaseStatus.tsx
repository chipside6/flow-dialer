
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusHeader } from './StatusHeader';
import { OperationsList } from './OperationsList';
import { getRecentOperations } from '@/utils/supabaseDebug';

export function SupabaseStatus() {
  const [sessionStatus, setSessionStatus] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking');
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [authAvailable, setAuthAvailable] = useState<boolean>(false);
  const [storageAvailable, setStorageAvailable] = useState<boolean>(false);
  const [databaseAvailable, setDatabaseAvailable] = useState<boolean>(false);
  
  useEffect(() => {
    checkSupabaseStatus();
  }, []);
  
  async function checkSupabaseStatus() {
    try {
      // Check if the Supabase client is properly initialized
      console.log('Checking Supabase client:', !!supabase);
      
      // Check auth functionality
      setAuthAvailable(!!supabase?.auth);
      
      // Check if session works
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          setSessionError(error.message);
          setSessionStatus('unauthenticated');
        } else {
          setSessionStatus(data.session ? 'authenticated' : 'unauthenticated');
        }
      } catch (e) {
        setSessionError(e instanceof Error ? e.message : 'Unknown error checking session');
        setSessionStatus('unauthenticated');
      }
      
      // Check database functionality
      try {
        const { data, error } = await supabase.from('profiles').select('count').limit(1);
        setDatabaseAvailable(!error);
      } catch {
        setDatabaseAvailable(false);
      }
      
      // Check storage functionality
      setStorageAvailable(!!supabase?.storage);
      
    } catch (error) {
      console.error('Error checking Supabase status:', error);
    }
  }
  
  return (
    <div className="space-y-6">
      <StatusHeader 
        title="Supabase Connection" 
        status={authAvailable && databaseAvailable ? 'online' : 'error'} 
      />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Authentication</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {sessionStatus === 'authenticated' ? 'Active' : 'Inactive'}
              </div>
              <div className={`h-4 w-4 rounded-full ${authAvailable ? 'bg-green-500' : 'bg-red-500'}`} />
            </div>
            {sessionError && (
              <p className="text-xs text-muted-foreground mt-2 text-red-500">{sessionError}</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Database</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {databaseAvailable ? 'Connected' : 'Disconnected'}
              </div>
              <div className={`h-4 w-4 rounded-full ${databaseAvailable ? 'bg-green-500' : 'bg-red-500'}`} />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Storage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {storageAvailable ? 'Available' : 'Unavailable'}
              </div>
              <div className={`h-4 w-4 rounded-full ${storageAvailable ? 'bg-green-500' : 'bg-red-500'}`} />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {!authAvailable || !databaseAvailable || !storageAvailable ? (
        <Alert variant="warning">
          <AlertTitle>Supabase Connection Issues</AlertTitle>
          <AlertDescription>
            Some Supabase services are not available. This could be due to missing environment variables 
            or network connectivity issues.
          </AlertDescription>
        </Alert>
      ) : null}
      
      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">Recent Operations</h3>
        <OperationsList operations={getRecentOperations()} />
      </div>
    </div>
  );
}
