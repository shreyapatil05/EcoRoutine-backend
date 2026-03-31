import express from "express";
import { selectTask, completeTask, getUserTasks, clearHistory, deleteUserTask } from "../controllers/userTaskController.js";
import verifyToken from "../middlewares/verifyToken.js";
import { validate, selectTaskValidations, completeTaskValidations } from "../middlewares/validationMiddleware.js";

const router = express.Router();

router.post(
  "/select", 
  verifyToken, 
  selectTaskValidations, 
  validate, 
  selectTask
);

router.post(
  "/complete/:id", 
  verifyToken, 
  completeTaskValidations, 
  validate, 
  completeTask
);

router.post("/clear-history", verifyToken, clearHistory);
router.delete("/:id", verifyToken, deleteUserTask);

router.get("/my", verifyToken, getUserTasks);

export default router;