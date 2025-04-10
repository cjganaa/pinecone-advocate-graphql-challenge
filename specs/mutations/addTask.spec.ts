import { addTask } from "@/graphql/resolvers/mutations/addTask";
import Task from "@/models/Task";
import mongoose from "mongoose";

describe("addTask mutation", () => {
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

  it("should add a new task successfully", async () => {
    const args = {
      name: "Test Task",
      description: "This is a test task",
      priority: "High",
      tags: ["test", "task"],
      userId: new mongoose.Types.ObjectId().toString(),
    };

    const task = await addTask(null, args);

    expect(task).toBeDefined();
    expect(task.name).toBe(args.name);
    expect(task.description).toBe(args.description);
    expect(task.priority).toBe(args.priority);
    expect(task.tags).toEqual(args.tags);
    expect(task.userId.toString()).toBe(args.userId);

    const foundTask = await Task.findOne({ name: args.name });
    expect(foundTask).toBeDefined();
    expect(foundTask.name).toBe(args.name);
  });

  it("should add a new task with empty tags", async () => {
    const args = {
      name: "Test Task with no tags",
      description: "This is a test task with no tags",
      priority: "Medium",
      userId: new mongoose.Types.ObjectId().toString(),
    };

    const task = await addTask(null, args);

    expect(task).toBeDefined();
    expect(task.tags).toEqual([]);

    const foundTask = await Task.findOne({ name: args.name });
    expect(foundTask).toBeDefined();
    expect(foundTask.tags).toEqual([]);
  });

  it("should handle known errors (instanceof Error)", async () => {
    const args = {
      name: "Test Task",
      description: "This is a test task",
      priority: "Low",
      userId: new mongoose.Types.ObjectId().toString(),
    };

    const saveMock = jest.spyOn(Task.prototype, "save").mockRejectedValue(new Error("Database error"));

    await expect(addTask(null, args)).rejects.toThrow("Database error");

    saveMock.mockRestore();
  });

  it("should handle unknown errors (not instanceof Error)", async () => {
    const args = {
      name: "Test Task",
      description: "This is a test task",
      priority: "Low",
      userId: new mongoose.Types.ObjectId().toString(),
    };

    const saveMock = jest.spyOn(Task.prototype, "save").mockRejectedValue("Some non-error");

    await expect(addTask(null, args)).rejects.toThrow("An unknown error occurred");

    saveMock.mockRestore();
  });
});