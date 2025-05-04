/**
 * Configuration generators that fetch data from APIs for Asterisk
 */
export const apiGenerator = {
  /**
   * Generate a configuration by fetching data from an API.
   * This function is ideal for server-side or headless operation.
   *
   * @param {Record<string, string>} params - Parameters to be included in the API request.
   * @returns {Promise<string>} - The generated configuration or error message.
   */
  generateConfigFromApi: (params: Record<string, string>) => {
    return async (fetchFn: (url: string) => Promise<any>): Promise<string> => {
      try {
        // Build API URL from params
        const urlParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value) urlParams.append(key, value);
        });

        // Configure API request URL
        const url = `/api/configs/asterisk-campaign?${urlParams.toString()}`;

        // Set up an AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10-second timeout
        
        // Fetch the configuration from the API
        const response = await fetchFn(url, {
          signal: controller.signal, // Attach timeout controller to the fetch
        });

        clearTimeout(timeoutId); // Clear timeout after fetch completion

        // Validate the response
        if (!response.ok) {
          throw new Error(`API request failed with status: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data || !data.config) {
          throw new Error("Invalid response from API: Missing 'config' key");
        }

        // Return the generated configuration
        return data.config;
      } catch (error) {
        console.error("Error generating API config:", error);

        // Return a meaningful error message
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

