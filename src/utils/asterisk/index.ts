
import { 
  ASTERISK_API_URL, 
  ASTERISK_API_USERNAME, 
  ASTERISK_API_PASSWORD,
  getConfigFromStorage,
  saveConfigToStorage,
  hasConfiguredEnvironment,
  isHostedEnvironment
} from './config';

import { connectionService } from './connectionService';
import { dialingService } from './dialingService';
import { securityUtils } from './utils/securityUtils';
import { goipService } from './services/goipService';

// Combined service for easier importing
export const asteriskService = {
  // Connection
  testConnection: connectionService.testConnection,
  reloadPjsip: connectionService.reloadPjsip,
  reloadExtensions: connectionService.reloadExtensions,
  
  // Dialing
  configureCallFlow: dialingService.configureCallFlow,
  getDialingStatus: dialingService.getDialingStatus,
  startDialing: dialingService.startDialing,
  stopDialing: dialingService.stopDialing,
  
  // GoIP Management
  goip: goipService
};

// Configuration exports
export const asteriskConfig = {
  getConfigFromStorage,
  saveConfigToStorage,
  hasConfiguredEnvironment,
  isHostedEnvironment
};

// Export security utils
export { securityUtils };

// Export configuration constants
export {
  ASTERISK_API_URL,
  ASTERISK_API_USERNAME,
  ASTERISK_API_PASSWORD
};
