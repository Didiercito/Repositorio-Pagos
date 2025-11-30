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

export function requireRole(requiredRole: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;

    if (!header) {
      return res
        .status(401)
        .json({ success: false, message: 'Missing Authorization header' });
    }

    const token = header.replace('Bearer ', '');
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error('JWT_SECRET no está definida en .env');
    }

    try {
      const decoded = jwt.verify(token, jwtSecret) as UserPayload;
      const roles = decoded.roles || [];

      if (!roles.includes(requiredRole)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You don't have permission",
          requiredRole,
          userRoles: roles,
        });
      }

      req.user = decoded; 
      next();

    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return res
        .status(401)
        .json({ success: false, message: 'Invalid token', error: errorMessage });
    }
  };
}