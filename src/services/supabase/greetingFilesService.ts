
import { supabase } from '@/integrations/supabase/client';

/**
 * Fetches all greeting files for a specific user
 */
export const fetchGreetingFiles = async (userId: string) => {
  console.log(`[GreetingFilesService] Fetching greeting files for user: ${userId}`);
  
  try {
    const { data, error } = await supabase
      .from('greeting_files')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error(`[GreetingFilesService] Error in fetchGreetingFiles:`, error);
      throw error;
    }
    
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
    // Generate a timestamp for unique filename
    const timestamp = Date.now();
    const filename = `greeting_${timestamp}.webm`;
    const filePath = `${userId}/${filename}`;
    
    // Check if storage bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const voiceAppBucket = buckets?.find(bucket => bucket.name === 'voice-app-uploads');
    
    if (!voiceAppBucket) {
      console.error('[GreetingFilesService] Voice app uploads bucket does not exist');
      // Create bucket if it doesn't exist
      const { data: newBucket, error: bucketError } = await supabase.storage.createBucket('voice-app-uploads', {
        public: false
      });
      
      if (bucketError) {
        console.error('[GreetingFilesService] Error creating bucket:', bucketError);
        throw new Error('Unable to create storage bucket: ' + bucketError.message);
      }
      
      console.log('[GreetingFilesService] Created new bucket:', newBucket);
    }
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('voice-app-uploads')
      .upload(filePath, audioBlob, {
        contentType: 'audio/webm',
        cacheControl: '3600',
        upsert: false
      });
    
    if (uploadError) {
      console.error(`[GreetingFilesService] Error uploading file:`, uploadError);
      throw uploadError;
    }
    
    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('voice-app-uploads')
      .getPublicUrl(filePath);
    
    // Insert record in database
    const { data: fileData, error: insertError } = await supabase
      .from('greeting_files')
      .insert({
        user_id: userId,
        filename: filename,
        url: urlData.publicUrl,
        file_path: filePath,
        file_type: 'audio/webm',
        file_size: audioBlob.size
      })
      .select()
      .single();
    
    if (insertError) {
      console.error(`[GreetingFilesService] Error saving file record:`, insertError);
      throw insertError;
    }
    
    console.log(`[GreetingFilesService] Successfully uploaded greeting file:`, fileData);
    
    return { success: true, url: fileData.url, data: fileData };
  } catch (error) {
    console.error(`[GreetingFilesService] Error in uploadGreetingFile:`, error);
    throw error;
  }
};

/**
 * Create default lifetime plan for user
 */
export const createLifetimePlanForUser = async (userId: string) => {
  console.log(`[GreetingFilesService] Creating lifetime plan for user: ${userId}`);
  
  try {
    // Check if user already has a subscription
    const { data: existingSubscription, error: subscriptionCheckError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (subscriptionCheckError) {
      console.error('[GreetingFilesService] Error checking existing subscription:', subscriptionCheckError);
      throw subscriptionCheckError;
    }
    
    // If user already has a subscription, don't create a new one
    if (existingSubscription) {
      console.log('[GreetingFilesService] User already has a subscription:', existingSubscription);
      return { success: true, message: 'User already has a subscription', data: existingSubscription };
    }
    
    // Create lifetime subscription for user
    const { data: subscription, error: insertError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        plan_id: 'lifetime',
        plan_name: 'Lifetime',
        status: 'active',
        current_period_end: null // Null for lifetime plans
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('[GreetingFilesService] Error creating lifetime subscription:', insertError);
      throw insertError;
    }
    
    console.log('[GreetingFilesService] Successfully created lifetime subscription:', subscription);
    
    // Also create a payment record for tracking
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: userId,
        plan_id: 'lifetime',
        payment_method: 'admin',
        amount: 0, // Free for admin-created users
        status: 'completed',
        payment_details: { note: 'Admin created lifetime plan' }
      })
      .select()
      .single();
    
    if (paymentError) {
      console.error('[GreetingFilesService] Error creating payment record:', paymentError);
      // Don't throw here, subscription was created successfully
    }
    
    return { success: true, message: 'Lifetime plan created successfully', data: subscription };
  } catch (error) {
    console.error('[GreetingFilesService] Error in createLifetimePlanForUser:', error);
    throw error;
  }
};
