import multer from "multer";

const storage = multer.memoryStorage();

export const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max for resumes
    fileFilter: (_req, file, cb) => {
        const allowed = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only PDF and DOCX files are accepted"));
        }
    },
});
