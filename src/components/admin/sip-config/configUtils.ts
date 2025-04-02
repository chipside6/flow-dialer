import { generateSipTrunkConfig, generateDialplan } from "@/utils/asterisk/configGenerators";

// Function to generate configuration files for a SIP provider
export const generateConfigFiles = (provider: any) => {
  // Generate SIP trunk configuration
  const sipConfig = generateSipTrunkConfig(provider);
  
  // Generate dialplan configuration
  const dialplanConfig = generateDialplan(provider);
  
  return {
    sipConfig,
    dialplanConfig
  };
};

// Function to validate SIP provider configuration
export const validateSipConfig = (provider: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Check required fields
  if (!provider.name) errors.push("Provider name is required");
  if (!provider.host) errors.push("Host/IP is required");
  if (!provider.username) errors.push("Username is required");
  if (!provider.password) errors.push("Password is required");
  
  return {
    valid: errors.length === 0,
    errors
  };
};

// Function to format SIP provider data for display
export const formatProviderForDisplay = (provider: any) => {
  return {
    id: provider.id,
    name: provider.name,
    host: provider.host,
    port: provider.port || 5060,
    username: provider.username,
    // Mask password for security
    password: provider.password ? '••••••••' : '',
    status: provider.status || 'inactive',
    dateAdded: provider.dateAdded ? new Date(provider.dateAdded).toLocaleDateString() : 'Unknown'
  };
};
