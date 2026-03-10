import { Router } from "express";
import * as ctrl from "./auth.controller";
import rateLimit from "express-rate-limit";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: "Too many requests from this IP, please try again after 15 minutes" },
    standardHeaders: true,
    legacyHeaders: false,
});

router.post("/signup", authLimiter, ctrl.signup);
router.post("/login", authLimiter, ctrl.loginEmail);
router.post("/forgot-password", authLimiter, ctrl.forgotPassword);
router.get("/me", authenticate, ctrl.getMe);
router.put("/me", authenticate, ctrl.updateMe);
router.put("/password", authenticate, ctrl.changePassword);
router.delete("/account", authenticate, ctrl.deleteAccount);

export default router;