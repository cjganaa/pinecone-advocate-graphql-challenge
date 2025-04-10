import { getUserDoneTasksLists } from "@/graphql/resolvers/mutations/getUserDoneTasksLists";
import Task from "@/models/Task";
import User from "@/models/User";
import mongoose from "mongoose";

describe("getUserDoneTasksLists query", () => {
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

  it("should return all done tasks for a user", async () => {
    const user = await User.create({ username: "testuser", email: "test@example.com", password: "password123" });
    await Task.create({
      name: "Done Task 1",
      description: "Description 1",
      priority: 1,
      userId: user._id,
      isDone: true,
    });
    await Task.create({
      name: "Done Task 2",
      description: "Description 2",
      priority: 2,
      userId: user._id,
      isDone: true,
    });
    await Task.create({
      name: "Not Done Task",
      description: "Description 3",
      priority: 3,
      userId: user._id,
      isDone: false,
    });

    const args = {
      userId: user._id.toString(),
    };

    const doneTasks = await getUserDoneTasksLists(null, args);

    expect(doneTasks).toBeDefined();
    expect(doneTasks.length).toBe(2);
    expect(doneTasks.every((task) => task.userId.toString() === user._id.toString() && task.isDone)).toBe(true);
  });

  it("should return an empty array if user has no done tasks", async () => {
    const user = await User.create({ username: "testuser", email: "test@example.com", password: "password123" });
    await Task.create({
      name: "Not Done Task",
      description: "Description 3",
      priority: 3,
      userId: user._id,
      isDone: false,
    });

    const args = {
      userId: user._id.toString(),
    };

    const doneTasks = await getUserDoneTasksLists(null, args);

    expect(doneTasks).toBeDefined();
    expect(doneTasks.length).toBe(0);
  });

  it("should return an empty array if user has no tasks", async () => {
    const user = await User.create({ username: "testuser", email: "test@example.com", password: "password123" });

    const args = {
      userId: user._id.toString(),
    };

    const doneTasks = await getUserDoneTasksLists(null, args);

    expect(doneTasks).toBeDefined();
    expect(doneTasks.length).toBe(0);
  });

  it("should throw an error if user does not exist", async () => {
    const args = {
      userId: new mongoose.Types.ObjectId().toString(),
    };

    await expect(getUserDoneTasksLists(null, args)).rejects.toThrow("User not found");
  });

  it("should handle known errors (instanceof Error)", async () => {
    const args = {
      userId: new mongoose.Types.ObjectId().toString(),
    };

    const findByIdMock = jest.spyOn(User, "findById").mockRejectedValue(new Error("Database error"));

    await expect(getUserDoneTasksLists(null, args)).rejects.toThrow("Database error");

    findByIdMock.mockRestore();
  });

  it("should handle unknown errors (not instanceof Error)", async () => {
    const args = {
      userId: new mongoose.Types.ObjectId().toString(),
    };

    const findByIdMock = jest.spyOn(User, "findById").mockRejectedValue("Some non-error");

    await expect(getUserDoneTasksLists(null, args)).rejects.toThrow("An unknown error occurred");

    findByIdMock.mockRestore();
  });
});