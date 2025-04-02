
// This file re-exports all services that have been migrated to use Supabase

// Export all service modules that use Supabase
export * from './supabase';

// Log that we're using Supabase exclusively
console.log('[Services] Using Supabase exclusively for backend services');
