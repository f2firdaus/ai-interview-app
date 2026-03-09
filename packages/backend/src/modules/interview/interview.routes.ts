import { Router } from "express";
import * as ctrl from "./interview.controller";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/stats", ctrl.getStats);
router.post("/", ctrl.createInterview);
router.get("/", ctrl.getInterviews);
router.get("/:id", ctrl.getInterviewById);
router.put("/:id/complete", ctrl.completeInterview);
router.delete("/:id", ctrl.deleteInterview);
router.post("/quick-practice", ctrl.quickPractice);

export default router;
