import cors from "cors";
import express from "express";
import authRoutes from "./routes/auth.routes";
import checkInRoutes from "./routes/check-in.routes";
import branchRoutes from "./routes/branch.routes";
import membershipRoutes from "./routes/membership.routes";
import notificationRoutes from "./routes/notification.routes";
import statisticsRoutes from "./routes/statistics.routes";
import userRoutes from "./routes/user.routes";
import workoutRoutes from "./routes/workout.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "GymTrack API is running 🚀",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/check-ins", checkInRoutes);
app.use("/api/memberships", membershipRoutes);
app.use("/api/branches", branchRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/statistics", statisticsRoutes);

export default app;
