import { toast } from "@/components/ui/use-toast";

export enum OperationType {
  READ = "READ",
  WRITE = "WRITE",
  DELETE = "DELETE",
  UPDATE = "UPDATE",
  AUTH = "AUTH"
}

export type SupabaseDebugInfo = {
  operation: OperationType;
  table?: string;
  user_id?: string | null;
  timestamp: number;
  success: boolean;
  error?: any;
  data?: any;
  auth_status?: "AUTHENTICATED" | "UNAUTHENTICATED" | "UNKNOWN";
}

const debugHistory: SupabaseDebugInfo[] = [];

// Track toast IDs to prevent duplicate error toasts
const errorToastTracker = new Set<string>();

// Clear the toast tracker periodically
setInterval(() => {
  errorToastTracker.clear();
}, 30000); // Clear every 30 seconds

export const logSupabaseOperation = (info: Omit<SupabaseDebugInfo, "timestamp">) => {
  const debugInfo: SupabaseDebugInfo = {
    ...info,
    timestamp: Date.now()
  };
  
  debugHistory.push(debugInfo);
  
  // Keep only last 100 operations in memory to avoid memory leaks
  if (debugHistory.length > 100) {
    debugHistory.shift();
  }
  
  // Log to console for development visibility
  console.group(`Supabase Operation: ${info.operation} ${info.table ? `on ${info.table}` : ''}`);
  console.log("Status:", info.success ? "✅ Success" : "❌ Failed");
  console.log("Auth Status:", info.auth_status);
  if (info.error) console.error("Error:", info.error);
  if (info.data) console.log("Data:", info.data);
  if (info.user_id) console.log("User ID:", info.user_id);
  console.groupEnd();
  
  // DISABLED: No longer showing toasts for database errors
  // Only logging to console for debugging
  
  return debugInfo;
};

export const getRecentOperations = () => {
  return [...debugHistory].reverse();
};

export const clearDebugHistory = () => {
  debugHistory.length = 0;
};

// Helper for checking if errors are related to authentication
export const isAuthError = (error: any): boolean => {
  if (!error) return false;
  
  const authErrorMessages = [
    "JWT expired",
    "invalid JWT",
    "invalid signature",
    "no JWT",
    "not authenticated",
    "No authorization",
    "auth/",
    "not authorized",
    "violates row level security"
  ];
  
  const errorMessage = typeof error === 'string' 
    ? error 
    : error.message || error.error_description || JSON.stringify(error);
    
  return authErrorMessages.some(msg => errorMessage.includes(msg));
};
