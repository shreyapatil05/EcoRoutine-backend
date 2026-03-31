import express from "express";
import { getAnalyticsDashboard, getImpact } from "../controllers/analyticsController.js";
import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();

router.get("/", verifyToken, getAnalyticsDashboard);
router.get("/impact", verifyToken, getImpact);

export default router;
