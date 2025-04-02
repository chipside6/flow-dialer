
import { asteriskConfig } from "@/utils/asteriskService";

/**
 * Generates SIP configuration text with appropriate placeholders
 */
export const generateSipConfig = (
  providerName: string,
  host: string,
  port: string,
  username: string,
  password: string
): string => {
  // Generate SIP provider config
  const sipConfig = asteriskConfig.generateSipTrunkConfig(
    providerName,
    host,
    port,
    username,
    password
  );
  
  // Generate dialplan with placeholders that will be replaced with actual values
  const dialplan = asteriskConfig.generateDialplan(
    "example-campaign",
    "${GREETING_FILE}", // This is a placeholder that will be replaced
    "${TRANSFER_NUMBER}" // This is a placeholder that will be replaced
  );
  
  return `; SIP Provider Configuration\n${sipConfig}
  
; Dialplan Configuration\n${dialplan}

; Note: The placeholders \${GREETING_FILE} and \${TRANSFER_NUMBER} will be replaced with the actual values configured in your campaigns.`;
};
