import mongoose from "mongoose";

const Schema = mongoose.Schema;

const taskSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true, minlength: 10 },
  isDone: { type: Boolean, default: false },
  priority: { type: Number, required: true, min: 1, max: 5 },
  tags: { type: [String], default: [] },
  userId: { type: String, required: true }
}, {
  timestamps: true,
  versionKey: false
});

taskSchema.index({ name: 1, userId: 1 }, { unique: true });

const Task = mongoose.models.Task || mongoose.model("Task", taskSchema);

export default Task;