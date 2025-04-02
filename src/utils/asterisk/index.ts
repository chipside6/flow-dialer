
import { 
  ASTERISK_API_URL, 
  ASTERISK_API_USERNAME, 
  ASTERISK_API_PASSWORD,
  isHostedEnvironment,
  hasConfiguredEnvironment,
  getConfigFromStorage,
  saveConfigToStorage
} from './config';
import { asteriskConfig, generateCompleteConfig } from './configGenerators';
import { connectionService } from './connectionService';
import { dialingService } from './dialingService';

// Export everything through a single service object to maintain the original API
export const asteriskService = {
  // Re-export connection methods
  testConnection: connectionService.testConnection,
  reloadPjsip: connectionService.reloadPjsip,
  reloadExtensions: connectionService.reloadExtensions,
  
  // Re-export dialing methods
  configureCallFlow: dialingService.configureCallFlow,
  getDialingStatus: dialingService.getDialingStatus,
  startDialing: dialingService.startDialing,
  stopDialing: dialingService.stopDialing,
  
  // Re-export config generators for backward compatibility
  generateSipTrunkConfig: asteriskConfig.generateSipTrunkConfig,
  generateCompleteConfig
};

// Re-export constants and the configuration object
export { 
  ASTERISK_API_URL, 
  ASTERISK_API_USERNAME, 
  ASTERISK_API_PASSWORD,
  isHostedEnvironment,
  hasConfiguredEnvironment,
  getConfigFromStorage,
  saveConfigToStorage,
  asteriskConfig
};
