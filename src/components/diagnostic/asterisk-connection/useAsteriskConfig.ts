
import { useState, useEffect, useCallback } from "react";
import { getConfigFromStorage, saveConfigToStorage, ASTERISK_SERVER_IP } from "@/utils/asterisk/config";
import { useToast } from "@/components/ui/use-toast";

export const useAsteriskConfig = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [currentConfig, setCurrentConfig] = useState({
    apiUrl: "",
    username: "",
    password: "",
    serverIp: ""
  });

  // Load config once when component mounts
  useEffect(() => {
    loadCurrentConfig();
  }, []); // Empty dependency array ensures this runs only once

  const loadCurrentConfig = useCallback(() => {
    setIsLoading(true);
    try {
      // Get config from storage
      const config = getConfigFromStorage();
      setCurrentConfig(config);
    } catch (error) {
      console.error("Error loading Asterisk configuration:", error);
      // Use default values if there's an error
      const defaultConfig = {
        apiUrl: `http://${ASTERISK_SERVER_IP}:8088/ari/`,
        username: 'admin',
        password: 'admin',
        serverIp: ASTERISK_SERVER_IP
      };
      setCurrentConfig(defaultConfig);
      saveConfigToStorage(defaultConfig);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleRefreshConfig = useCallback(() => {
    loadCurrentConfig();
    toast({
      title: "Configuration Refreshed",
      description: `Using configuration for ${ASTERISK_SERVER_IP}.`
    });
  }, [toast]);

  const updateConfig = useCallback((newConfig) => {
    setCurrentConfig(newConfig);
    saveConfigToStorage(newConfig);
  }, []);

  return {
    currentConfig,
    isLoading,
    setCurrentConfig: updateConfig,
    loadCurrentConfig,
    handleRefreshConfig
  };
};
