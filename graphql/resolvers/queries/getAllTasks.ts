import Task from "@/models/Task";
export const getAllTasks = async () => {
    const tasks = await Task.find();
    return tasks;
};