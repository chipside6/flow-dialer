import React, { useState, useEffect } from "react";
import EnvironmentSetup from "./EnvironmentSetup";
import ProviderConfiguration from "./ProviderConfiguration";
import ConnectionStatusAlerts from "./ConnectionStatusAlerts";
import ActionButtons from "./ActionButtons";
import { toast } from "@/components/ui/use-toast";
import { asteriskService } from "@/utils/asterisk";

const SipConfigurationContainer = () => {
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
  const [isConnected, setIsConnected] = useState(false);
  const [isEnvironmentSaved, setIsEnvironmentSaved] = useState(false);
  const [isReloading, setIsReloading] = useState({ pjsip: false, extensions: false });
  const [isHostedEnvironment, setIsHostedEnvironment] = useState(false);

  // Check if we're in a hosted environment (Lovable)
  useEffect(() => {
    const isLovableHosted = window.location.hostname.includes('lovableproject.com');
    setIsHostedEnvironment(isLovableHosted);
    
    // If we're in a hosted environment, we'll auto-save the environment 
    // after 2 seconds to make the experience smoother
    if (isLovableHosted && !isEnvironmentSaved) {
      const timer = setTimeout(() => {
        saveEnvironmentVariables();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, []);

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
          setIsConnected(true);
          toast({
            title: "Connection Successful",
            description: result.message || "Successfully connected to Asterisk server",
          });
        } else {
          setConnectionTested(true);
          setIsConnected(false);
          toast({
            title: "Connection Note",
            description: result.message || "Could not verify Asterisk server. You can still save your configuration.",
            variant: "default"
          });
        }
      } catch (error) {
        console.error("Error testing connection:", error);
        setConnectionTested(true);
        setIsConnected(false);
      }
    };
    
    // Only run on first load
    if (!connectionTested) {
      testInitialConnection();
    }
  }, [apiUrl, username, password, connectionTested]);

  const saveEnvironmentVariables = () => {
    // In a hosted environment like Lovable, this effectively saves the state
    // which will be used throughout the application
    setIsEnvironmentSaved(true);
    toast({
      title: "Environment Saved",
      description: "Your Asterisk configuration has been saved.",
    });
  };

  const retestConnection = async () => {
    setConnectionTested(false);
    // This will trigger the useEffect to run the test again
  };

  const reloadPjsip = async () => {
    setIsReloading(prev => ({ ...prev, pjsip: true }));
    try {
      const result = await asteriskService.reloadPjsip({
        apiUrl,
        username,
        password
      });
      
      if (result.success) {
        toast({
          title: "PJSIP Reloaded",
          description: "Successfully reloaded PJSIP module",
        });
      } else {
        toast({
          title: "Reload Failed",
          description: result.message || "Failed to reload PJSIP. Please check your Asterisk server.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error reloading PJSIP:", error);
      toast({
        title: "Reload Error",
        description: "An error occurred while reloading PJSIP",
        variant: "destructive"
      });
    } finally {
      setIsReloading(prev => ({ ...prev, pjsip: false }));
    }
  };

  const reloadExtensions = async () => {
    setIsReloading(prev => ({ ...prev, extensions: true }));
    try {
      const result = await asteriskService.reloadExtensions({
        apiUrl,
        username,
        password
      });
      
      if (result.success) {
        toast({
          title: "Extensions Reloaded",
          description: "Successfully reloaded Asterisk extensions",
        });
      } else {
        toast({
          title: "Reload Failed",
          description: result.message || "Failed to reload extensions. Please check your Asterisk server.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error reloading extensions:", error);
      toast({
        title: "Reload Error",
        description: "An error occurred while reloading extensions",
        variant: "destructive"
      });
    } finally {
      setIsReloading(prev => ({ ...prev, extensions: false }));
    }
  };

  return (
    <div className="space-y-6">
      <ConnectionStatusAlerts 
        isEnvironmentSaved={isEnvironmentSaved}
        connectionTested={connectionTested}
        isConnected={isConnected}
        isHostedEnvironment={isHostedEnvironment}
      />

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

      <ActionButtons 
        retestConnection={retestConnection}
        reloadPjsip={reloadPjsip}
        reloadExtensions={reloadExtensions}
        saveEnvironmentVariables={saveEnvironmentVariables}
        isReloading={isReloading}
        isConnected={isConnected}
        isHostedEnvironment={isHostedEnvironment}
      />
    </div>
  );
};

export default SipConfigurationContainer;
