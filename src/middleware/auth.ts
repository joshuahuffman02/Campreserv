import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { CampgroundRole, Role } from "@prisma/client";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: Role;
    memberships?: { campgroundId: string; role: CampgroundRole }[];
  };
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
        memberships?: { campgroundId: string; role: CampgroundRole }[];
      };
      if (roles && !roles.includes(payload.role)) {
        return res.status(403).json({ message: "Forbidden" });
      }
      req.user = {
        id: payload.userId,
        role: payload.role,
        memberships: payload.memberships,
      };
      next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
  };
};

export const requireCampgroundRole = (allowed: CampgroundRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const campgroundId =
      (req.params && (req.params.campgroundId || req.params.id)) ||
      (req.body && (req.body.campgroundId || req.body.id)) ||
      (req.query && req.query.campgroundId);

    if (!campgroundId) return res.status(400).json({ message: "Campground context required" });
    if (req.user?.role === Role.admin) return next();
    const membership = req.user?.memberships?.find((m) => m.campgroundId === campgroundId);
    if (!membership || !allowed.includes(membership.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
};
