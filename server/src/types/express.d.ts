import { UserRole } from '@prisma/client';
import { User } from '@supabase/auth-helpers-nextjs';

declare global {
  namespace Express {
    interface Request {
      user?: User & {
        role: UserRole;
      };
    }
  }
}
