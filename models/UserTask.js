import mongoose from "mongoose";

const userTaskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },

  startDate: Date,
  endDate: Date,

  completedDays: [Date],

  streak: {
    type: Number,
    default: 0
  },

  status: {
    type: String,
    enum: ["active", "completed"],
    default: "active"
  }
});

export default mongoose.model("UserTask", userTaskSchema);