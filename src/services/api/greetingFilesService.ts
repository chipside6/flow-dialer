
import { apiFetch } from './apiConfig';

/**
 * Fetches all greeting files for a specific user
 */
export const fetchGreetingFiles = async (userId: string) => {
  console.log(`[GreetingFilesService] Fetching greeting files for user: ${userId}`);
  
  try {
    const data = await apiFetch<any[]>(`greeting-files?userId=${userId}`);
    console.log(`[GreetingFilesService] Fetched ${data?.length || 0} greeting files successfully`);
    
    // Handle case where data might be null/undefined
    if (!data) {
      console.warn('[GreetingFilesService] No data returned from the API');
      return [];
    }
    
    return data.map(item => ({
      id: item.id,
      filename: item.filename,
      url: item.url,
      durationSeconds: item.duration_seconds || 0,
      dateAdded: new Date(item.created_at || item.dateAdded),
    }));
  } catch (error) {
    console.error(`[GreetingFilesService] Error in fetchGreetingFiles:`, error);
    throw error;
  }
};

/**
 * Uploads a new greeting file
 */
export const uploadGreetingFile = async (userId: string, file: File) => {
  console.log(`[GreetingFilesService] Uploading greeting file for user: ${userId}`);
  
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    
    const data = await apiFetch<any>('greeting-files', {
      method: 'POST',
      body: formData,
      // Content-Type is automatically set by the browser for FormData
    });
    
    console.log(`[GreetingFilesService] Upload successful:`, data);
    
    if (data && data.url) {
      return {
        id: data.id,
        filename: data.filename || file.name,
        url: data.url,
        durationSeconds: data.duration_seconds || 0,
        dateAdded: new Date()
      };
    } else {
      throw new Error("Invalid response from server");
    }
  } catch (error) {
    console.error(`[GreetingFilesService] Error in uploadGreetingFile:`, error);
    throw error;
  }
};

/**
 * Deletes a greeting file
 */
export const deleteGreetingFile = async (userId: string, fileId: string) => {
  console.log(`[GreetingFilesService] Deleting greeting file ${fileId} for user ${userId}`);
  
  try {
    await apiFetch<any>(`greeting-files/${fileId}?userId=${userId}`, {
      method: 'DELETE'
    });
    
    console.log(`[GreetingFilesService] Successfully deleted greeting file ${fileId}`);
    return true;
  } catch (error) {
    console.error(`[GreetingFilesService] Error in deleteGreetingFile:`, error);
    throw error;
  }
};
