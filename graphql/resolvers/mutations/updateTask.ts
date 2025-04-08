import Task from "@/models/Task";
import User from "@/models/User";

type UpdateTaskArgs = {
  taskId: string;
  userId: string;
  name?: string;
  description?: string;
  priority?: number;
  isDone?: boolean;
  tags?: string[];
};

export const updateTask = async (_: any, { taskId, userId, name, description, priority, isDone, tags }: UpdateTaskArgs) => {
  try {
    // Verify user exists
    const user = await User.findById(userId);
    if (!user) throw new Error("User does not exist");

    // Find task and verify ownership
    const task = await Task.findById(taskId);
    if (!task) throw new Error("Task not found");
    if (task.userId !== userId) throw new Error("Unauthorized: You do not own this task");

    // Build updates
    const updates: Partial<UpdateTaskArgs> = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) {
      if (description.length < 10) throw new Error("Description must be at least 10 characters");
      if (description === name) throw new Error("Description cannot match name");
      updates.description = description;
    }
    if (priority !== undefined) {
      if (priority < 1 || priority > 5) throw new Error("Priority must be 1-5");
      updates.priority = priority;
    }
    if (isDone !== undefined) updates.isDone = isDone;
    if (tags !== undefined) {
      if (tags.length > 5) throw new Error("Tags cannot exceed 5");
      updates.tags = tags;
    }

    // Perform update
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!updatedTask) throw new Error("Failed to update task");

    return updatedTask;
  } catch (error) {
    if (error instanceof Error) throw new Error(error.message);
    throw new Error("An unknown error occurred");
  }
};