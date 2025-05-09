
import { supabase } from '@/integrations/supabase/client';

/**
 * Generate Asterisk dialplan configuration for a campaign
 */
export const dialplanGenerator = {
  /**
   * Generate campaign-specific dialplan with AMD and transfer handling
   */
  generateCampaignDialplan: async (
    campaignId: string,
    userId: string
  ): Promise<{ success: boolean; message: string; config?: string }> => {
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session?.session?.access_token) {
        throw new Error('Authentication required');
      }

      // Validate campaignId and userId format (e.g., UUID format)
      if (!validateUUID(campaignId) || !validateUUID(userId)) {
        throw new Error('Invalid campaignId or userId');
      }

      // Call edge function to generate dialplan
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      
      // Call edge function to generate dialplan
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-campaign-dialplan`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            campaignId,
            userId
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Error generating dialplan: ${response.statusText}`);
      }

      const result = await response.json();

      // Return structured success response
      return {
        success: true,
        message: 'Dialplan configuration generated successfully',
        config: result.dialplanConfig
      };
    } catch (error) {
      console.error('Error generating dialplan:', error);
      // Use a logging service in production (e.g., Sentry, LogRocket)
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error generating dialplan'
      };
    }
  },

  /**
   * Generate transfer-enabled dialplan for a campaign
   */
  generateTransferDialplan: async (
    campaignId: string,
    transferNumber: string,
    portNumber: number,
    greetingFile: string
  ): Promise<{ success: boolean; message: string; config?: string }> => {
    try {
      // Validate inputs
      if (!validateUUID(campaignId) || !validatePhoneNumber(transferNumber) || !validatePortNumber(portNumber)) {
        throw new Error('Invalid input values');
      }
      
      // Generate dialplan configuration
      const dialplan = `
; Campaign ${campaignId} Transfer-Enabled Dialplan
; Generated on ${new Date().toISOString()}

[campaign-${campaignId}]
exten => _X.,1,NoOp(Campaign ${campaignId} call handler)
exten => _X.,n,Answer()
exten => _X.,n,Set(CAMPAIGN_ID=${campaignId})
exten => _X.,n,Set(TRANSFER_NUMBER=${transferNumber})
exten => _X.,n,Set(PORT_NUMBER=${portNumber})
exten => _X.,n,Set(GREETING_FILE=${greetingFile})
exten => _X.,n,AMD()
exten => _X.,n,GotoIf($["\${AMDSTATUS}" = "MACHINE"]?machine:human)

exten => _X.,n(human),NoOp(Human answered - Playing greeting and waiting for input)
exten => _X.,n,Playback(${greetingFile})
exten => _X.,n,Read(digit,beep,1)
exten => _X.,n,GotoIf($["\${digit}" = "1"]?transfer,1:hangup)

exten => _X.,n(machine),NoOp(Answering machine detected - Hanging up)
exten => _X.,n,Hangup()

exten => _X.,n(hangup),NoOp(Call ended without transfer)
exten => _X.,n,Hangup()

exten => transfer,1,NoOp(Transferring call to ${transferNumber})
exten => transfer,n,Set(TRANSFER_ATTEMPT=1)
exten => transfer,n,Dial(SIP/${transferNumber}@goip_port${portNumber},30,g)
exten => transfer,n,NoOp(Transfer result: \${DIALSTATUS})
exten => transfer,n,GotoIf($["\${DIALSTATUS}" = "ANSWER"]?transfer_success:transfer_failed)

exten => transfer,n(transfer_success),NoOp(Transfer successful)
exten => transfer,n,Hangup()

exten => transfer,n(transfer_failed),NoOp(Transfer failed - Playing apology message)
exten => transfer,n,Playback(sorry-cant-connect-call)
exten => transfer,n,Hangup()
`;

      // Return structured response
      return {
        success: true,
        message: 'Transfer dialplan generated successfully',
        config: dialplan
      };
    } catch (error) {
      console.error('Error generating transfer dialplan:', error);
      // Use a logging service in production (e.g., Sentry, LogRocket)
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error generating transfer dialplan'
      };
    }
  }
};

/**
 * Validate UUID format
 */
function validateUUID(id: string): boolean {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return regex.test(id);
}

/**
 * Validate phone number format (simple validation for example purposes)
 */
function validatePhoneNumber(number: string): boolean {
  const regex = /^\+?[1-9]\d{1,14}$/; // E.164 format
  return regex.test(number);
}

/**
 * Validate port number to ensure it is a positive integer
 */
function validatePortNumber(port: number): boolean {
  return Number.isInteger(port) && port > 0;
}
