import { upload } from "../../utils/upload";
import { Router } from "express";

const router = Router();
import { uploadResume } from "./resume.controller";

router.post("/upload", upload.single("resume"), uploadResume);
export default router;