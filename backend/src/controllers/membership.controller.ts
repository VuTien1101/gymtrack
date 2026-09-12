import { Request, Response } from "express";
import { sendMembershipReceiptEmail } from "../lib/email";
import { createUserNotification } from "../lib/notifications";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

export async function listPlans(_req: Request, res: Response) {
  const plans = await prisma.membershipPlan.findMany({
    where: { isActive: true },
    orderBy: { price: "asc" },
  });
  return res.json({ success: true, data: { plans } });
}

export async function getMyMemberships(req: AuthRequest, res: Response) {
  if (!req.user)
    return res.status(401).json({ success: false, message: "Unauthorized" });
  const memberships = await prisma.membership.findMany({
    where: { userId: req.user.userId },
    include: { plan: true },
    orderBy: { startDate: "desc" },
  });
  return res.json({ success: true, data: { memberships } });
}

export async function subscribe(req: AuthRequest, res: Response) {
  if (!req.user)
    return res.status(401).json({ success: false, message: "Unauthorized" });
  const planId = Number(req.body.planId);
  if (!Number.isInteger(planId) || planId <= 0) {
    return res
      .status(400)
      .json({ success: false, message: "planId không hợp lệ" });
  }

  const plan = await prisma.membershipPlan.findFirst({
    where: { id: planId, isActive: true },
  });
  if (!plan)
    return res
      .status(404)
      .json({ success: false, message: "Không tìm thấy gói tập" });

  const now = new Date();
  const current = await prisma.membership.findFirst({
    where: { userId: req.user.userId, status: "ACTIVE", endDate: { gte: now } },
    orderBy: { endDate: "desc" },
  });
  const startDate = current ? current.endDate : now;
  const endDate = new Date(startDate.getTime() + plan.durationDays * 86400000);

  const membership = await prisma.membership.create({
    data: {
      userId: req.user.userId,
      planId: plan.id,
      packageName: plan.name,
      startDate,
      endDate,
      status: "ACTIVE",
    },
    include: { plan: true },
  });
  await createUserNotification({
    userId: req.user.userId,
    type: "MEMBERSHIP",
    title: "Đăng ký gói thành công",
    message: `${plan.name} có hiệu lực từ ${startDate.toLocaleDateString("vi-VN")}.`,
  });
  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  if (user) {
    await sendMembershipReceiptEmail({
      email: user.email,
      fullName: user.fullName,
      packageName: plan.name,
      price: plan.price,
      startDate,
      endDate,
      userId: user.id,
    }).catch((error) =>
      console.error("Membership receipt email error:", error),
    );
  }
  return res.status(201).json({ success: true, data: { membership } });
}
