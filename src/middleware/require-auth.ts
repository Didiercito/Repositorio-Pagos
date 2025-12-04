import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

interface UserPayload {
  userId: number;
  email: string;
  roles: string[];
  stateId?: number | null;
  municipalityId?: number | null;
  kitchenId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Response | void { 
  const header = req.headers.authorization;

  if (!header) {
    return res
      .status(401)
      .json({ success: false, message: 'Missing Authorization header' });
  }

  const token = header.replace('Bearer ', '');
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    return res
      .status(500)
      .json({ success: false, message: 'JWT_SECRET environment variable missing' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as UserPayload;
    req.user = decoded;

    return next();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res
      .status(401)
      .json({ success: false, message: 'Invalid token', error: errorMessage });
  }
}
