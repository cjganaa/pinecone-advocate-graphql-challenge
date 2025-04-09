import { gql } from "graphql-tag";

export const typeDefs = gql`
  scalar Date
  type AuthPayload {
    accessToken: String!
    refreshToken: String!
    user: User!
  }
  type TokenPayload {
    accessToken: String!
  }
  type User {
    id: ID!
    username: String!
    email: String!
    createdAt: Date!
    updatedAt: Date!
  }
  type Task {
    id: ID!
    name: String!
    description: String!
    isDone: Boolean!
    priority: Int!
    tags: [String!]
    createdAt: Date!
    updatedAt: Date!
    userId: String!
  }
  type Query {
    getUsers: [User!]!
    getAllTasks: [Task!]!
  }
  type Mutation {
    login(email: String!, password: String!): AuthPayload!
    refreshToken(refreshToken: String!): TokenPayload!
    getUser(id: ID!): User
    getUserDoneTasksLists(userId: String!): [Task!]!
    getUserAllTasksLists(userId: String!): [Task!]!
    createUser(username: String!, email: String!, password: String!): User!
    updateUser(id: ID!, username: String, email: String, password: String): User!
    deleteUser(id: ID!): User!
    addTask(name: String!, description: String!, priority: Int!, tags: [String], userId: String!): Task!
    updateTask(taskId: ID!, userId: String!, name: String, description: String, priority: Int, isDone: Boolean, tags: [String]): Task!
  }
`;
