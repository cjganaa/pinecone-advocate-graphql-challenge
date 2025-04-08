import { getAllTasks } from "./queries/getAllTasks";
import { addTask } from "./mutations/addTask";
import { createUser } from "./mutations/createUser";
import { deleteUser } from "./mutations/deleteUser";
import { updateTask } from "./mutations/updateTask";
import { updateUser } from "./mutations/updateUser";
import { getUser } from "./queries/getUser";
import { getUsers } from "./queries/getUsers";
import { getUserDoneTasksLists } from "./queries/getUserDoneTasksLists";


export const resolvers = {
  Query: {
    getUser,
    getUsers,
    getAllTasks,
    getUserDoneTasksLists,
  },
  Mutation: {
    createUser,
    updateUser,
    deleteUser,
    updateTask,
    addTask,
    
  }
};