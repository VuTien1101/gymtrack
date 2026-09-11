import { Router } from "express";
import {
    checkout,
    createCheckIn,
    getActiveBranchCount,
    listMyCheckIns,
    scanCheckIn,
} from "../controllers/check-in.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.use(authMiddleware);
router.get("/", listMyCheckIns);
router.post("/scan", scanCheckIn);
router.post("/", createCheckIn);
router.post("/:id/checkout", checkout);
router.get("/branches/:branchId/active-count", getActiveBranchCount);

export default router;
