import express, { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import imageRoutes from "./image.routes";
import testRoute from "./test.routes";
import { authmiddleware } from "../middleware/middleware";

const router: Router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", authmiddleware, userRoutes);
router.use("/image", authmiddleware, imageRoutes);
router.use("/test", authmiddleware, testRoute);

export default router;
