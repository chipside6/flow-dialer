
import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/auth";
import EnvironmentSetup from "@/components/admin/sip-config/EnvironmentSetup";
import { AsteriskGuide } from "@/components/goip/AsteriskGuide";
import { SetupInstructions } from "@/components/goip/SetupInstructions";
import { 
  ASTERISK_API_URL, 
  ASTERISK_API_USERNAME, 
  ASTERISK_API_PASSWORD,
  getConfigFromStorage
} from "@/utils/asterisk/config";

const AsteriskConfigPage = () => {
  const { user, isAdmin } = useAuth();
  const [apiUrl, setApiUrl] = useState(ASTERISK_API_URL);
  const [username, setUsername] = useState(ASTERISK_API_USERNAME);
  const [password, setPassword] = useState(ASTERISK_API_PASSWORD);
  
  // Load saved configuration on initial render
  useEffect(() => {
    const savedConfig = getConfigFromStorage();
    
    if (savedConfig.apiUrl && apiUrl !== savedConfig.apiUrl) {
      setApiUrl(savedConfig.apiUrl);
    }
    
    if (savedConfig.username && username !== savedConfig.username) {
      setUsername(savedConfig.username);
    }
    
    if (savedConfig.password && password !== savedConfig.password) {
      setPassword(savedConfig.password);
    }
  }, []);

  return (
    <DashboardLayout>
      <div className="container py-6">
        <h1 className="text-3xl font-bold mb-4">Asterisk Server Configuration</h1>
        
        <Tabs defaultValue="configuration" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="configuration">Server Configuration</TabsTrigger>
            <TabsTrigger value="guide">Setup Guide</TabsTrigger>
          </TabsList>
          
          <TabsContent value="configuration" className="space-y-6">
            <EnvironmentSetup
              apiUrl={apiUrl}
              username={username}
              password={password}
              setApiUrl={setApiUrl}
              setUsername={setUsername}
              setPassword={setPassword}
            />
            
            <SetupInstructions />
          </TabsContent>
          
          <TabsContent value="guide">
            <AsteriskGuide />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AsteriskConfigPage;
