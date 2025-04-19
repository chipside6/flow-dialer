
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
      
      // Call edge function to generate dialplan
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-campaign-dialplan`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.session.access_token}`
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
      
      return {
        success: true,
        message: 'Dialplan configuration generated successfully',
        config: result.dialplanConfig
      };
    } catch (error) {
      console.error('Error generating dialplan:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error generating dialplan'
      };
    }
  }
};
