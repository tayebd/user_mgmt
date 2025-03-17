import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { type Request, type Response, type NextFunction } from 'express'
import { z } from 'zod'
import jwt from 'jsonwebtoken'

// Environment variable schema validation
const envSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
  SUPABASE_JWT_SECRET: z.string().min(20),
  NODE_ENV: z.enum(['development', 'production']).default('development')
});

// Validate environment variables
const env = envSchema.safeParse(process.env);
if (!env.success) {
  throw new Error(`Invalid environment variables: ${env.error.message}`);
}

interface SupabaseContext {
  req: Request;
  res: Response;
}

interface SupabaseClientOptions {
  autoRefreshToken?: boolean;
  persistSession?: boolean;
  detectSessionInUrl?: boolean;
}

interface JwtPayload {
  sub: string;
  email?: string;
  role?: string;
}

interface UserPayload {
  id: number;
  uid: string;
  email: string;
  role: string;
  sub?: string;
}

export const createClient = (
  context: SupabaseContext,
  options: SupabaseClientOptions = {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
) => {
  try {
    return createServerClient(
      env.data.SUPABASE_URL,
      env.data.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: options.autoRefreshToken,
          persistSession: options.persistSession,
          detectSessionInUrl: options.detectSessionInUrl
        },
        cookies: {
          get(name: string) {
            try {
              return context.req.cookies[name];
            } catch (error) {
              console.error('Error reading cookie:', error);
              return undefined;
            }
          },
          set(name: string, value: string, options: CookieOptions) {
            try {
              context.res.cookie(name, value, {
                ...options,
                httpOnly: true,
                secure: env.data.NODE_ENV === 'production',
                sameSite: 'lax'
              });
            } catch (error) {
              console.error('Error setting cookie:', error);
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              context.res.clearCookie(name, {
                ...options,
                httpOnly: true,
                secure: env.data.NODE_ENV === 'production',
                sameSite: 'lax'
              });
            } catch (error) {
              console.error('Error removing cookie:', error);
            }
          }
        }
      }
    );
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    throw new Error('Failed to initialize Supabase client');
  }
}

export const verifyToken = (token: string): UserPayload => {
  try {
    const payload = jwt.verify(token, env.data.SUPABASE_JWT_SECRET) as JwtPayload;
    if (!payload.sub) {
      throw new Error('Invalid token payload');
    }
    
    return {
      id: Number(payload.sub),
      uid: payload.sub,
      email: payload.email || '',
      role: payload.role || 'user',
      sub: payload.sub
    };
  } catch (error) {
    console.error('JWT verification failed:', error);
    throw new Error('Invalid or expired token');
  }
}

export const authMiddleware = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.cookies['sb-access-token'] || req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const payload = verifyToken(token);
      req.user = payload;
      next();
    } catch (error) {
      console.error('Authentication error:', error);
      res.status(401).json({ error: 'Invalid authentication' });
    }
  }
}

export const roleMiddleware = (requiredRole: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const userRole = req.user.role;
      if (userRole !== requiredRole) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      next();
    } catch (error) {
      console.error('Role verification error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
