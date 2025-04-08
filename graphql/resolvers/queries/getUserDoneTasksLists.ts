import Task from "@/models/Task";
import User from "@/models/User";


export const getUserDoneTasksLists = async (_: any, { userId }: { userId: string }) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");
    const doneTasks = await Task.find({ userId, isDone: true });
    return doneTasks;
  } catch (error) {
    if (error instanceof Error) throw new Error(error.message);
    throw new Error("An unknown error occurred");
  }
};