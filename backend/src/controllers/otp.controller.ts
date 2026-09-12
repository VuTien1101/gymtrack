import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { sendOtpSms } from "../lib/sms";
import { isValidVietnamesePhone } from "../lib/validation";

function createCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function issueOtp(
  phone: string,
  purpose: "REGISTRATION" | "PASSWORD_RESET",
) {
  const code = createCode();
  await prisma.otpCode.deleteMany({ where: { phone, purpose } });
  await prisma.otpCode.create({
    data: {
      phone,
      purpose,
      codeHash: await bcrypt.hash(code, 10),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });
  await sendOtpSms(phone, code);
}

export async function requestRegistrationOtp(req: Request, res: Response) {
  const phone = typeof req.body.phone === "string" ? req.body.phone.trim() : "";
  if (!isValidVietnamesePhone(phone))
    return res
      .status(400)
      .json({ success: false, message: "Số điện thoại không hợp lệ" });
  if (await prisma.user.findUnique({ where: { phone } }))
    return res
      .status(409)
      .json({ success: false, message: "Số điện thoại đã được sử dụng" });
  await issueOtp(phone, "REGISTRATION");
  return res.json({ success: true, message: "Đã gửi mã OTP" });
}

export async function verifyRegistrationOtp(req: Request, res: Response) {
  return verifyOtp(req, res, "REGISTRATION");
}

export async function requestPasswordResetOtp(req: Request, res: Response) {
  const phone = typeof req.body.phone === "string" ? req.body.phone.trim() : "";
  if (!isValidVietnamesePhone(phone))
    return res
      .status(400)
      .json({ success: false, message: "Số điện thoại không hợp lệ" });
  if (!(await prisma.user.findUnique({ where: { phone } })))
    return res
      .status(404)
      .json({ success: false, message: "Không tìm thấy tài khoản" });
  await issueOtp(phone, "PASSWORD_RESET");
  return res.json({ success: true, message: "Đã gửi mã OTP" });
}

export async function verifyPasswordResetOtp(req: Request, res: Response) {
  return verifyOtp(req, res, "PASSWORD_RESET");
}

async function verifyOtp(
  req: Request,
  res: Response,
  purpose: "REGISTRATION" | "PASSWORD_RESET",
) {
  const phone = typeof req.body.phone === "string" ? req.body.phone.trim() : "";
  const code = typeof req.body.code === "string" ? req.body.code.trim() : "";
  if (!isValidVietnamesePhone(phone) || !/^\d{6}$/.test(code))
    return res
      .status(400)
      .json({ success: false, message: "Thông tin OTP không hợp lệ" });
  const otp = await prisma.otpCode.findFirst({
    where: { phone, purpose, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });
  if (
    !otp ||
    otp.expiresAt < new Date() ||
    otp.attempts >= 5 ||
    !(await bcrypt.compare(code, otp.codeHash))
  ) {
    if (otp)
      await prisma.otpCode.update({
        where: { id: otp.id },
        data: { attempts: { increment: 1 } },
      });
    return res
      .status(400)
      .json({ success: false, message: "OTP không đúng hoặc đã hết hạn" });
  }
  await prisma.otpCode.update({
    where: { id: otp.id },
    data: { consumedAt: new Date() },
  });
  return res.json({ success: true, message: "OTP hợp lệ" });
}
