
export { AuthContext, type AuthContextType } from './AuthContext';
export { AuthProvider } from './AuthProvider';
export { useAuth } from './useAuth';
// Only export the types we want to expose, not the duplicate AuthContextType
export type { User, UserProfile } from './types';
