// This file is kept for backward compatibility but now re-exports from auth-service.ts
// New code should import directly from '@/lib/auth-service' or '@/lib/auth-utils'

export * from './auth-utils';
// Explicitly re-export from auth-service, excluding getCurrentUser which is already in auth-utils
export { login, verifyToken } from './auth-service';
// Explicitly re-export types
export type { User } from './auth-service';
