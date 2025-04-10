import { updateTask } from "@/graphql/resolvers/mutations/updateTask";
import Task from "@/models/Task";
import User from "@/models/User";
import mongoose from "mongoose";

describe("updateTask mutation", () => {
  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URL_TEST;
    if (!mongoUri) {
      throw new Error("MONGODB_URI_TEST is not defined in the environment variables");
    }
    await mongoose.connect(mongoUri);
  });

  afterEach(async () => {
    await Task.deleteMany({});
    await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("should update task successfully", async () => {
    const user = await User.create({ username: "testuser", email: "test@example.com", password: "password123" });
    const task = await Task.create({
      name: "Test Task",
      description: "This is a test task",
      priority: 3,
      userId: user._id,
    });

    const args = {
      taskId: task._id.toString(),
      userId: user._id.toString(),
      name: "Updated Task",
      description: "This is an updated task",
      priority: 4,
      isDone: true,
      tags: ["updated", "task"],
    };

    const updatedTask = await updateTask(null, args);

    expect(updatedTask).toBeDefined();
    expect(updatedTask.name).toBe(args.name);
    expect(updatedTask.description).toBe(args.description);
    expect(updatedTask.priority).toBe(args.priority);
    expect(updatedTask.isDone).toBe(args.isDone);
    expect(updatedTask.tags).toEqual(args.tags);
  });

  it("should throw an error if user does not exist", async () => {
    const args = {
      taskId: new mongoose.Types.ObjectId().toString(),
      userId: new mongoose.Types.ObjectId().toString(),
      name: "Updated Task",
    };

    await expect(updateTask(null, args)).rejects.toThrow("User does not exist");
  });

  it("should throw an error if task not found", async () => {
    const user = await User.create({ username: "testuser", email: "test@example.com", password: "password123" });
    const args = {
      taskId: new mongoose.Types.ObjectId().toString(),
      userId: user._id.toString(),
      name: "Updated Task",
    };

    await expect(updateTask(null, args)).rejects.toThrow("Task not found");
  });

  it("should throw an error if user does not own task", async () => {
    const user1 = await User.create({ username: "testuser1", email: "test1@example.com", password: "password123" });
    const user2 = await User.create({ username: "testuser2", email: "test2@example.com", password: "password123" });
    const task = await Task.create({
      name: "Test Task",
      description: "This is a test task",
      priority: 3,
      userId: user1._id,
    });

    const args = {
      taskId: task._id.toString(),
      userId: user2._id.toString(),
      name: "Updated Task",
    };

    await expect(updateTask(null, args)).rejects.toThrow("Unauthorized: You do not own this task");
  });

  it("should throw an error if description is too short", async () => {
    const user = await User.create({ username: "testuser", email: "test@example.com", password: "password123" });
    const task = await Task.create({
      name: "Test Task",
      description: "This is a test task",
      priority: 3,
      userId: user._id,
    });

    const args = {
      taskId: task._id.toString(),
      userId: user._id.toString(),
      description: "short",
    };

    await expect(updateTask(null, args)).rejects.toThrow("Description must be at least 10 characters");
  });

  it("should throw an error if description matches name", async () => {
    const user = await User.create({ username: "testuser", email: "test@example.com", password: "password123" });
    const task = await Task.create({
      name: "Test Task",
      description: "This is a test task",
      priority: 3,
      userId: user._id,
    });

    const args = {
      taskId: task._id.toString(),
      userId: user._id.toString(),
      name: "Test Task",
      description: "Test Task",
    };

    await expect(updateTask(null, args)).rejects.toThrow("Description cannot match name");
  });

  it("should throw an error if priority is out of range", async () => {
    const user = await User.create({ username: "testuser", email: "test@example.com", password: "password123" });
    const task = await Task.create({
      name: "Test Task",
      description: "This is a test task",
      priority: 3,
      userId: user._id,
    });

    const args = {
      taskId: task._id.toString(),
      userId: user._id.toString(),
      priority: 6,
    };

    await expect(updateTask(null, args)).rejects.toThrow("Priority must be 1-5");
  });

  it("should throw an error if tags exceed 5", async () => {
    const user = await User.create({ username: "testuser", email: "test@example.com", password: "password123" });
    const task = await Task.create({
      name: "Test Task",
      description: "This is a test task",
      priority: 3,
      userId: user._id,
    });

    const args = {
      taskId: task._id.toString(),
      userId: user._id.toString(),
      tags: ["1", "2", "3", "4", "5", "6"],
    };

    await expect(updateTask(null, args)).rejects.toThrow("Tags cannot exceed 5");
  });

  it("should handle known errors (instanceof Error)", async () => {
    const args = {
      taskId: new mongoose.Types.ObjectId().toString(),
      userId: new mongoose.Types.ObjectId().toString(),
      name: "Updated Task",
    };

    const findByIdMock = jest.spyOn(User, "findById").mockRejectedValue(new Error("Database error"));

    await expect(updateTask(null, args)).rejects.toThrow("Database error");

    findByIdMock.mockRestore();
  });

  it("should handle unknown errors (not instanceof Error)", async () => {
    const args = {
      taskId: new mongoose.Types.ObjectId().toString(),
      userId: new mongoose.Types.ObjectId().toString(),
      name: "Updated Task",
    };

    const findByIdMock = jest.spyOn(User, "findById").mockRejectedValue("Some non-error");

    await expect(updateTask(null, args)).rejects.toThrow("An unknown error occurred");

    findByIdMock.mockRestore();
  });
});