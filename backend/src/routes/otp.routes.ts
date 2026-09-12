import { Router } from "express";
import {
    requestPasswordResetOtp,
    requestRegistrationOtp,
    verifyPasswordResetOtp,
    verifyRegistrationOtp,
} from "../controllers/otp.controller";

const router = Router();
router.post("/registration/request", requestRegistrationOtp);
router.post("/registration/verify", verifyRegistrationOtp);
router.post("/password-reset/request", requestPasswordResetOtp);
router.post("/password-reset/verify", verifyPasswordResetOtp);
export default router;
