import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { Role } from "@prisma/client";

export interface AuthRequest extends Request {
  user?: { id: string; role: Role };
}

export const requireAuth = (roles?: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const token = header.replace("Bearer ", "");
    try {
      const payload = jwt.verify(token, env.jwtSecret) as {
        userId: string;
        role: Role;
      };
      if (roles && !roles.includes(payload.role)) {
        return res.status(403).json({ message: "Forbidden" });
      }
      req.user = { id: payload.userId, role: payload.role };
      next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
  };
};
