
/**
 * Configuration generators that fetch data from APIs for Asterisk
 */
export const apiGenerator = {
  /**
   * Generate a configuration by fetching data from an API
   * This is ideal for server-side or headless operation
   */
  generateConfigFromApi(params: Record<string, string>) {
    return async (fetchFn: (url: string) => Promise<any>) => {
      try {
        // Build API URL from params
        const urlParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value) urlParams.append(key, value);
        });
        
        // Fetch configuration with a timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const url = `/api/configs/asterisk-campaign?${urlParams.toString()}`;
        const response = await fetchFn(url);
        
        clearTimeout(timeoutId);
        
        if (!response || !response.config) {
          throw new Error("Invalid response from API");
        }
        
        return response.config;
      } catch (error) {
        console.error("Error generating API config:", error);
        return `
; Error generating API configuration
; ---------------------------------
; ${error instanceof Error ? error.message : 'Unknown error'}
; Please check your API connection and parameters
`.trim();
      }
    };
  }
};
