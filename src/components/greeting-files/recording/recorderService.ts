
import { supabase } from '@/integrations/supabase/client';

export async function uploadRecording(audioBlob: Blob, userId: string) {
  // Create form data for the Edge Function
  const formData = new FormData();
  formData.append('file', audioBlob, 'recorded-greeting.webm');
  
  // Get the token for authorization
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('No active session');
  }
  
  try {
    // Call the Edge Function to upload the file
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-greeting`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      }
    );
    
    if (!response.ok) {
      let errorMessage = 'Failed to upload file';
      
      try {
        // Try to parse the error response as JSON
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (parseError) {
        // If parsing fails, use the response text if available
        const text = await response.text();
        errorMessage = text || errorMessage;
        console.error('Parse error:', parseError, 'Response text:', text);
      }
      
      throw new Error(errorMessage);
    }
    
    let result;
    try {
      const text = await response.text();
      // Only try to parse as JSON if the text contains valid JSON
      if (text && (text.trim().startsWith('{') || text.trim().startsWith('['))) {
        result = JSON.parse(text);
      } else {
        console.log('Non-JSON response:', text);
        result = { success: true };
      }
    } catch (parseError) {
      console.error('Error parsing response:', parseError);
      // Continue as if upload was successful
      result = { success: true };
    }
    
    return result;
  } catch (error) {
    console.error('Upload error:', error);
    throw error; // Re-throw to be handled by the caller
  }
}
