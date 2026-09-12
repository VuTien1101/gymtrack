import nodemailer from "nodemailer";
import { prisma } from "./prisma";

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT ?? 587);
const smtpUser = process.env.SMTP_USER?.trim();
const smtpPassword = process.env.SMTP_PASSWORD?.replace(/\s/g, "");
const emailFrom = process.env.EMAIL_FROM?.trim() || smtpUser;

const transporter =
  smtpHost && smtpUser && smtpPassword && emailFrom
    ? nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: smtpUser, pass: smtpPassword },
      })
    : null;

async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
  type: "REGISTRATION" | "MEMBERSHIP_RECEIPT";
  userId?: number;
}) {
  const base = {
    recipient: input.to,
    subject: input.subject,
    type: input.type,
    userId: input.userId,
  } as const;
  if (!transporter || !emailFrom) {
    await prisma.emailLog.create({ data: { ...base, status: "SKIPPED" } });
    console.warn(
      `Email skipped because SMTP is not configured: ${input.subject} -> ${input.to}`,
    );
    return;
  }
  try {
    await transporter.sendMail({
      from: emailFrom,
      to: input.to,
      subject: input.subject,
      html: input.html,
    });
    await prisma.emailLog.create({
      data: { ...base, status: "SENT", sentAt: new Date() },
    });
  } catch (error) {
    await prisma.emailLog.create({
      data: {
        ...base,
        status: "FAILED",
        error: error instanceof Error ? error.message : "Unknown email error",
      },
    });
    throw error;
  }
}

export function sendRegistrationEmail(input: {
  email: string;
  fullName: string;
  userId?: number;
}) {
  return sendEmail({
    to: input.email,
    subject: "Chào mừng bạn đến với GymTrack",
    html: `<h2>Chào ${input.fullName}</h2><p>Tài khoản GymTrack của bạn đã được tạo thành công.</p>`,
    type: "REGISTRATION",
    userId: input.userId,
  });
}

export function sendMembershipReceiptEmail(input: {
  email: string;
  fullName: string;
  packageName: string;
  price: number;
  startDate: Date;
  endDate: Date;
  userId?: number;
}) {
  return sendEmail({
    to: input.email,
    subject: `Hóa đơn GymTrack - ${input.packageName}`,
    html: `<h2>Thanh toán thành công</h2><p>Xin chào ${input.fullName},</p><p>Gói: <strong>${input.packageName}</strong></p><p>Số tiền: <strong>${input.price.toLocaleString("vi-VN")} VNĐ</strong></p><p>Hiệu lực: ${input.startDate.toLocaleDateString("vi-VN")} - ${input.endDate.toLocaleDateString("vi-VN")}</p>`,
    type: "MEMBERSHIP_RECEIPT",
    userId: input.userId,
  });
}
