import { Router } from "express";
import {
    listMyEmailLogs,
    resendMembershipReceipt,
    resendRegistrationEmail,
} from "../controllers/email.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();
router.use(authMiddleware);
router.get("/me", listMyEmailLogs);
router.post("/registration/resend", resendRegistrationEmail);
router.post("/membership/:id/resend", resendMembershipReceipt);
export default router;
