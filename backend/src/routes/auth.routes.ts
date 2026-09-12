import { Router } from "express";
import { login, register } from "../controllers/auth.controller";
import { changePassword } from "../controllers/user.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.patch("/change-password", authMiddleware, changePassword);

export default router;
