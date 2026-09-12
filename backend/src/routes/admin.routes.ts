import { Router } from "express";
import {
    createBranch,
    deleteMember,
    getAdminDashboard,
    getCheckInStatistics,
    listAdminBranches,
    listMembers,
    updateBranch,
} from "../controllers/admin.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireAdmin, requireStaff } from "../middleware/role.middleware";

const router = Router();
router.use(authMiddleware, requireStaff);
router.get("/dashboard", getAdminDashboard);
router.get("/members", listMembers);
router.delete("/members/:id", requireAdmin, deleteMember);
router.get("/branches", listAdminBranches);
router.get("/statistics/check-ins", getCheckInStatistics);
router.post("/branches", requireAdmin, createBranch);
router.patch("/branches/:id", requireAdmin, updateBranch);

export default router;
