import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

export async function getMonthlyStatistics(req: AuthRequest, res: Response) {
  if (!req.user)
    return res.status(401).json({ success: false, message: "Unauthorized" });

  const requestedMonth =
    typeof req.query.month === "string" ? req.query.month : undefined;
  const [yearText, monthText] = (requestedMonth ?? "").split("-");
  const year = Number(yearText) || new Date().getFullYear();
  const month = (Number(monthText) || new Date().getMonth() + 1) - 1;
  const from = new Date(year, month, 1);
  const to = new Date(year, month + 1, 1);

  const checkIns = await prisma.checkIn.findMany({
    where: { userId: req.user.userId, checkedInAt: { gte: from, lt: to } },
    include: { branch: true },
    orderBy: { checkedInAt: "asc" },
  });

  const now = new Date();
  const totalMinutes = checkIns.reduce((sum, item) => {
    const end = item.checkedOutAt ?? now;
    return (
      sum + Math.max(0, end.getTime() - item.checkedInAt.getTime()) / 60000
    );
  }, 0);
  const hourCounts = new Map<number, number>();
  const branchCounts = new Map<number, { name: string; count: number }>();
  const days = new Set<string>();

  for (const item of checkIns) {
    days.add(item.checkedInAt.toISOString().slice(0, 10));
    const hour = item.checkedInAt.getHours();
    hourCounts.set(hour, (hourCounts.get(hour) ?? 0) + 1);
    const current = branchCounts.get(item.branchId) ?? {
      name: item.branch.name,
      count: 0,
    };
    current.count += 1;
    branchCounts.set(item.branchId, current);
  }

  let streak = 0;
  const cursor = new Date(year, month + 1, 0);
  cursor.setHours(0, 0, 0, 0);
  if (!days.has(cursor.toISOString().slice(0, 10))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (true) {
    const key = cursor.toISOString().slice(0, 10);
    if (!days.has(key)) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  const usualHour =
    [...hourCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const favoriteBranch =
    [...branchCounts.values()].sort((a, b) => b.count - a.count)[0] ?? null;

  return res.json({
    success: true,
    data: {
      month: `${year}-${String(month + 1).padStart(2, "0")}`,
      workoutDays: days.size,
      checkInCount: days.size,
      totalMinutes: Math.round(totalMinutes),
      streak,
      usualHour,
      favoriteBranch,
    },
  });
}
