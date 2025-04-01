
import React from 'react';
import { Button } from '@/components/ui/button';
import { RotateCw, Database, Info } from 'lucide-react';
import { clearDebugHistory } from '@/utils/supabaseDebug';
import { toast } from '@/components/ui/use-toast';

interface DiagnosticActionsProps {
  onRefresh?: () => void;
}

export function DiagnosticActions({ onRefresh }: DiagnosticActionsProps) {
  const handleClearLogs = () => {
    clearDebugHistory();
    toast({
      title: "Debug logs cleared",
      description: "Operation history has been reset",
    });
  };
  
  const handleCheckEnv = () => {
    // Check for environment variables
    const envVars = {
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || null,
      VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? '(set)' : null,
    };
    
    console.table(envVars);
    
    toast({
      title: "Environment variables",
      description: `VITE_SUPABASE_URL: ${envVars.VITE_SUPABASE_URL ? 'Set' : 'Not set'}, VITE_SUPABASE_ANON_KEY: ${envVars.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Not set'}`,
    });
  };
  
  return (
    <div className="flex flex-wrap gap-2">
      <Button 
        variant="outline" 
        size="sm"
        onClick={onRefresh}
      >
        <RotateCw className="h-4 w-4 mr-2" />
        Refresh
      </Button>
      
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleClearLogs}
      >
        <Database className="h-4 w-4 mr-2" />
        Clear Logs
      </Button>
      
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleCheckEnv}
      >
        <Info className="h-4 w-4 mr-2" />
        Check Env
      </Button>
    </div>
  );
}
