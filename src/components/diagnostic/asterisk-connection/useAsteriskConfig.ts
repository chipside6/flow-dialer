
import { useState, useEffect } from "react";
import { getConfigFromStorage, saveConfigToStorage } from "@/utils/asterisk/config";
import { useToast } from "@/components/ui/use-toast";

export const useAsteriskConfig = () => {
  const { toast } = useToast();
  const [currentConfig, setCurrentConfig] = useState(() => {
    const config = getConfigFromStorage();
    // Ensure we're using the known working URL
    if (config.apiUrl !== 'http://10.0.2.15:8088/ari/') {
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
    // Ensure we're using the known working URL
    if (config.apiUrl !== 'http://10.0.2.15:8088/ari/') {
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
