import express from "express";
import { getTasks, createCustomTask } from "../controllers/taskController.js";
import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();

router.get("/", verifyToken, getTasks);
router.post("/custom", verifyToken, createCustomTask);

export default router;