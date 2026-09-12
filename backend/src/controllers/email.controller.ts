import { Response } from "express";
import {
    sendMembershipReceiptEmail,
    sendRegistrationEmail,
} from "../lib/email";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

export async function listMyEmailLogs(req: AuthRequest, res: Response) {
  if (!req.user)
    return res.status(401).json({ success: false, message: "Unauthorized" });
  const emails = await prisma.emailLog.findMany({
    where: { userId: req.user.userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return res.json({ success: true, data: { emails } });
}

export async function resendRegistrationEmail(req: AuthRequest, res: Response) {
  if (!req.user)
    return res.status(401).json({ success: false, message: "Unauthorized" });
  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  if (!user)
    return res
      .status(404)
      .json({ success: false, message: "Không tìm thấy người dùng" });
  await sendRegistrationEmail({
    email: user.email,
    fullName: user.fullName,
    userId: user.id,
  });
  return res.json({ success: true, message: "Đã gửi lại email xác nhận" });
}

export async function resendMembershipReceipt(req: AuthRequest, res: Response) {
  if (!req.user)
    return res.status(401).json({ success: false, message: "Unauthorized" });
  const membership = await prisma.membership.findFirst({
    where: { id: Number(req.params.id), userId: req.user.userId },
    include: { plan: true, user: true },
  });
  if (!membership || !membership.plan)
    return res
      .status(404)
      .json({ success: false, message: "Không tìm thấy gói tập" });
  await sendMembershipReceiptEmail({
    email: membership.user.email,
    fullName: membership.user.fullName,
    packageName: membership.packageName,
    price: membership.plan.price,
    startDate: membership.startDate,
    endDate: membership.endDate,
    userId: membership.userId,
  });
  return res.json({ success: true, message: "Đã gửi lại hóa đơn" });
}
