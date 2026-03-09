import { upload } from "../../utils/upload";
import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();
router.use(authenticate);
import { uploadResume } from "./resume.controller";

router.post("/upload", upload.single("resume"), uploadResume);
export default router;