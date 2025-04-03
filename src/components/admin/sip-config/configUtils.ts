
import { asteriskConfig } from "@/utils/asteriskService";

/**
 * Generates SIP configuration text with appropriate placeholders
 * and improved documentation for users
 */
export const generateSipConfig = (
  providerName: string,
  host: string,
  port: string,
  username: string,
  password: string
): string => {
  if (!providerName || !host) {
    throw new Error("Provider name and host are required for SIP configuration");
  }

  // Sanitize inputs to prevent Asterisk configuration errors
  const sanitizedName = providerName.replace(/[^a-zA-Z0-9_-]/g, "");
  
  // Generate SIP provider config with input validation and sanitization
  const sipConfig = asteriskConfig.generateSipTrunkConfig(
    sanitizedName,
    host,
    port || "5060", // Default to 5060 if not provided
    username,
    password
  );
  
  // Generate dialplan with placeholders and clear instructions
  const dialplan = asteriskConfig.generateDialplan(
    "example-campaign",
    "${GREETING_FILE}", // This is a placeholder that will be replaced
    "${TRANSFER_NUMBER}" // This is a placeholder that will be replaced
  );
  
  return `; Asterisk SIP Provider Configuration
; ----------------------------------------------
; Provider: ${sanitizedName}
; Host: ${host}
; This configuration should be placed in your pjsip.conf or sip.conf file

${sipConfig}

; Dialplan Configuration
; ----------------------------------------------
; This configuration should be placed in your extensions.conf file
; The following placeholders will be automatically replaced when creating campaigns:
;   \${GREETING_FILE} - The path to your greeting audio file
;   \${TRANSFER_NUMBER} - The number to transfer calls to when the caller presses 1

${dialplan}

; Instructions:
; 1. Copy the SIP Provider Configuration to your pjsip.conf or sip.conf file
; 2. Copy the Dialplan Configuration to your extensions.conf file
; 3. Replace the placeholders with your actual greeting file and transfer number
; 4. Reload Asterisk configuration with: 'asterisk -rx "core reload"'
; 5. Verify your trunk with: 'asterisk -rx "pjsip show endpoint ${sanitizedName}"'`;
};

/**
 * Validates SIP configuration parameters
 * @returns Validation errors or null if valid
 */
export const validateSipConfigParams = (
  providerName: string,
  host: string,
  port: string,
  username: string,
  password: string
): string | null => {
  if (!providerName.trim()) {
    return "Provider name is required";
  }
  
  if (!host.trim()) {
    return "SIP Host/Server is required";
  }
  
  if (port && !/^\d+$/.test(port)) {
    return "Port must be a valid number";
  }
  
  if (parseInt(port) > 65535 || parseInt(port) < 1) {
    return "Port must be between 1 and 65535";
  }
  
  // Username and password might be optional for some SIP providers
  
  return null; // Valid configuration
};
