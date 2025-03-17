import { createClient } from '@supabase/supabase-js';
import { Request } from 'express';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const getAuthToken = async (req: Request): Promise<string> => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Authorization header missing or invalid');
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      throw new Error('Invalid or expired token');
    }

    return token;
  } catch (error) {
    console.error('Error in getAuthToken:', error);
    throw new Error('Authentication failed');
  }
};

export const verifyToken = async (token: string): Promise<boolean> => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    return !error && !!user;
  } catch (error) {
    console.error('Error verifying token:', error);
    return false;
  }
};
