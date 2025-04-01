
import { useContext } from 'react';
import { AuthContext } from './AuthContext';
import { useAuthOperations } from './hooks/useAuthOperations';

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  // Combine context with auth operations
  const operations = useAuthOperations();
  
  return {
    ...context,
    ...operations
  };
}
