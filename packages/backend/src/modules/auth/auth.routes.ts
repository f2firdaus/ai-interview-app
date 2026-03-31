import { Router } from "express";
import * as ctrl from "./auth.controller";
import rateLimit from "express-rate-limit";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();

const normalizeEmail = (value: unknown) =>
    typeof value === "string" ? value.trim().toLowerCase() : "";

const authKeyGenerator = (req: any) => {
    const email = normalizeEmail(req.body?.email);
    return email ? `${req.ip}:${email}` : req.ip;
};

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    keyGenerator: authKeyGenerator,
    skipSuccessfulRequests: true,
    message: { error: "Too many failed login attempts. Please wait 15 minutes and try again." },
    standardHeaders: true,
    legacyHeaders: false,
});

const signupLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    keyGenerator: authKeyGenerator,
    skipSuccessfulRequests: true,
    message: { error: "Too many signup attempts. Please wait 15 minutes and try again." },
    standardHeaders: true,
    legacyHeaders: false,
});

const forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    keyGenerator: authKeyGenerator,
    message: { error: "Too many password reset requests. Please wait 15 minutes and try again." },
    standardHeaders: true,
    legacyHeaders: false,
});

router.post("/signup", signupLimiter, ctrl.signup);
router.post("/login", loginLimiter, ctrl.loginEmail);
router.post("/forgot-password", forgotPasswordLimiter, ctrl.forgotPassword);
router.get("/me", authenticate, ctrl.getMe);
router.put("/me", authenticate, ctrl.updateMe);
router.put("/password", authenticate, ctrl.changePassword);
router.delete("/account", authenticate, ctrl.deleteAccount);

export default router;
