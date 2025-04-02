
import { configGenerators } from "./configGenerators";
import { connectionService } from "./connectionService";
import { dialingService } from "./dialingService";

// Create a centralized service for Asterisk functionality
export const asteriskService = {
  // Configuration generators
  generateSipConfig: configGenerators.generateSipConfig,
  generateDialplanConfig: configGenerators.generateDialplanConfig,
  
  // Connection services
  testConnection: connectionService.testConnection,
  validateConnection: connectionService.validateConnection,
  
  // Dialing services
  startDialing: dialingService.startDialing,
  stopDialing: dialingService.stopDialing,
  stopDialingCampaign: dialingService.stopDialingCampaign,
  getDialingStatus: dialingService.getDialingStatus
};
