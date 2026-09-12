import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { sendRegistrationEmail } from "../lib/email";
import { prisma } from "../lib/prisma";
import {
    isValidEmail,
    isValidPassword,
    isValidVietnamesePhone,
    parseDateOfBirth,
} from "../lib/validation";

const JWT_SECRET: string = process.env.JWT_SECRET ?? "";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in .env");
}

function generateToken(userId: number, email: string): string {
  return jwt.sign(
    {
      userId,
      email,
    },
    JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );
}

// REGISTER
export async function register(req: Request, res: Response) {
  try {
    const { email, password, fullName, phone, address, dateOfBirth } = req.body;

    if (
      !email ||
      !password ||
      !fullName ||
      !phone ||
      !address ||
      !dateOfBirth
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Tên, email, số điện thoại, ngày sinh, địa chỉ và mật khẩu là bắt buộc",
      });
    }

    if (!isValidEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Email không hợp lệ" });
    }
    if (!isValidVietnamesePhone(phone)) {
      return res
        .status(400)
        .json({ success: false, message: "Số điện thoại không hợp lệ" });
    }
    if (!parseDateOfBirth(dateOfBirth)) {
      return res
        .status(400)
        .json({ success: false, message: "Ngày sinh không hợp lệ" });
    }
    if (!isValidPassword(password)) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu phải có ít nhất 6 ký tự",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingEmail = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "Email đã được sử dụng",
      });
    }

    if (phone) {
      const existingPhone = await prisma.user.findUnique({
        where: { phone },
      });

      if (existingPhone) {
        return res.status(409).json({
          success: false,
          message: "Số điện thoại đã được sử dụng",
        });
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        fullName,
        phone,
        address,
        dateOfBirth: parseDateOfBirth(dateOfBirth) as Date,
      },
    });

    const token = generateToken(user.id, user.email);
    await sendRegistrationEmail({
      email: user.email,
      fullName: user.fullName,
      userId: user.id,
    }).catch((error) => console.error("Registration email error:", error));

    return res.status(201).json({
      success: true,
      message: "Đăng ký thành công",
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          phone: user.phone,
          address: user.address,
          dateOfBirth: user.dateOfBirth,
        },
      },
    });
  } catch (error) {
    console.error("Register error:", error);

    return res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
}

// LOGIN
export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email và password là bắt buộc",
      });
    }

    const normalizedEmail =
      typeof email === "string" ? email.trim().toLowerCase() : "";
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng",
      });
    }

    const token = generateToken(user.id, user.email);

    return res.status(200).json({
      success: true,
      message: "Đăng nhập thành công",
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          phone: user.phone,
          address: user.address,
          dateOfBirth: user.dateOfBirth,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
}
