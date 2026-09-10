import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

export async function listNotifications(req: AuthRequest, res: Response) {
  if (!req.user)
    return res.status(401).json({ success: false, message: "Unauthorized" });
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user.userId },
    orderBy: { createdAt: "desc" },
  });
  return res.json({ success: true, data: { notifications } });
}

export async function markNotificationRead(req: AuthRequest, res: Response) {
  if (!req.user)
    return res.status(401).json({ success: false, message: "Unauthorized" });
  const id = Number(req.params.id);
  const notification = await prisma.notification.updateMany({
    where: { id, userId: req.user.userId },
    data: { isRead: true },
  });
  if (!notification.count)
    return res
      .status(404)
      .json({ success: false, message: "Không tìm thấy thông báo" });
  return res.json({ success: true });
}

export async function markAllNotificationsRead(
  req: AuthRequest,
  res: Response,
) {
  if (!req.user)
    return res.status(401).json({ success: false, message: "Unauthorized" });
  await prisma.notification.updateMany({
    where: { userId: req.user.userId, isRead: false },
    data: { isRead: true },
  });
  return res.json({ success: true });
}
