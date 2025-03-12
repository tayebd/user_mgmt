import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';

interface ValidateRequestOptions {
  body?: AnyZodObject;
  query?: AnyZodObject;
  params?: AnyZodObject;
}

export function validateRequest(schemas: ValidateRequestOptions): (req: Request, res: Response, next: NextFunction) => Promise<void>;
