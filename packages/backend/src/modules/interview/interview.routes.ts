import { Router } from "express";
import * as ctrl from "./interview.controller";

const router = Router();

router.get("/stats", ctrl.getStats);
router.post("/", ctrl.createInterview);
router.get("/", ctrl.getInterviews);
router.get("/:id", ctrl.getInterviewById);
router.put("/:id/complete", ctrl.completeInterview);
router.delete("/:id", ctrl.deleteInterview);
router.post("/quick-practice", ctrl.quickPractice);

export default router;
