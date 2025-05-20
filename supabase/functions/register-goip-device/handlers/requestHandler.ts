
import { corsHeaders } from "../utils/cors.ts";
import { validateRegistrationRequest, validateUserPermission } from "../utils/validation.ts";
import { generatePortCredentials } from "../utils/credentials.ts";
import { 
  createSupabaseAdmin,
  checkExistingTrunks,
  deleteExistingTrunks,
  checkDeviceIpColumn,
  insertPortRecords
} from "../services/databaseService.ts";
import { DeviceRegistrationRequest, RegistrationResponse } from "../types/index.ts";

// Verify user authentication
export async function verifyAuthentication(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    console.log("Request rejected: No authorization header");
    return {
      success: false, 
      status: 401,
      message: "Authentication required", 
      error: "No authorization header"
    };
  }

  // Extract JWT token from Authorization header
  const token = authHeader.replace("Bearer ", "");
  
  // Create Supabase client with the service role key
  const supabaseAdmin = createSupabaseAdmin();
  
  // Verify the JWT token
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  
  if (authError || !user) {
    console.log("Authentication error:", authError?.message || "No user found");
    return {
      success: false, 
      status: 401,
      message: "Authentication failed", 
      error: authError?.message || "Invalid authentication token"
    };
  }

  console.log(`Authenticated user: ${user.id}`);
  return { success: true, user };
}

// Parse request data
export async function parseRequestData(req: Request): Promise<{ 
  success: boolean; 
  data?: DeviceRegistrationRequest; 
  status?: number;
  message?: string; 
  error?: string; 
}> {
  try {
    const requestText = await req.text();
    console.log("Raw request body:", requestText);
    
    try {
      const data = JSON.parse(requestText);
      console.log("Request data:", data);
      return { success: true, data };
    } catch (parseError) {
      console.log("Invalid JSON in request body:", parseError);
      return {
        success: false,
        status: 400,
        message: "Invalid request format",
        error: "Could not parse JSON body"
      };
    }
  } catch (error) {
    console.log("Error reading request body:", error);
    return {
      success: false,
      status: 400,
      message: "Invalid request format",
      error: "Could not read request body"
    };
  }
}

// Main request handler for the edge function
export async function handleRequest(req: Request): Promise<Response> {
  // Verify authentication
  const authResult = await verifyAuthentication(req);
  if (!authResult.success) {
    return new Response(
      JSON.stringify({
        success: false,
        message: authResult.message,
        error: authResult.error
      }),
      { status: authResult.status, headers: corsHeaders }
    );
  }
  
  const { user } = authResult;
  
  // Parse request data
  const parseResult = await parseRequestData(req);
  if (!parseResult.success) {
    return new Response(
      JSON.stringify({
        success: false,
        message: parseResult.message,
        error: parseResult.error
      }),
      { status: parseResult.status || 400, headers: corsHeaders }
    );
  }
  
  const requestData = parseResult.data!;
  
  // Validate request data
  const validationResult = validateRegistrationRequest(requestData);
  if (!validationResult.valid) {
    return new Response(
      JSON.stringify({
        success: false,
        message: validationResult.message,
        missingFields: validationResult.missingFields
      }),
      { status: 400, headers: corsHeaders }
    );
  }
  
  // Verify the user is registering their own device
  const permissionResult = validateUserPermission(user.id, requestData.userId);
  if (!permissionResult.valid) {
    return new Response(
      JSON.stringify({
        success: false,
        message: permissionResult.message
      }),
      { status: 403, headers: corsHeaders }
    );
  }
  
  const { userId, deviceName, ipAddress, numPorts } = requestData;
  
  // Create Supabase admin client
  const supabaseAdmin = createSupabaseAdmin();
  
  // Check for existing trunks with the same name
  const existingTrunksResult = await checkExistingTrunks(supabaseAdmin, userId, deviceName);
  if (!existingTrunksResult.success) {
    return new Response(
      JSON.stringify({
        success: false,
        message: existingTrunksResult.message,
        errorType: existingTrunksResult.errorType
      }),
      { status: 500, headers: corsHeaders }
    );
  }
  
  const existingTrunks = existingTrunksResult.data;
  
  // Delete existing trunks if found
  if (existingTrunks && existingTrunks.length > 0) {
    console.log(`Found ${existingTrunks.length} existing trunks with name ${deviceName}, deleting...`);
    
    const deleteResult = await deleteExistingTrunks(supabaseAdmin, userId, deviceName);
    if (!deleteResult.success) {
      return new Response(
        JSON.stringify({
          success: false,
          message: deleteResult.message,
          errorType: deleteResult.errorType
        }),
        { status: 500, headers: corsHeaders }
      );
    }
    
    console.log("Successfully deleted existing trunks");
  }
  
  // Generate port credentials
  const ports = generatePortCredentials(userId, deviceName, ipAddress, numPorts);
  
  console.log(`Inserting ${ports.length} port records for device ${deviceName}`);
  
  // Check if device_ip column exists
  const hasDeviceIpColumn = await checkDeviceIpColumn(supabaseAdmin);
  
  // Insert port records
  const insertResult = await insertPortRecords(supabaseAdmin, ports, hasDeviceIpColumn);
  if (!insertResult.success) {
    return new Response(
      JSON.stringify({
        success: false,
        message: insertResult.message,
        error: insertResult.error
      }),
      { status: 500, headers: corsHeaders }
    );
  }
  
  console.log("Successfully inserted all port records");
  
  // Success response
  const response: RegistrationResponse = {
    success: true,
    message: "GoIP device registered successfully",
    deviceName,
    numPorts,
    ports: insertResult.data || []
  };
  
  return new Response(JSON.stringify(response), { headers: corsHeaders });
}
