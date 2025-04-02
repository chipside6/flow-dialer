
import React, { useState, useEffect } from "react";
import EnvironmentSetup from "./sip-config/EnvironmentSetup";
import ProviderConfiguration from "./sip-config/ProviderConfiguration";
import { toast } from "@/components/ui/use-toast";
import { asteriskService } from "@/utils/asteriskService";

const SipConfiguration = () => {
  // Initialize state with your Asterisk server credentials
  const [apiUrl, setApiUrl] = useState("http://127.0.0.1:8088/ari");
  const [username, setUsername] = useState("asterisk");
  const [password, setPassword] = useState("asterisk");
  const [providerName, setProviderName] = useState("my-sip-provider");
  const [host, setHost] = useState("sip.provider.com");
  const [port, setPort] = useState("5060");
  const [providerUsername, setProviderUsername] = useState("sipuser");
  const [providerPassword, setProviderPassword] = useState("sippassword");
  const [connectionTested, setConnectionTested] = useState(false);

  // Test connection on component mount
  useEffect(() => {
    const testInitialConnection = async () => {
      try {
        // Override the environment variables with our state values for testing
        const result = await asteriskService.testConnection({
          apiUrl,
          username,
          password
        });
        
        if (result.success) {
          setConnectionTested(true);
          toast({
            title: "Connection Successful",
            description: "Successfully connected to Asterisk server",
          });
        } else {
          toast({
            title: "Connection Failed",
            description: result.message || "Failed to connect to Asterisk server. Please check your credentials.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Error testing connection:", error);
      }
    };
    
    // Only run on first load
    if (!connectionTested) {
      testInitialConnection();
    }
  }, [apiUrl, username, password, connectionTested]);

  return (
    <div className="space-y-6">
      <EnvironmentSetup 
        apiUrl={apiUrl}
        username={username}
        password={password}
        setApiUrl={setApiUrl}
        setUsername={setUsername}
        setPassword={setPassword}
      />
      
      <ProviderConfiguration
        providerName={providerName}
        host={host}
        port={port}
        providerUsername={providerUsername}
        providerPassword={providerPassword}
        setProviderName={setProviderName}
        setHost={setHost}
        setPort={setPort}
        setProviderUsername={setProviderUsername}
        setProviderPassword={setProviderPassword}
      />
    </div>
  );
};

export default SipConfiguration;
