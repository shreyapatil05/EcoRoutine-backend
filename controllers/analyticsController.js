import UserTask from "../models/UserTask.js";
import User from "../models/User.js";
import { normalizeDate } from "../utils/dateUtils.js";

// GET /api/analytics
export const getAnalyticsDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const userTasks = await UserTask.find({ userId });
    const user = await User.findById(userId);

    let totalTasksSelected = userTasks.length;
    let activeTasks = 0;
    let completedTasks = 0;
    let totalCompletions = 0;
    let currentStreak = 0;
    let totalPossibleDays = 0;

    userTasks.forEach((task) => {
      if (task.status === "active") activeTasks++;
      if (task.status === "completed") completedTasks++;
      
      totalCompletions += task.completedDays.length;

      // Find max streak across active tasks
      if (task.status === "active" && task.streak > currentStreak) {
        currentStreak = task.streak;
      }

      if (task.startDate && task.endDate) {
        const start = normalizeDate(task.startDate).getTime();
        const end = normalizeDate(task.endDate).getTime();
        const days = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1);
        totalPossibleDays += days;
      }
    });

    let completionRate = 0;
    if (totalPossibleDays > 0) {
      completionRate = Math.min(100, Math.max(0, Math.round((totalCompletions / totalPossibleDays) * 100)));
    }

    const data = {
      totalTasksSelected,
      activeTasks,
      completedTasks,
      totalCompletions,
      currentStreak,
      totalPoints: user ? user.points : 0,
      completionRate
    };

    res.status(200).json({
      success: true,
      message: "Analytics dashboard fetched successfully",
      data: data || {}
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/analytics/impact
export const getImpact = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userTasks = await UserTask.find({ userId }).populate("taskId");

    const aggregationMap = {};

    userTasks.forEach((userTask) => {
      if (!userTask.completedDays || userTask.completedDays.length === 0) return;
      if (!userTask.taskId) return;

      const completions = userTask.completedDays.length;
      
      let name = userTask.taskId.impactName;
      let unit = userTask.taskId.impactUnit;
      let value = userTask.taskId.impactValue;

      // Backward compatibility logic
      if (!name) {
        if (userTask.taskId.impact) {
          name = userTask.taskId.impact;
          // Capitalize first letter basic normalization
          name = name.charAt(0).toUpperCase() + name.slice(1) + " Impact";
        } else {
          name = "Environmental Impact";
        }
      }
      
      if (!unit) unit = "points";
      if (!value) value = (userTask.taskId.ecoScore || 10) * 10;

      const totalValue = completions * value;
      
      const key = `${name}_${unit}`;
      if (aggregationMap[key]) {
        aggregationMap[key].total += totalValue;
      } else {
        aggregationMap[key] = {
          impactName: name,
          total: totalValue,
          unit: unit
        };
      }
    });

    const result = Object.values(aggregationMap);

    console.log("Impact Data:", result);

    res.status(200).json({
      success: true,
      message: "Environmental impact calculated dynamically",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
