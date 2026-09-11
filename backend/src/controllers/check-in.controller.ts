import { Request, Response } from "express";
import { createUserNotification } from "../lib/notifications";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

function parseId(value: string | string[] | undefined): number | null {
  const id = Number(Array.isArray(value) ? value[0] : value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function createCheckIn(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    const branchId = parseId(req.body.branchId);

    if (!userId || !branchId) {
      return res.status(400).json({
        success: false,
        message: "branchId hợp lệ là bắt buộc",
      });
    }

    const membership = await prisma.membership.findFirst({
      where: {
        userId,
        status: "ACTIVE",
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
      },
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: "Bạn cần có gói tập đang hoạt động để check-in",
      });
    }

    const branch = await prisma.branch.findUnique({ where: { id: branchId } });
    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy chi nhánh",
      });
    }

    const activeCheckIn = await prisma.checkIn.findFirst({
      where: { userId, checkedOutAt: null },
    });

    if (activeCheckIn) {
      return res.status(409).json({
        success: false,
        message: "Bạn đang có một lượt tập chưa checkout",
        data: { checkIn: activeCheckIn },
      });
    }

    const checkIn = await prisma.checkIn.create({
      data: { userId, branchId },
      include: { branch: true },
    });

    await createUserNotification({
      userId,
      type: "CHECKIN",
      title: "Check-in thành công",
      message: `Bạn đang tập tại ${branch.name}.`,
    });

    return res.status(201).json({ success: true, data: { checkIn } });
  } catch (error) {
    console.error("Create check-in error:", error);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
}

export async function scanCheckIn(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    const qrCode =
      typeof req.body.qrCode === "string" ? req.body.qrCode.trim() : "";

    if (!userId || !qrCode) {
      return res.status(400).json({
        success: false,
        message: "qrCode hợp lệ là bắt buộc",
      });
    }

    const branch = await prisma.branch.findUnique({ where: { qrCode } });
    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Mã QR không thuộc chi nhánh GymTrack",
      });
    }

    const activeCheckIn = await prisma.checkIn.findFirst({
      where: { userId, checkedOutAt: null },
    });

    if (activeCheckIn) {
      if (activeCheckIn.branchId !== branch.id) {
        return res.status(409).json({
          success: false,
          message:
            "Bạn đang tập ở chi nhánh khác. Hãy quét đúng mã QR chi nhánh đó để check-out.",
        });
      }

      const checkIn = await prisma.checkIn.update({
        where: { id: activeCheckIn.id },
        data: { checkedOutAt: new Date() },
        include: { branch: true },
      });

      await createUserNotification({
        userId,
        type: "CHECKIN",
        title: "Check-out thành công",
        message: `Bạn đã kết thúc buổi tập tại ${branch.name}.`,
      });

      return res.status(200).json({
        success: true,
        data: { action: "check-out", checkIn },
      });
    }

    const membership = await prisma.membership.findFirst({
      where: {
        userId,
        status: "ACTIVE",
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
      },
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: "Bạn cần có gói tập đang hoạt động để check-in",
      });
    }

    const checkIn = await prisma.checkIn.create({
      data: { userId, branchId: branch.id },
      include: { branch: true },
    });

    await createUserNotification({
      userId,
      type: "CHECKIN",
      title: "Check-in thành công",
      message: `Bạn đang tập tại ${branch.name}.`,
    });

    return res.status(201).json({
      success: true,
      data: { action: "check-in", checkIn },
    });
  } catch (error) {
    console.error("Scan check-in error:", error);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
}

export async function checkout(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    const checkInId = parseId(req.params.id);

    if (!userId || !checkInId) {
      return res.status(400).json({
        success: false,
        message: "ID lượt check-in không hợp lệ",
      });
    }

    const checkIn = await prisma.checkIn.findFirst({
      where: { id: checkInId, userId },
    });

    if (!checkIn) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lượt check-in",
      });
    }

    if (checkIn.checkedOutAt) {
      return res.status(409).json({
        success: false,
        message: "Lượt check-in này đã checkout",
        data: { checkIn },
      });
    }

    const updatedCheckIn = await prisma.checkIn.update({
      where: { id: checkInId },
      data: { checkedOutAt: new Date() },
      include: { branch: true },
    });

    return res.status(200).json({
      success: true,
      data: { checkIn: updatedCheckIn },
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
}

export async function listMyCheckIns(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const from = req.query.from ? new Date(String(req.query.from)) : undefined;
    const to = req.query.to ? new Date(String(req.query.to)) : undefined;

    const checkIns = await prisma.checkIn.findMany({
      where: {
        userId,
        ...(from || to
          ? {
              checkedInAt: {
                ...(from ? { gte: from } : {}),
                ...(to ? { lt: to } : {}),
              },
            }
          : {}),
      },
      include: { branch: true },
      orderBy: { checkedInAt: "desc" },
    });

    return res.status(200).json({ success: true, data: { checkIns } });
  } catch (error) {
    console.error("List check-ins error:", error);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
}

export async function getActiveBranchCount(req: Request, res: Response) {
  try {
    const branchId = parseId(req.params.branchId);
    if (!branchId)
      return res
        .status(400)
        .json({ success: false, message: "branchId không hợp lệ" });

    const count = await prisma.checkIn.count({
      where: { branchId, checkedOutAt: null },
    });

    return res.status(200).json({ success: true, data: { count } });
  } catch (error) {
    console.error("Active branch count error:", error);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
}
