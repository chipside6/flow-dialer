
/**
 * API-based configuration generators for Asterisk
 */
export const apiGenerator = {
  /**
   * API endpoint function to generate configuration by API call
   * This can be used to integrate with external systems
   */
  generateConfigFromApi(params: any) {
    const {
      user_id,
      campaign_id,
      provider_id,
      greeting_id,
      transfer_id
    } = params;
    
    return async (fetchFunction: (url: string) => Promise<any>) => {
      try {
        // Construct API endpoint URL with parameters
        const apiUrl = `/api/asterisk/generate-config?user_id=${user_id}` + 
          (campaign_id ? `&campaign_id=${campaign_id}` : '') +
          (provider_id ? `&provider_id=${provider_id}` : '') +
          (greeting_id ? `&greeting_id=${greeting_id}` : '') +
          (transfer_id ? `&transfer_id=${transfer_id}` : '');
        
        // Fetch configuration from API
        const result = await fetchFunction(apiUrl);
        
        if (!result || !result.config) {
          throw new Error("API returned empty configuration");
        }
        
        return result.config;
      } catch (error) {
        console.error("Error fetching config from API:", error);
        return `
; Error fetching configuration from API
; -----------------------------------
; Could not fetch configuration for user ${user_id}
; Error: ${error instanceof Error ? error.message : 'Unknown error'}
; Please check the API endpoint and parameters.
        `.trim();
      }
    };
  }
};
