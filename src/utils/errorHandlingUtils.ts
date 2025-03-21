
import { toast } from "@/components/ui/use-toast";

/**
 * Error types for the background dialer system
 */
export enum DialerErrorType {
  CONNECTION = "connection",
  CONFIGURATION = "configuration",
  PROVIDER = "provider",
  CONTACT_LIST = "contact_list",
  AUTHORIZATION = "authorization",
  SERVER = "server",
  UNKNOWN = "unknown"
}

/**
 * Interface for standardized error handling
 */
export interface DialerError {
  type: DialerErrorType;
  message: string;
  originalError?: unknown;
  timestamp: Date;
}

/**
 * Creates a standardized error object
 */
export const createDialerError = (
  type: DialerErrorType,
  message: string,
  originalError?: unknown
): DialerError => ({
  type,
  message,
  originalError,
  timestamp: new Date()
});

/**
 * Handles dialer errors with appropriate UI feedback and logging
 */
export const handleDialerError = (error: DialerError): void => {
  // Log error for debugging
  console.error(`Dialer Error [${error.type}]:`, error.message, error.originalError);
  
  // Display appropriate toast message based on error type
  switch (error.type) {
    case DialerErrorType.CONNECTION:
      toast({
        title: "Connection Error",
        description: error.message || "Could not connect to dialing service. Please check your internet connection.",
        variant: "destructive",
      });
      break;
      
    case DialerErrorType.CONFIGURATION:
      toast({
        title: "Configuration Error",
        description: error.message || "Invalid dialer configuration.",
        variant: "destructive",
      });
      break;
      
    case DialerErrorType.PROVIDER:
      toast({
        title: "SIP Provider Error",
        description: error.message || "There was an issue with the SIP provider.",
        variant: "destructive",
      });
      break;
      
    case DialerErrorType.CONTACT_LIST:
      toast({
        title: "Contact List Error",
        description: error.message || "There was an issue with the contact list.",
        variant: "destructive",
      });
      break;
      
    case DialerErrorType.AUTHORIZATION:
      toast({
        title: "Authorization Error",
        description: error.message || "You are not authorized to perform this action.",
        variant: "destructive",
      });
      break;
      
    case DialerErrorType.SERVER:
      toast({
        title: "Server Error",
        description: error.message || "The server encountered an error while processing your request.",
        variant: "destructive",
      });
      break;
      
    default:
      toast({
        title: "Unexpected Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
  }
};

/**
 * Attempts to determine the type of error from a caught exception
 */
export const categorizeError = (error: unknown): DialerErrorType => {
  if (!error) return DialerErrorType.UNKNOWN;
  
  const errorString = String(error).toLowerCase();
  
  if (errorString.includes('network') || 
      errorString.includes('connection') || 
      errorString.includes('timeout') ||
      errorString.includes('offline')) {
    return DialerErrorType.CONNECTION;
  }
  
  if (errorString.includes('auth') || 
      errorString.includes('permission') || 
      errorString.includes('unauthorized') ||
      errorString.includes('forbidden')) {
    return DialerErrorType.AUTHORIZATION;
  }
  
  if (errorString.includes('provider') || 
      errorString.includes('sip')) {
    return DialerErrorType.PROVIDER;
  }
  
  if (errorString.includes('contact') || 
      errorString.includes('list')) {
    return DialerErrorType.CONTACT_LIST;
  }
  
  if (errorString.includes('server') || 
      errorString.includes('500')) {
    return DialerErrorType.SERVER;
  }
  
  if (errorString.includes('config') || 
      errorString.includes('parameter') ||
      errorString.includes('invalid')) {
    return DialerErrorType.CONFIGURATION;
  }
  
  return DialerErrorType.UNKNOWN;
};

/**
 * Helper function to handle try/catch blocks consistently
 */
export const tryCatchWithErrorHandling = async <T>(
  operation: () => Promise<T>,
  errorMessage: string,
  errorType: DialerErrorType = DialerErrorType.UNKNOWN
): Promise<T | null> => {
  try {
    return await operation();
  } catch (error) {
    const determinedType = error ? errorType : categorizeError(error);
    handleDialerError(createDialerError(determinedType, errorMessage, error));
    return null;
  }
};
