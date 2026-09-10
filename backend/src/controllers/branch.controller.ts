import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

export async function listBranches(_req: Request, res: Response) {
  const branches = await prisma.branch.findMany({ orderBy: { name: "asc" } });
  return res.json({ success: true, data: { branches } });
}

export async function setPreferredBranch(req: AuthRequest, res: Response) {
  const branchId = Number(req.body.branchId);
  if (!req.user)
    return res.status(401).json({ success: false, message: "Unauthorized" });
  if (!Number.isInteger(branchId) || branchId <= 0)
    return res
      .status(400)
      .json({ success: false, message: "branchId không hợp lệ" });

  const branch = await prisma.branch.findUnique({ where: { id: branchId } });
  if (!branch)
    return res
      .status(404)
      .json({ success: false, message: "Không tìm thấy chi nhánh" });

  await prisma.user.update({
    where: { id: req.user.userId },
    data: { preferredBranchId: branchId },
  });
  return res.json({ success: true, data: { branch } });
}
