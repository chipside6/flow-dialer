
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.3";
import { corsHeaders } from "../utils/cors.ts";
import { PortDefinition } from "../types/index.ts";

// Create Supabase client with admin privileges
export function createSupabaseAdmin() {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );
}

// Check if existing trunks with the same name exist
export async function checkExistingTrunks(supabaseAdmin: any, userId: string, deviceName: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_trunks')
      .select('*')
      .eq('user_id', userId)
      .eq('trunk_name', deviceName);
      
    if (error) {
      console.error("Error checking existing trunks:", error);
      return { 
        success: false, 
        message: `Database error: ${error.message}`,
        errorType: "database" 
      };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error("Exception checking existing trunks:", error);
    return { 
      success: false, 
      message: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
      errorType: "exception" 
    };
  }
}

// Delete existing trunks with the same name
export async function deleteExistingTrunks(supabaseAdmin: any, userId: string, deviceName: string) {
  try {
    const { error } = await supabaseAdmin
      .from('user_trunks')
      .delete()
      .eq('user_id', userId)
      .eq('trunk_name', deviceName);
    
    if (error) {
      console.error("Error deleting existing trunks:", error);
      return { 
        success: false, 
        message: `Database error: ${error.message}`,
        errorType: "database" 
      };
    }
    
    return { success: true };
  } catch (error) {
    console.error("Exception deleting existing trunks:", error);
    return { 
      success: false, 
      message: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
      errorType: "exception" 
    };
  }
}

// Check if device_ip column exists in user_trunks table
export async function checkDeviceIpColumn(supabaseAdmin: any) {
  try {
    const { error, data } = await supabaseAdmin.rpc('column_exists', {
      'table_name': 'user_trunks',
      'column_name': 'device_ip'
    });
    
    if (error) {
      console.error("Error checking for device_ip column:", error);
      // Continue despite error, assuming column doesn't exist
      return false;
    }
    
    return data === true;
  } catch (error) {
    console.error("Exception checking for device_ip column:", error);
    // Continue despite error, assuming column doesn't exist
    return false;
  }
}

// Insert ports into the database
export async function insertPortRecords(
  supabaseAdmin: any, 
  ports: PortDefinition[], 
  hasDeviceIpColumn: boolean
) {
  try {
    // If device_ip column doesn't exist, remove it from the insert data
    const insertData = hasDeviceIpColumn 
      ? ports 
      : ports.map(port => {
          const { device_ip, ...rest } = port;
          return rest;
        });
    
    const { data, error } = await supabaseAdmin
      .from('user_trunks')
      .insert(insertData)
      .select();
    
    if (error) {
      console.error("Error inserting trunks:", error);
      return { 
        success: false, 
        message: "Database error: Unable to register device",
        error: error.message
      };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error("Exception inserting trunks:", error);
    return { 
      success: false, 
      message: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
      errorType: "exception" 
    };
  }
}
