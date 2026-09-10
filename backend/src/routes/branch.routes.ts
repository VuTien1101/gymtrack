import { Router } from "express";
import {
  listBranches,
  setPreferredBranch,
} from "../controllers/branch.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();
router.get("/", listBranches);
router.put("/preferred", authMiddleware, setPreferredBranch);
export default router;
