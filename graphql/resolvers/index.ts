import { getAllTasks } from "./queries/getAllTasks";
import { addTask } from "./mutations/addTask";
import { createUser } from "./mutations/createUser";
import { deleteUser } from "./mutations/deleteUser";
import { updateTask } from "./mutations/updateTask";
import { updateUser } from "./mutations/updateUser";
import { getUser } from "./queries/getUser";
import { getUsers } from "./queries/getUsers";


export const resolvers = {
  Query: {
    getUser,
    getUsers,
    getAllTasks,
  },
  Mutation: {
    createUser,
    updateUser,
    deleteUser,
    updateTask,
    addTask,
  }
};