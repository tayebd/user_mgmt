// Export the Supabase client (already configured to use mock in development)
import { supabase as configuredSupabase, AuthService, TokenService } from './supabase-client';

// Use the configured client (mock for development, real for production)
export const supabase = configuredSupabase;

// Export authentication utilities
export { AuthService, TokenService };
