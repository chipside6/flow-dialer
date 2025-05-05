import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Server, AlertCircle, CheckCircle, RefreshCw, Wifi, Database } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { getConfigFromStorage } from '@/utils/asterisk/config';
import { asteriskService } from '@/utils/asteriskService';
import { supabase } from '@/integrations/supabase/client';

export const AsteriskDiagnosticPanel = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{
    supabaseConnection: boolean;
    edgeFunctionAccess: boolean;
    asteriskConnection: boolean;
    databaseAccess: boolean;
    messages: string[];
  }>({
    supabaseConnection: false,
    edgeFunctionAccess: false,
    asteriskConnection: false,
    databaseAccess: false,
    messages: [],
  });

  const runDiagnostics = async () => {
    setIsLoading(true);
    setResults(prev => ({ ...prev, messages: [] }));
    
    const config = getConfigFromStorage();
    const messages: string[] = [];
    let supabaseConnection = false;
    let edgeFunctionAccess = false;
    let asteriskConnection = false;
    let databaseAccess = false;
    
    try {
      // Test 1: Supabase connection
      messages.push("Testing Supabase connection...");
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        messages.push(`⚠️ Supabase session error: ${sessionError.message}`);
      } else if (sessionData?.session) {
        supabaseConnection = true;
        messages.push("✅ Supabase connection successful");
      } else {
        messages.push("⚠️ No active Supabase session found");
      }
      
      // Test 2: Edge function access
      messages.push("Testing edge function access...");
      try {
        const { success, message } = await asteriskService.testAsteriskConnection('10.0.2.15');
        edgeFunctionAccess = true;
        messages.push(`✅ Edge function called successfully: ${message}`);
      } catch (error) {
        messages.push(`⚠️ Edge function access error: ${error instanceof Error ? error.message : String(error)}`);
      }
      
      // Test 3: Asterisk connection
      messages.push("Testing Asterisk server connection...");
      const connectionTest = await asteriskService.testAsteriskConnection('192.168.0.197');
      if (connectionTest.success) {
        asteriskConnection = true;
        messages.push(`✅ Asterisk server connection successful: ${connectionTest.message}`);
      } else {
        messages.push(`⚠️ Asterisk server connection failed: ${connectionTest.message}`);
        
        // Add more details
        messages.push(`   Server IP: 192.168.0.197`);
        messages.push(`   API URL: ${config.apiUrl || 'Not configured'}`);
      }
      
      // Test 4: Database access
      messages.push("Testing database access...");
      const { data: userTrunks, error: trunksError } = await supabase
        .from('user_trunks')
        .select('count')
        .limit(1);
        
      if (trunksError) {
        messages.push(`⚠️ Database access error: ${trunksError.message}`);
      } else {
        databaseAccess = true;
        messages.push("✅ Database access successful");
      }
      
      // Final summary
      if (supabaseConnection && edgeFunctionAccess && asteriskConnection && databaseAccess) {
        messages.push("🎉 All diagnostics passed successfully!");
        
        toast({
          title: "Diagnostics Complete",
          description: "All systems are operational",
          variant: "default"
        });
      } else {
        messages.push("⚠️ Some diagnostics failed. See details above.");
        
        toast({
          title: "Diagnostics Complete",
          description: "Some checks failed. See the diagnostic panel for details.",
          variant: "destructive"
        });
      }
    } catch (error) {
      messages.push(`Error running diagnostics: ${error instanceof Error ? error.message : String(error)}`);
      
      toast({
        title: "Diagnostic Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setResults({
        supabaseConnection,
        edgeFunctionAccess,
        asteriskConnection,
        databaseAccess,
        messages
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          Asterisk Diagnostic Tools
        </CardTitle>
        <CardDescription>
          Troubleshooting utilities for Asterisk integration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className={`p-3 rounded-md border text-center ${
            results.supabaseConnection 
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-gray-50 border-gray-200 text-gray-500"
          }`}>
            <Database className={`h-5 w-5 mx-auto mb-1 ${
              results.supabaseConnection ? "text-green-600" : "text-gray-400" 
            }`} />
            <div className="text-xs font-medium">Supabase</div>
          </div>
          <div className={`p-3 rounded-md border text-center ${
            results.edgeFunctionAccess
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-gray-50 border-gray-200 text-gray-500"
          }`}>
            <svg className={`h-5 w-5 mx-auto mb-1 ${
              results.edgeFunctionAccess ? "text-green-600" : "text-gray-400"
            }`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <div className="text-xs font-medium">Edge Functions</div>
          </div>
          <div className={`p-3 rounded-md border text-center ${
            results.asteriskConnection
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-gray-50 border-gray-200 text-gray-500"
          }`}>
            <Server className={`h-5 w-5 mx-auto mb-1 ${
              results.asteriskConnection ? "text-green-600" : "text-gray-400"
            }`} />
            <div className="text-xs font-medium">Asterisk</div>
          </div>
          <div className={`p-3 rounded-md border text-center ${
            results.databaseAccess
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-gray-50 border-gray-200 text-gray-500"
          }`}>
            <Database className={`h-5 w-5 mx-auto mb-1 ${
              results.databaseAccess ? "text-green-600" : "text-gray-400"
            }`} />
            <div className="text-xs font-medium">Database</div>
          </div>
        </div>
        
        {results.messages.length > 0 && (
          <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-md h-60 overflow-y-auto">
            <div className="font-mono text-xs space-y-1">
              {results.messages.map((msg, idx) => (
                <div key={idx} className="whitespace-pre-wrap">{msg}</div>
              ))}
            </div>
          </div>
        )}
        
        <Alert variant="default" className="bg-blue-50 text-blue-800 border-blue-200">
          <Wifi className="h-4 w-4" />
          <AlertTitle>Asterisk Server Environment</AlertTitle>
          <AlertDescription className="text-sm">
            <p>Your server is configured at IP address <strong>192.168.0.197</strong>.</p>
            <p className="mt-1">Make sure your GoIP device and Asterisk server can communicate on the same network.</p>
          </AlertDescription>
        </Alert>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={runDiagnostics} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Running Diagnostics...
            </>
          ) : (
            "Run Diagnostics"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
