
import { apiFetch } from './apiConfig';

/**
 * Fetches all greeting files for a specific user
 */
export const fetchGreetingFiles = async (userId: string) => {
  console.log(`[GreetingFilesService] Fetching greeting files for user: ${userId}`);
  
  try {
    const data = await apiFetch(`greeting-files?userId=${userId}`);
    console.log(`[GreetingFilesService] Fetched ${data.length} greeting files successfully`);
    
    return data;
  } catch (error) {
    console.error(`[GreetingFilesService] Error in fetchGreetingFiles:`, error);
    throw error;
  }
};

/**
 * Uploads a new greeting file
 */
export const uploadGreetingFile = async (audioBlob: Blob, userId: string) => {
  console.log(`[GreetingFilesService] Uploading greeting file for user: ${userId}`);
  
  try {
    const formData = new FormData();
    formData.append('file', audioBlob);
    formData.append('userId', userId);
    
    const data = await apiFetch('greeting-files', {
      method: 'POST',
      body: formData
    });
    
    console.log(`[GreetingFilesService] Successfully uploaded greeting file:`, data);
    
    return { success: true, url: data.url };
  } catch (error) {
    console.error(`[GreetingFilesService] Error in uploadGreetingFile:`, error);
    throw error;
  }
};
