import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
  ecoScore: Number,
  impact: {
    type: String // kept for backward compatibility
  },
  impactName: {
    type: String
  },
  impactValue: {
    type: Number
  },
  impactUnit: {
    type: String
  }
});

export default mongoose.model("Task", taskSchema);