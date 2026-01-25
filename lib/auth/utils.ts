import { createClient } from '@/lib/supabase/client';

export interface AuthUser {
  id: string;
  email?: string;
  // Add other user properties as needed
}

/**
 * Gets the current authenticated user and throws error if not authenticated
 * Centralizes authentication logic to eliminate duplication across API functions
 */
export async function getCurrentUser(): Promise<AuthUser> {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new Error("User not authenticated");
  }
  
  return user as AuthUser;
}