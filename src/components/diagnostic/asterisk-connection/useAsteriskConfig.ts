
import { useState, useEffect } from "react";
import { getConfigFromStorage, saveConfigToStorage } from "@/utils/asterisk/config";
import { useToast } from "@/components/ui/use-toast";

export const useAsteriskConfig = () => {
  const { toast } = useToast();
  const [currentConfig, setCurrentConfig] = useState(() => {
    const config = getConfigFromStorage();
    
    // If API URL is empty or invalid, set a default value
    if (!config.apiUrl || !config.apiUrl.includes('://')) {
      config.apiUrl = 'http://10.0.2.15:8088/ari/';
      saveConfigToStorage(config);
    }
    
    return config;
  });

  // Refresh config when component mounts
  useEffect(() => {
    loadCurrentConfig();
  }, []);

  const loadCurrentConfig = () => {
    const config = getConfigFromStorage();
    
    // Ensure URL has proper format with protocol
    if (config.apiUrl && !config.apiUrl.includes('://')) {
      config.apiUrl = `http://${config.apiUrl}`;
      saveConfigToStorage(config);
    }
    
    // Set default if empty
    if (!config.apiUrl) {
      config.apiUrl = 'http://10.0.2.15:8088/ari/';
      saveConfigToStorage(config);
    }
    
    setCurrentConfig(config);
    console.log("Loaded Asterisk config:", {
      apiUrl: config.apiUrl,
      username: config.username,
      serverIp: config.serverIp
    });
  };

  const handleRefreshConfig = () => {
    loadCurrentConfig();
    toast({
      title: "Configuration Refreshed",
      description: "Asterisk connection details have been refreshed from storage."
    });
  };

  return {
    currentConfig,
    setCurrentConfig,
    loadCurrentConfig,
    handleRefreshConfig
  };
};
