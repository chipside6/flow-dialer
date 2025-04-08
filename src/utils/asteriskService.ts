
// Re-export all asterisk services from the new modular structure
// This file is maintained for backward compatibility

import { 
  asteriskService, 
  asteriskConfig, 
  ASTERISK_API_URL, 
  ASTERISK_API_USERNAME, 
  ASTERISK_API_PASSWORD 
} from './asterisk';

export { 
  asteriskService, 
  asteriskConfig, 
  ASTERISK_API_URL, 
  ASTERISK_API_USERNAME, 
  ASTERISK_API_PASSWORD 
};
