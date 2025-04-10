import { getAllTasks } from "@/graphql/resolvers/queries/getAllTasks";
import Task from "@/models/Task";
import mongoose from "mongoose";

describe("getAllTasks query", () => {
  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URL_TEST;
    if (!mongoUri) {
      throw new Error("MONGODB_URI_TEST is not defined in the environment variables");
    }
    await mongoose.connect(mongoUri);
  });

  afterEach(async () => {
    await Task.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("should return all tasks", async () => {
    await Task.create({
      name: "Task 1",
      description: "Description 1",
      priority: 1,
    });
    await Task.create({
      name: "Task 2",
      description: "Description 2",
      priority: 2,
    });
    await Task.create({
      name: "Task 3",
      description: "Description 3",
      priority: 3,
    });

    const tasks = await getAllTasks();

    expect(tasks).toBeDefined();
    expect(tasks.length).toBe(3);
  });

  it("should return an empty array if no tasks exist", async () => {
    const tasks = await getAllTasks();

    expect(tasks).toBeDefined();
    expect(tasks.length).toBe(0);
  });

  it("should handle known errors (instanceof Error)", async () => {
    const findMock = jest.spyOn(Task, "find").mockRejectedValue(new Error("Database error"));

    await expect(getAllTasks()).rejects.toThrow("Database error");

    findMock.mockRestore();
  });

  it("should handle unknown errors (not instanceof Error)", async () => {
    const findMock = jest.spyOn(Task, "find").mockRejectedValue("Some non-error");

    await expect(getAllTasks()).rejects.toThrow("An unknown error occurred");

    findMock.mockRestore();
  });
});