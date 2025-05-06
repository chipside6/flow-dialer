
import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AsteriskConnectionTest } from '@/components/diagnostic/AsteriskConnectionTest';
import { SimpleGoipRegisterForm } from '@/components/goip/SimpleGoipRegisterForm';
import { useAuth } from "@/contexts/auth";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Server, Phone, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';

const AsteriskConfigPageContent = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isAsteriskConnected, setIsAsteriskConnected] = useState(false);
  
  useEffect(() => {
    // Check if user_trunks table has device_ip column
    async function checkSchema() {
      if (!user) return;
      
      try {
        // First check if the user can access the user_trunks table
        const { data: tableTest, error: tableError } = await supabase
          .from('user_trunks')
          .select('id')
          .limit(1);
          
        if (tableError) {
          console.error('Error accessing user_trunks table:', tableError);
          toast({
            title: "Database Error",
            description: "Cannot access the user_trunks table. Please contact support.",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error checking schema:', err);
        setIsLoading(false);
      }
    }
    
    checkSchema();
  }, [user, toast]);

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="container py-6">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Admin Access Required</AlertTitle>
            <AlertDescription>
              This page is only accessible to administrators.
            </AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container py-6">
          <div className="flex flex-col items-center justify-center my-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading configuration...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Asterisk Configuration</h1>
            <p className="text-muted-foreground">
              Manage your Asterisk connection and GoIP devices
            </p>
          </div>
        </div>

        <Alert className="mb-6 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
          <Server className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertTitle className="text-blue-800 dark:text-blue-300">Setup Instructions</AlertTitle>
          <AlertDescription className="text-blue-700 dark:text-blue-400">
            First connect to your Asterisk server, then register your GoIP devices.
            Make sure your Asterisk server is online and accessible before proceeding.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="connection">
          <TabsList className="mb-4">
            <TabsTrigger value="connection">Asterisk Connection</TabsTrigger>
            <TabsTrigger value="goip">GoIP Device Registration</TabsTrigger>
          </TabsList>
          
          <TabsContent value="connection">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Asterisk API Connection Test
                </CardTitle>
                <CardDescription>
                  Test connection to your Asterisk server's REST Interface
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AsteriskConnectionTest onConnectionChange={setIsAsteriskConnected} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="goip">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  GoIP Device Registration
                </CardTitle>
                <CardDescription>
                  Register your GoIP devices to make outbound calls
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!isAsteriskConnected && (
                  <Alert variant="warning" className="mb-4 bg-amber-50 border-amber-200">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertTitle>Asterisk Connection Required</AlertTitle>
                    <AlertDescription>
                      Connect to your Asterisk server first before registering GoIP devices.
                      Switch to the "Asterisk Connection" tab to test your connection.
                    </AlertDescription>
                  </Alert>
                )}
                <SimpleGoipRegisterForm />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

const AsteriskConfigPage = () => {
  return (
    <ProtectedRoute requireAdmin={true}>
      <AsteriskConfigPageContent />
    </ProtectedRoute>
  );
};

export default AsteriskConfigPage;
