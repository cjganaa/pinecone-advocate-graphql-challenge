import { gql } from "graphql-tag";

export const typeDefs = gql`
  scalar Date
  type Task {
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
    getAllTasks: [Task!]!
  }
  type Mutation {
    addTask(name: String!, description: String!, priority: Int!, tags: [String], userId: String!): Task!
  }
`;
