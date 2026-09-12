import { NextFunction, Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "./auth.middleware";

export function requireRoles(...roles: ("MEMBER" | "STAFF" | "ADMIN")[]) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user)
      return res.status(401).json({ success: false, message: "Unauthorized" });
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { role: true },
    });
    if (!user || !roles.includes(user.role)) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Bạn không có quyền thực hiện thao tác này",
        });
    }
    next();
  };
}

export const requireStaff = requireRoles("STAFF", "ADMIN");
export const requireAdmin = requireRoles("ADMIN");
