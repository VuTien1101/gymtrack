import { Router } from "express";
import { getDashboard, getMe, updateMe } from "../controllers/user.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/me", authMiddleware, getMe);
router.put("/me", authMiddleware, updateMe);
router.get("/dashboard", authMiddleware, getDashboard);

export default router;
