import { upload } from "../../utils/upload";
import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { uploadResume, useSavedResume, getResumeInfo } from "./resume.controller";

const router = Router();
router.use(authenticate);

router.post("/upload", upload.single("resume"), uploadResume);
router.post("/use-saved", useSavedResume);
router.get("/info", getResumeInfo);

export default router;