import express from "express";
import { registerUser, loginUser, changePassword, getMe } from "../controllers/authController.js";
import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/change-password", verifyToken, changePassword);
router.get("/me", verifyToken, getMe);

export default router;