
/**
 * Utility functions for campaign data
 */

/**
 * Returns the appropriate badge variant based on campaign status
 */
export const badgeVariantFromStatus = (status: string | undefined): "default" | "destructive" | "outline" | "secondary" | "success" | null => {
  if (!status) return "outline";
  
  switch (status.toLowerCase()) {
    case 'running':
      return "success";
    case 'active':
      return "success";
    case 'paused':
      return "secondary";
    case 'failed':
      return "destructive";
    case 'completed':
      return "default";
    case 'draft':
      return "outline";
    case 'pending':
      return "outline";
    default:
      return "outline";
  }
};

/**
 * Transforms raw campaign data from API/database to match the Campaign interface
 */
export const transformCampaignData = (rawCampaign: any) => {
  console.log("Transforming campaign data:", rawCampaign);
  
  if (!rawCampaign || typeof rawCampaign !== 'object') {
    console.error("Invalid campaign data:", rawCampaign);
    return null;
  }
  
  try {
    return {
      id: rawCampaign.id,
      title: rawCampaign.title || "Untitled Campaign",
      description: rawCampaign.description || "",
      status: rawCampaign.status || "pending",
      user_id: rawCampaign.user_id,
      created_at: rawCampaign.created_at || new Date().toISOString(),
      updated_at: rawCampaign.updated_at || new Date().toISOString(),
      
      // Handle all the different property naming conventions
      totalCalls: rawCampaign.total_calls || rawCampaign.totalCalls || 0,
      answeredCalls: rawCampaign.answered_calls || rawCampaign.answeredCalls || 0,
      transferredCalls: rawCampaign.transferred_calls || rawCampaign.transferredCalls || 0,
      failedCalls: rawCampaign.failed_calls || rawCampaign.failedCalls || 0,
      progress: rawCampaign.progress || 0,
      
      // Additional properties
      greeting_file_url: rawCampaign.greeting_file_url || rawCampaign.greetingFileUrl || "",
      transfer_number: rawCampaign.transfer_number || rawCampaign.transferNumber || "",
      port_number: rawCampaign.port_number || rawCampaign.portNumber || 1,
      contact_list_id: rawCampaign.contact_list_id || rawCampaign.contactListId || null,
    };
  } catch (error) {
    console.error("Error transforming campaign data:", error);
    console.error("Raw campaign data:", rawCampaign);
    return null;
  }
};
