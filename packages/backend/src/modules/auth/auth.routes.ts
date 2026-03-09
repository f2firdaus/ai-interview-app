import { Router } from "express";
import * as ctrl from "./auth.controller";
import rateLimit from "express-rate-limit";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();

// Limit auth requests to 10 per 15 minutes per IP to prevent brute force attacks
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: "Too many requests from this IP, please try again after 15 minutes" },
    standardHeaders: true,
    legacyHeaders: false,
});

router.post("/request", authLimiter, ctrl.requestOtp);
router.post("/verify", authLimiter, ctrl.loginOtp);
router.post("/signup", authLimiter, ctrl.signup);
router.post("/login", authLimiter, ctrl.loginEmail);
router.get("/me", authenticate, ctrl.getMe);
router.put("/me", authenticate, ctrl.updateMe);
router.put("/password", authenticate, ctrl.changePassword);

export default router;