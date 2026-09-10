import { Router } from "express";
import {
  getMyMemberships,
  listPlans,
  subscribe,
} from "../controllers/membership.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();
router.get("/plans", listPlans);
router.get("/me", authMiddleware, getMyMemberships);
router.post("/subscribe", authMiddleware, subscribe);
export default router;
