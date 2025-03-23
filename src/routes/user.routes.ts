import express, { Router } from "express";
import { deleteUser, getUser, getUsers, updateProfile } from "../controllers/user.controller";

const router: Router = express.Router();

router.get("/", getUsers);
router.get("/profile", getUser);
router.put("/profile", updateProfile);
router.delete("/", deleteUser);

export default router;
