
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
 * Logs the error to a service (e.g., Sentry, Datadog, etc.) for better visibility
 * Replace with actual service in production
 */
const logErrorToService = (error: DialerError) => {
  // Placeholder: Replace with actual logging service like Sentry, Datadog, etc.
  console.error(`Logging error to service: [${error.type}] ${error.message}`, error.originalError);
};

/**
 * Handles dialer errors with appropriate UI feedback and logging
 */
export const handleDialerError = (error: DialerError): void => {
  // Log the error for debugging and monitoring purposes
  logErrorToService(error);

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

  // Check if the error is a known Error instance
  if (error instanceof Error) {
    const errorMessage = error.message.toLowerCase();

    if (errorMessage.includes('network') || 
        errorMessage.includes('connection') || 
        errorMessage.includes('timeout') ||
        errorMessage.includes('offline')) {
      return DialerErrorType.CONNECTION;
    }
    
    if (errorMessage.includes('auth') || 
        errorMessage.includes('permission') || 
        errorMessage.includes('unauthorized') ||
        errorMessage.includes('forbidden')) {
      return DialerErrorType.AUTHORIZATION;
    }
    
    if (errorMessage.includes('provider') || 
        errorMessage.includes('sip')) {
      return DialerErrorType.PROVIDER;
    }
    
    if (errorMessage.includes('contact') || 
        errorMessage.includes('list')) {
      return DialerErrorType.CONTACT_LIST;
    }
    
    if (errorMessage.includes('server') || 
        errorMessage.includes('500')) {
      return DialerErrorType.SERVER;
    }
    
    if (errorMessage.includes('config') || 
        errorMessage.includes('parameter') ||
        errorMessage.includes('invalid')) {
      return DialerErrorType.CONFIGURATION;
    }
  }

  return DialerErrorType.UNKNOWN;
};

/**
 * Helper function to handle try/catch blocks consistently with retry mechanism
 */
export const tryCatchWithErrorHandling = async <T>(
  operation: () => Promise<T>,
  errorMessage: string,
  errorType: DialerErrorType = DialerErrorType.UNKNOWN,
  retries: number = 3, // Retry up to 3 times
  delay: number = 1000 // Delay between retries (1 second)
): Promise<T | null> => {
  let attempt = 0;

  while (attempt < retries) {
    try {
      return await operation();
    } catch (error) {
      attempt++;
      const determinedType = error ? categorizeError(error) : errorType;
      handleDialerError(createDialerError(determinedType, errorMessage, error));

      // If max retries reached, return null
      if (attempt >= retries) {
        return null;
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  return null;
};
