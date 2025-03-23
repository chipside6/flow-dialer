
import { UserProfile as ServiceUserProfile, User as ServiceUser, Session as ServiceSession } from '@/services/auth/types';

// Re-export the types with clear names to avoid circular dependency
export type User = ServiceUser;
export type UserProfile = ServiceUserProfile;
export type Session = ServiceSession;

