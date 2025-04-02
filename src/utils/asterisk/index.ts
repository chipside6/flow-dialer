
import * as configGeneratorsModule from "./configGenerators";
import * as connectionServiceModule from "./connectionService";
import { dialingService } from "./dialingService";

// Create a centralized service for Asterisk functionality
export const asteriskService = {
  // Configuration generators
  generateSipConfig: configGeneratorsModule.generateSipConfig || (() => ''),
  generateDialplanConfig: configGeneratorsModule.generateDialplanConfig || (() => ''),
  
  // Connection services
  testConnection: connectionServiceModule.testConnection || (() => Promise.resolve({ success: false, error: 'Not implemented' })),
  // Falling back to testConnection if validateConnection doesn't exist
  validateConnection: connectionServiceModule.validateConnection || connectionServiceModule.testConnection,
  
  // Add missing methods referenced in errors
  reloadPjsip: connectionServiceModule.reloadPjsip || (() => Promise.resolve({ success: false, message: 'Not implemented' })),
  reloadExtensions: connectionServiceModule.reloadExtensions || (() => Promise.resolve({ success: false, message: 'Not implemented' })),
  
  // Dialing services
  startDialing: dialingService.startDialing,
  stopDialing: dialingService.stopDialing,
  stopDialingCampaign: dialingService.stopDialingCampaign,
  getDialingStatus: dialingService.getDialingStatus
};
