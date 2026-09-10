import { Router } from "express";
import { getMonthlyStatistics } from "../controllers/statistics.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();
router.get("/monthly", authMiddleware, getMonthlyStatistics);
export default router;
