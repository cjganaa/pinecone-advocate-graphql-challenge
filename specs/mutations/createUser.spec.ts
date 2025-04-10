import { createUser } from "@/graphql/resolvers/mutations/createUser";
import User from "@/models/User";
import mongoose from "mongoose";

describe("createUser mutation", () => {
  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URL_TEST;
    if (!mongoUri) {
      throw new Error("MONGODB_URI_TEST is not defined in the environment variables");
    }
    await mongoose.connect(mongoUri);
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("should create a new user successfully", async () => {
    const args = {
      username: "testuser",
      email: "test@example.com",
      password: "password123",
    };

    const user = await createUser(null, args);

    expect(user).toBeDefined();
    expect(user.username).toBe(args.username);
    expect(user.email).toBe(args.email);

    const foundUser = await User.findOne({ email: args.email });
    expect(foundUser).toBeDefined();
    expect(foundUser?.username).toBe(args.username);
  });

  it("should throw an error if username already exists", async () => {
    const args = {
      username: "existinguser",
      email: "test@example.com",
      password: "password123",
    };

    await User.create({ username: "existinguser", email: "other@example.com", password: "password123" });

    await expect(createUser(null, args)).rejects.toThrow("Username or email already exists");
  });

  it("should throw an error if email already exists", async () => {
    const args = {
      username: "testuser",
      email: "existing@example.com",
      password: "password123",
    };

    await User.create({ username: "otheruser", email: "existing@example.com", password: "password123" });

    await expect(createUser(null, args)).rejects.toThrow("Username or email already exists");
  });

  it("should handle known errors (instanceof Error)", async () => {
    const args = {
      username: "testuser",
      email: "test@example.com",
      password: "password123",
    };

    const findOneMock = jest.spyOn(User, "findOne").mockRejectedValue(new Error("Database error"));

    await expect(createUser(null, args)).rejects.toThrow("Database error");

    findOneMock.mockRestore();
  });

  it("should handle unknown errors (not instanceof Error)", async () => {
    const args = {
      username: "testuser",
      email: "test@example.com",
      password: "password123",
    };

    const findOneMock = jest.spyOn(User, "findOne").mockRejectedValue("Some non-error");

    await expect(createUser(null, args)).rejects.toThrow("An unknown error occurred");

    findOneMock.mockRestore();
  });
});