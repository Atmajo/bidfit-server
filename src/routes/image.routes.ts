import express, { Router } from "express";
import { imageUploader } from "../controllers/image.controller";
import { upload } from "../lib/multer";

const router: Router = express.Router();

router.post("/", upload.single("file"), imageUploader);

export default router;
