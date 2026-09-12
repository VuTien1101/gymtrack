import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

export async function getAdminDashboard(_req: AuthRequest, res: Response) {
  const now = new Date();
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayEnd = new Date(dayStart.getTime() + 86400000);
  const expiryLimit = new Date(now.getTime() + 7 * 86400000);

  const [memberCount, activeCheckIns, todayCheckIns, expiringMemberships] =
    await Promise.all([
      prisma.user.count({ where: { role: "MEMBER" } }),
      prisma.checkIn.count({ where: { checkedOutAt: null } }),
      prisma.checkIn.count({
        where: { checkedInAt: { gte: dayStart, lt: dayEnd } },
      }),
      prisma.membership.count({
        where: { status: "ACTIVE", endDate: { gte: now, lte: expiryLimit } },
      }),
    ]);

  return res.json({
    success: true,
    data: { memberCount, activeCheckIns, todayCheckIns, expiringMemberships },
  });
}

export async function listMembers(req: AuthRequest, res: Response) {
  const search =
    typeof req.query.search === "string" ? req.query.search.trim() : "";
  const users = await prisma.user.findMany({
    where: {
      role: "MEMBER",
      ...(search
        ? {
            OR: [
              { fullName: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      role: true,
      memberships: { orderBy: { endDate: "desc" }, take: 1 },
      _count: { select: { checkIns: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return res.json({ success: true, data: { members: users } });
}

export async function deleteMember(req: AuthRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const memberId = Number(req.params.id);
  if (!Number.isInteger(memberId) || memberId <= 0) {
    return res.status(400).json({ success: false, message: "id không hợp lệ" });
  }
  if (memberId === req.user.userId) {
    return res
      .status(400)
      .json({ success: false, message: "Không thể tự xóa tài khoản của mình" });
  }

  const member = await prisma.user.findUnique({
    where: { id: memberId },
    select: { id: true, role: true },
  });
  if (!member) {
    return res
      .status(404)
      .json({ success: false, message: "Không tìm thấy hội viên" });
  }
  if (member.role !== "MEMBER") {
    return res
      .status(403)
      .json({ success: false, message: "Chỉ được xóa tài khoản hội viên" });
  }

  await prisma.user.delete({ where: { id: memberId } });
  return res.json({ success: true, message: "Đã xóa tài khoản hội viên" });
}

export async function listAdminBranches(_req: AuthRequest, res: Response) {
  const branches = await prisma.branch.findMany({
    include: { _count: { select: { checkIns: true } } },
    orderBy: { name: "asc" },
  });
  return res.json({ success: true, data: { branches } });
}

export async function createBranch(req: AuthRequest, res: Response) {
  const { name, address, phone, qrCode } = req.body;
  if (!name || !address || !qrCode)
    return res
      .status(400)
      .json({ success: false, message: "name, address và qrCode là bắt buộc" });
  const branch = await prisma.branch.create({
    data: { name, address, phone: phone || null, qrCode },
  });
  return res.status(201).json({ success: true, data: { branch } });
}

export async function updateBranch(req: AuthRequest, res: Response) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0)
    return res.status(400).json({ success: false, message: "id không hợp lệ" });
  const branch = await prisma.branch.update({
    where: { id },
    data: {
      ...(req.body.name !== undefined ? { name: req.body.name } : {}),
      ...(req.body.address !== undefined ? { address: req.body.address } : {}),
      ...(req.body.phone !== undefined
        ? { phone: req.body.phone || null }
        : {}),
      ...(req.body.qrCode !== undefined ? { qrCode: req.body.qrCode } : {}),
    },
  });
  return res.json({ success: true, data: { branch } });
}

export async function getCheckInStatistics(req: AuthRequest, res: Response) {
  const month = typeof req.query.month === "string" ? req.query.month : "";
  const match = /^(\d{4})-(\d{2})$/.exec(month);
  const now = new Date();
  const year = match ? Number(match[1]) : now.getFullYear();
  const monthIndex = match ? Number(match[2]) - 1 : now.getMonth();
  const from = new Date(year, monthIndex, 1);
  const to = new Date(year, monthIndex + 1, 1);
  const [total, byBranch] = await Promise.all([
    prisma.checkIn.count({ where: { checkedInAt: { gte: from, lt: to } } }),
    prisma.checkIn.groupBy({
      by: ["branchId"],
      where: { checkedInAt: { gte: from, lt: to } },
      _count: { _all: true },
      orderBy: { _count: { branchId: "desc" } },
    }),
  ]);
  const branches = await prisma.branch.findMany({
    where: { id: { in: byBranch.map((item) => item.branchId) } },
    select: { id: true, name: true },
  });
  return res.json({
    success: true,
    data: {
      totalCheckIns: total,
      byBranch: byBranch.map((item) => ({
        branchId: item.branchId,
        branchName:
          branches.find((branch) => branch.id === item.branchId)?.name ??
          "Không rõ",
        count: item._count._all,
      })),
    },
  });
}
