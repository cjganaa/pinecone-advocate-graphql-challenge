import { getAllTasks } from "./queries/getAllTasks";
import { addTask } from "./mutations/addTask";

export const resolvers = {
  Query: {
    getAllTasks
  },
  Mutation: {
    addTask
  }
};