import { supabase } from '../lib/supabase';

export const getAuthToken = async (): Promise<string> => {
  if (!supabase) {
    throw new Error('Supabase client not configured');
  }
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('No active session found');
  }
  return session.access_token;
};
