import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

export async function listExercises(req: Request, res: Response) {
  const muscleGroup =
    typeof req.query.muscleGroup === "string"
      ? req.query.muscleGroup
      : undefined;
  const exercises = await prisma.exercise.findMany({
    where: muscleGroup ? { muscleGroup } : undefined,
    orderBy: { name: "asc" },
  });
  return res.json({ success: true, data: { exercises } });
}

export async function listWorkouts(req: AuthRequest, res: Response) {
  if (!req.user)
    return res.status(401).json({ success: false, message: "Unauthorized" });
  const from =
    typeof req.query.from === "string" ? new Date(req.query.from) : undefined;
  const to =
    typeof req.query.to === "string" ? new Date(req.query.to) : undefined;
  const workouts = await prisma.workout.findMany({
    where: {
      userId: req.user.userId,
      ...(from || to
        ? {
            workoutDate: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lt: to } : {}),
            },
          }
        : {}),
    },
    include: { exercises: { include: { exercise: true } } },
    orderBy: { workoutDate: "desc" },
  });
  return res.json({ success: true, data: { workouts } });
}

export async function getWorkout(req: AuthRequest, res: Response) {
  if (!req.user)
    return res.status(401).json({ success: false, message: "Unauthorized" });
  const id = Number(req.params.id);
  const workout = await prisma.workout.findFirst({
    where: { id, userId: req.user.userId },
    include: { exercises: { include: { exercise: true } } },
  });
  if (!workout)
    return res
      .status(404)
      .json({ success: false, message: "Không tìm thấy buổi tập" });
  return res.json({ success: true, data: { workout } });
}

export async function createWorkout(req: AuthRequest, res: Response) {
  if (!req.user)
    return res.status(401).json({ success: false, message: "Unauthorized" });
  const { name, workoutDate, duration, status, exercises } = req.body;
  if (!name || !workoutDate || !Array.isArray(exercises))
    return res
      .status(400)
      .json({
        success: false,
        message: "name, workoutDate và exercises là bắt buộc",
      });
  const workout = await prisma.workout.create({
    data: {
      userId: req.user.userId,
      name,
      workoutDate: new Date(workoutDate),
      duration: duration == null ? null : Number(duration),
      status: status || "COMPLETED",
      exercises: {
        create: exercises.map(
          (item: {
            exerciseId: number;
            sets?: number;
            reps?: number;
            weight?: number;
            restTime?: number;
          }) => ({
            exerciseId: Number(item.exerciseId),
            sets: item.sets,
            reps: item.reps,
            weight: item.weight,
            restTime: item.restTime,
          }),
        ),
      },
    },
    include: { exercises: { include: { exercise: true } } },
  });
  return res.status(201).json({ success: true, data: { workout } });
}
