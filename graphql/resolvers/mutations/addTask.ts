import Task from "@/models/Task";
export const addTask = async (root: any, args: any) => {
    const newTask = new Task({
        name: args.name,
        description: args.description,
        priority: args.priority,
        tags: args.tags || [],
        userId: args.userId,
      });
      await newTask.save();
      return newTask;
};