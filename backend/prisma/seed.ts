import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import "dotenv/config";
import { PrismaClient } from "./../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required");
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    await prisma.user.upsert({
      where: { email: process.env.ADMIN_EMAIL.toLowerCase() },
      update: { role: "ADMIN" },
      create: {
        email: process.env.ADMIN_EMAIL.toLowerCase(),
        passwordHash: await bcrypt.hash(process.env.ADMIN_PASSWORD, 10),
        fullName: process.env.ADMIN_NAME ?? "GymTrack Admin",
        role: "ADMIN",
      },
    });
  }

  const plans = [
    {
      name: "Basic Gym 1 Tháng",
      durationDays: 30,
      price: 299000,
      description: "Gói tập cơ bản trong 30 ngày",
    },
    {
      name: "Premium 3 Tháng",
      durationDays: 90,
      price: 699000,
      description: "Tập luyện trong 3 tháng",
    },
    {
      name: "Pro Ultimate 3+1",
      durationDays: 120,
      price: 899000,
      description: "Tặng thêm 1 tháng và tập liên chi nhánh",
    },
  ];
  for (const plan of plans) {
    await prisma.membershipPlan.upsert({
      where: { name: plan.name },
      update: plan,
      create: plan,
    });
  }

  const branches = [
    {
      name: "Nguyễn Văn Linh",
      address: "Quận Ninh Kiều, Cần Thơ",
      phone: "02923888888",
      qrCode: "branch-nguyen-van-linh",
    },
    {
      name: "3/2",
      address: "Đường 3/2, Cần Thơ",
      phone: "02923999999",
      qrCode: "branch-3-2",
    },
    {
      name: "Cách Mạng Tháng 8",
      address: "Đường Cách Mạng Tháng 8, Cần Thơ",
      phone: "02923777777",
      qrCode: "branch-cach-mang-thang-8",
    },
  ];
  for (const branch of branches) {
    await prisma.branch.upsert({
      where: { qrCode: branch.qrCode },
      update: branch,
      create: branch,
    });
  }

  const exercises = [
    ["Barbell Bench Press", "Ngực"],
    ["Lat Pulldown", "Lưng"],
    ["Barbell Squat", "Chân"],
    ["Shoulder Press", "Vai"],
    ["Barbell Curl", "Tay"],
    ["Plank", "Core"],
  ];
  for (const [name, muscleGroup] of exercises) {
    await prisma.exercise.upsert({
      where: { name },
      update: { muscleGroup },
      create: { name, muscleGroup },
    });
  }
}

main().finally(() => prisma.$disconnect());
