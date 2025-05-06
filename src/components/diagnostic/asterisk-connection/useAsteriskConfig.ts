
import { useState, useEffect } from "react";
import { getConfigFromStorage, saveConfigToStorage, ASTERISK_SERVER_IP } from "@/utils/asterisk/config";
import { useToast } from "@/components/ui/use-toast";

export const useAsteriskConfig = () => {
  const { toast } = useToast();
  const [currentConfig, setCurrentConfig] = useState(() => {
    // Always use the hardcoded values
    const config = {
      apiUrl: `http://${ASTERISK_SERVER_IP}:8088/ari/`,
      username: 'admin',
      password: 'admin',
      serverIp: ASTERISK_SERVER_IP
    };
    
    // Save to storage to ensure consistency
    saveConfigToStorage(config);
    
    return config;
  });

  // Refresh config when component mounts
  useEffect(() => {
    loadCurrentConfig();
  }, []);

  const loadCurrentConfig = () => {
    // Always use the hardcoded values
    const config = {
      apiUrl: `http://${ASTERISK_SERVER_IP}:8088/ari/`,
      username: 'admin',
      password: 'admin',
      serverIp: ASTERISK_SERVER_IP
    };
    
    setCurrentConfig(config);
    saveConfigToStorage(config);
  };

  const handleRefreshConfig = () => {
    loadCurrentConfig();
    toast({
      title: "Configuration Refreshed",
      description: "Using hardcoded configuration for 192.168.0.197."
    });
  };

  return {
    currentConfig,
    setCurrentConfig,
    loadCurrentConfig,
    handleRefreshConfig
  };
};
