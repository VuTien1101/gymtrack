import { prisma } from "./prisma";

export async function createUserNotification(input: {
  userId: number;
  title: string;
  message: string;
  type: "MEMBERSHIP" | "CHECKIN" | "SYSTEM";
}) {
  try {
    await prisma.notification.create({ data: input });
  } catch (error) {
    console.error("Create notification error:", error);
  }
}
