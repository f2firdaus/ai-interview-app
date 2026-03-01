import { Router } from "express";
import * as ctrl from "./interview.controller";

const router = Router();

router.post("/", ctrl.createInterview);
router.get("/", ctrl.getInterviews);

export default router;
