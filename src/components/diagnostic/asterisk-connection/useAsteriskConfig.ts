
import { useState, useEffect } from "react";
import { getConfigFromStorage, saveConfigToStorage } from "@/utils/asterisk/config";
import { useToast } from "@/components/ui/use-toast";

export const useAsteriskConfig = () => {
  const { toast } = useToast();
  const [currentConfig, setCurrentConfig] = useState(() => {
    const config = getConfigFromStorage();
    
    // If API URL is empty or invalid, set a default value with the updated IP
    if (!config.apiUrl || !config.apiUrl.includes('://')) {
      config.apiUrl = 'http://192.168.0.197:8088/ari/';
      saveConfigToStorage(config);
    }
    
    // Ensure server IP is set to our specified IP
    if (!config.serverIp) {
      config.serverIp = '192.168.0.197';
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
    
    // Set default if empty using the specified IP
    if (!config.apiUrl) {
      config.apiUrl = 'http://192.168.0.197:8088/ari/';
      saveConfigToStorage(config);
    }
    
    // Ensure server IP is always set
    if (!config.serverIp) {
      config.serverIp = '192.168.0.197';
      saveConfigToStorage(config);
    }
    
    // Update old IP if found
    if (config.serverIp === '10.0.2.15') {
      config.serverIp = '192.168.0.197';
      
      // Also update API URL if it contains the old IP
      if (config.apiUrl && config.apiUrl.includes('10.0.2.15')) {
        config.apiUrl = config.apiUrl.replace('10.0.2.15', '192.168.0.197');
      }
      
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
