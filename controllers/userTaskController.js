import UserTask from "../models/UserTask.js";
import User from "../models/User.js";
import { normalizeDate, isSameDay, isYesterday } from "../utils/dateUtils.js";
import { calculateCompletionRate } from "../utils/analyticsUtils.js";

export const selectTask = async (req, res, next) => {
  try {
    const { taskId, days } = req.body;
    const userId = req.user.id;

    const existingActive = await UserTask.findOne({
      userId,
      taskId,
      status: "active"
    });

    if (existingActive) {
      res.status(400);
      throw new Error("Task already active");
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + days);

    const userTask = await UserTask.create({
      userId,
      taskId,
      startDate,
      endDate
    });

    res.status(201).json({
      success: true,
      message: "Task selected successfully",
      data: userTask
    });
  } catch (error) {
    next(error);
  }
};

export const completeTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const userTask = await UserTask.findById(id).populate("taskId");

    if (!userTask) {
      res.status(404);
      throw new Error("Task not found");
    }

    if (userTask.userId.toString() !== userId) {
      res.status(403);
      throw new Error("Unauthorized to complete this task");
    }
    
    if (userTask.status !== "active") {
      res.status(400);
      throw new Error("Task is no longer active");
    }

    const today = normalizeDate(new Date());
    const startDate = normalizeDate(userTask.startDate);
    const endDate = normalizeDate(userTask.endDate);

    if (today > endDate) {
       res.status(400);
       throw new Error("Cannot complete: Current date is past the task end date");
    }

    if (today < startDate) {
      res.status(400);
      throw new Error("Cannot complete: Task has not started yet");
    }

    const alreadyCompleted = userTask.completedDays.some((date) => 
      isSameDay(date, today)
    );

    if (alreadyCompleted) {
      res.status(400);
      throw new Error("Already marked for today");
    }

    if (userTask.completedDays.length === 0) {
      userTask.streak = 1;
    } else {
      const pastDates = userTask.completedDays.map(d => normalizeDate(d).getTime());
      const lastCompletedTime = Math.max(...pastDates);
      const lastCompletedDate = new Date(lastCompletedTime);

      if (isYesterday(lastCompletedDate, today)) {
        userTask.streak = (userTask.streak || 0) + 1;
      } else if (!isSameDay(lastCompletedDate, today)) {
        userTask.streak = 1;
      }
    }

    userTask.completedDays.push(today);

    if (userTask.taskId && userTask.taskId.ecoScore) {
      const user = await User.findById(userId);
      if (user) {
        user.points = (user.points || 0) + userTask.taskId.ecoScore;
        await user.save();
      }
    }

    if (today.getTime() >= endDate.getTime()) {
      userTask.status = "completed";
    }

    await userTask.save();

    res.status(200).json({
      success: true,
      message: "Task completed today",
      data: userTask
    });
  } catch (error) {
    next(error);
  }
};

export const getUserTasks = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const userTasks = await UserTask.find({ userId })
      .populate("taskId", "title description ecoScore impactName impactValue impactUnit impact");

    const enhancedTasks = userTasks.map((task) => {
      const progress = calculateCompletionRate(
        task.completedDays.length, 
        task.startDate, 
        task.endDate, 
        normalizeDate
      );

      return {
        ...task.toObject(),
        progress
      };
    });

    res.status(200).json({
      success: true,
      message: "User tasks retrieved successfully",
      data: enhancedTasks || []
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUserTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const userTask = await UserTask.findById(id);

    if (!userTask) {
      res.status(404);
      throw new Error("Task not found");
    }

    if (userTask.userId.toString() !== userId) {
      res.status(403);
      throw new Error("Unauthorized to delete this task");
    }

    await UserTask.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

export const clearHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    await UserTask.deleteMany({ userId });
    
    res.status(200).json({
      success: true,
      message: "History cleared successfully",
      data: []
    });
  } catch (error) {
    next(error);
  }
};