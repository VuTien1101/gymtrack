import { Response } from "express";
import { prisma } from "../lib/prisma";
import { calculateStreak } from "../lib/streak";
import { AuthRequest } from "../middleware/auth.middleware";

// GET CURRENT USER
export async function getMe(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: req.user.userId,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        address: true,
        dateOfBirth: true,
        gender: true,
        height: true,
        weight: true,
        muscleMass: true,
        bodyFat: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    console.error("Get me error:", error);

    return res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
}

// UPDATE CURRENT USER
export async function updateMe(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const {
      fullName,
      phone,
      address,
      dateOfBirth,
      gender,
      height,
      weight,
      muscleMass,
      bodyFat,
      avatarUrl,
    } = req.body;

    // Kiểm tra số điện thoại đã thuộc user khác chưa
    if (phone) {
      const existingPhone = await prisma.user.findFirst({
        where: {
          phone,
          NOT: {
            id: req.user.userId,
          },
        },
      });

      if (existingPhone) {
        return res.status(409).json({
          success: false,
          message: "Số điện thoại đã được sử dụng",
        });
      }
    }

    const user = await prisma.user.update({
      where: {
        id: req.user.userId,
      },
      data: {
        ...(fullName !== undefined && { fullName }),
        ...(phone !== undefined && { phone: phone || null }),
        ...(address !== undefined && { address: address || null }),
        ...(dateOfBirth !== undefined && {
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        }),
        ...(gender !== undefined && {
          gender: gender || null,
        }),
        ...(height !== undefined && {
          height: height === null ? null : Number(height),
        }),
        ...(weight !== undefined && {
          weight: weight === null ? null : Number(weight),
        }),
        ...(muscleMass !== undefined && {
          muscleMass: muscleMass === null ? null : Number(muscleMass),
        }),
        ...(bodyFat !== undefined && {
          bodyFat: bodyFat === null ? null : Number(bodyFat),
        }),
        ...(avatarUrl !== undefined && {
          avatarUrl: avatarUrl || null,
        }),
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        address: true,
        dateOfBirth: true,
        gender: true,
        height: true,
        weight: true,
        muscleMass: true,
        bodyFat: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Cập nhật thông tin thành công",
      data: {
        user,
      },
    });
  } catch (error) {
    console.error("Update me error:", error);

    return res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
}

export async function getDashboard(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const [
      user,
      membership,
      activeCheckIn,
      monthlyCheckIns,
      latestCheckIn,
      allCheckIns,
    ] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        include: { preferredBranch: true },
      }),
      prisma.membership.findFirst({
        where: { userId, status: "ACTIVE", endDate: { gte: now } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.checkIn.findFirst({
        where: { userId, checkedOutAt: null },
        include: { branch: true },
      }),
      prisma.checkIn.findMany({
        where: {
          userId,
          checkedInAt: { gte: monthStart, lt: nextMonthStart },
        },
        select: { checkedInAt: true, checkedOutAt: true },
        orderBy: { checkedInAt: "desc" },
      }),
      prisma.checkIn.findFirst({
        where: { userId },
        include: { branch: true },
        orderBy: { checkedInAt: "desc" },
      }),
      prisma.checkIn.findMany({
        where: { userId },
        select: { checkedInAt: true },
      }),
    ]);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy người dùng" });
    }

    const selectedBranch = user.preferredBranch ?? latestCheckIn?.branch;
    const activeCount = selectedBranch
      ? await prisma.checkIn.count({
          where: { branchId: selectedBranch.id, checkedOutAt: null },
        })
      : 0;

    const totalMinutes = monthlyCheckIns.reduce((total, checkIn) => {
      const end = checkIn.checkedOutAt ?? now;
      return (
        total +
        Math.max(0, end.getTime() - checkIn.checkedInAt.getTime()) / 60000
      );
    }, 0);

    const workoutDays = new Set(
      monthlyCheckIns.map((checkIn) =>
        checkIn.checkedInAt.toISOString().slice(0, 10),
      ),
    );
    const streak = calculateStreak(
      allCheckIns.map((checkIn) => checkIn.checkedInAt),
    );

    return res.status(200).json({
      success: true,
      data: {
        user,
        membership,
        activeCheckIn,
        branch: selectedBranch ?? null,
        branchActiveCount: activeCount,
        stats: {
          checkInCount: workoutDays.size,
          workoutDays: workoutDays.size,
          streak,
          totalMinutes: Math.round(totalMinutes),
        },
      },
    });
  } catch (error) {
    console.error("Get dashboard error:", error);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
}
