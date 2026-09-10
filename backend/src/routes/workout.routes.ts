import { Router } from "express";
import {
  createWorkout,
  getWorkout,
  listExercises,
  listWorkouts,
} from "../controllers/workout.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();
router.get("/exercises", listExercises);
router.use(authMiddleware);
router.get("/", listWorkouts);
router.get("/:id", getWorkout);
router.post("/", createWorkout);
export default router;
