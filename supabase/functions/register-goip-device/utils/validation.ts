
import { DeviceRegistrationRequest } from "../types/index.ts";

// Validates the request data for registration
export function validateRegistrationRequest(
  requestData: DeviceRegistrationRequest
): { valid: boolean; missingFields?: string[]; message?: string } {
  const { userId, deviceName, ipAddress } = requestData;
  
  if (!userId || !deviceName || !ipAddress) {
    const missingFields = [];
    if (!userId) missingFields.push("userId");
    if (!deviceName) missingFields.push("deviceName");
    if (!ipAddress) missingFields.push("ipAddress");
    
    return {
      valid: false,
      missingFields,
      message: "Missing required fields: " + missingFields.join(", ")
    };
  }
  
  return { valid: true };
}

// Validates if the authenticated user is the one making the request
export function validateUserPermission(
  authenticatedUserId: string, 
  requestUserId: string
): { valid: boolean; message?: string } {
  if (requestUserId !== authenticatedUserId) {
    return {
      valid: false,
      message: "You don't have permission to register devices for other users"
    };
  }
  
  return { valid: true };
}
