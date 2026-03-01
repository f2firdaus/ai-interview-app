import { Router } from "express";
import * as ctrl from "./auth.controller";

const router = Router();

router.post("/request", ctrl.requestOtp);
router.post("/verify", ctrl.loginOtp);
router.post("/signup", ctrl.signup);
router.post("/login", ctrl.loginEmail);

export default router;