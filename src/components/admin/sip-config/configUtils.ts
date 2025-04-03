
import { asteriskConfig } from "@/utils/asteriskService";
import { GreetingFile } from "@/hooks/useGreetingFiles";
import { TransferNumber } from "@/types/transferNumber";

/**
 * Generates SIP configuration text with real greeting file and transfer number data
 * instead of just placeholders
 */
export const generateSipConfig = (
  providerName: string,
  host: string,
  port: string,
  username: string,
  password: string,
  greetingFiles: GreetingFile[] = [],
  transferNumbers: TransferNumber[] = []
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
  
  // Get the first greeting file and transfer number to use as examples if available
  const exampleGreetingFile = greetingFiles.length > 0 ? greetingFiles[0].file_path : "${GREETING_FILE}";
  const exampleTransferNumber = transferNumbers.length > 0 ? transferNumbers[0].number : "${TRANSFER_NUMBER}";
  
  // Generate dialplan with real examples when available, otherwise use placeholders
  const dialplan = asteriskConfig.generateDialplan(
    "example-campaign",
    exampleGreetingFile,
    exampleTransferNumber
  );
  
  // Create a list of available greeting files and transfer numbers
  const greetingFilesList = greetingFiles.length > 0 
    ? greetingFiles.map(file => `; - ${file.filename}: ${file.file_path}`).join('\n')
    : "; No greeting files found in your account";
  
  const transferNumbersList = transferNumbers.length > 0
    ? transferNumbers.map(tn => `; - ${tn.name}: ${tn.number}`).join('\n')
    : "; No transfer numbers found in your account";
  
  return `; Asterisk SIP Provider Configuration
; ----------------------------------------------
; Provider: ${sanitizedName}
; Host: ${host}
; This configuration should be placed in your pjsip.conf or sip.conf file

${sipConfig}

; Dialplan Configuration
; ----------------------------------------------
; This configuration should be placed in your extensions.conf file
; The example uses ${greetingFiles.length > 0 ? 'your actual greeting file and transfer number' : 'placeholders that need to be replaced'}

${dialplan}

; Your Available Greeting Files
; ----------------------------------------------
${greetingFilesList}

; Your Available Transfer Numbers
; ----------------------------------------------
${transferNumbersList}

; Instructions:
; 1. Copy the SIP Provider Configuration to your pjsip.conf or sip.conf file
; 2. Copy the Dialplan Configuration to your extensions.conf file
; 3. ${greetingFiles.length > 0 && transferNumbers.length > 0 ? 'The example uses your first greeting file and transfer number' : 'Replace the placeholders with your actual greeting file and transfer number'}
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
