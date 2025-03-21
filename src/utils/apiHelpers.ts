
import { getStoredSession } from "@/services/authService";
import { toast } from "@/components/ui/use-toast";

// HTTP Error class to handle API errors
export class HttpError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

// Function to handle common error responses
export const handleApiError = (error: unknown): HttpError => {
  if (error instanceof HttpError) {
    return error;
  }
  
  if (error instanceof Response) {
    return new HttpError(`API Error: ${error.statusText}`, error.status);
  }
  
  console.error('Unhandled API error:', error);
  return new HttpError('An unexpected error occurred', 500);
};

// Helper for making authenticated API requests
export const apiRequest = async <T>(
  url: string, 
  options: RequestInit = {}
): Promise<T> => {
  try {
    // Get session for auth header
    const session = getStoredSession();
    
    // Set up headers
    const headers = new Headers(options.headers);
    
    // Add auth header if session exists
    if (session) {
      headers.set('Authorization', `Bearer ${session.user.id}`);
    }
    
    // If no Content-Type is set and we're not dealing with FormData, set it
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }
    
    // Make the request
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    // Check if response is ok
    if (!response.ok) {
      let errorMessage = `API Error: ${response.status} ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // If response is not JSON, just use the status text
      }
      
      // Check for auth errors
      if (response.status === 401) {
        // Clear stored session if unauthorized
        localStorage.removeItem('user_session');
        
        // Show toast
        toast({
          title: "Authentication error",
          description: "Your session has expired. Please log in again.",
          variant: "destructive"
        });
        
        // Redirect to login
        window.location.href = '/login';
      }
      
      throw new HttpError(errorMessage, response.status);
    }
    
    // Check for empty response (like for DELETE requests)
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return {} as T;
  } catch (error) {
    console.error('API request error:', error);
    
    if (error instanceof HttpError) {
      throw error;
    }
    
    throw new HttpError(
      error instanceof Error ? error.message : 'An unexpected error occurred',
      500
    );
  }
};
