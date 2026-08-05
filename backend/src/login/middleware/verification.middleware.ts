// backend/src/login/middleware/verification.middleware.ts

import type { Response, NextFunction } from "express";
import { authService } from "../services/auth.service";
import type { AuthRequest, Role } from "../types/user.types";

// VERIFY TOKEN
const verifyToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const token = authService.getTokenFrom(req);

  if (!token) {
    return res.status(401).json({
      status: false,
      message: "No token provided",
    });
  }

  const verification = authService.verifyAccessToken(token);

  if (!verification.verified) {
    return res.status(401).json({
      status: false,
      message: "Invalid token",
    });
  }

  const payload = verification.data as {
    id: string;
    username: string;
    role: Role;
  };

  req.user = {
    id: payload.id,
    username: payload.username,
    role: payload.role,
  };

  return next();
};

// ROLE CHECK
const checkRole = (requiredRole: Role) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user || user.role !== requiredRole) {
      return res.status(403).json({
        status: false,
        message: "Forbidden",
      });
    }

    return next();
  };
};

export const middleware = {
  verifyToken,
  checkRole,
};