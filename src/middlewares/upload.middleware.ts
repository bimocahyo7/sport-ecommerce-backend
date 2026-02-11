import multer from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";

const UPLOAD_DIRECTORY = "uploads";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

if (!fs.existsSync(UPLOAD_DIRECTORY)) {
  fs.mkdirSync(UPLOAD_DIRECTORY, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, callback) => {
    callback(null, UPLOAD_DIRECTORY);
  },
  filename: (req: Request, file: Express.Multer.File, callback) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const fileExtension = path.extname(file.originalname);
    callback(null, `${uniqueSuffix}${fileExtension}`);
  },
});

const fileFilter = (req: Request, file: Express.Multer.File, callback: multer.FileFilterCallback) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(new Error(`Invalid file type. Only ${ALLOWED_MIME_TYPES.join(", ")} are allowed`));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1, // Limit number of files
  },
});
