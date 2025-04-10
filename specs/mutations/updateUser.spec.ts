import { updateUser } from "@/graphql/resolvers/mutations/updateUser";
import User from "@/models/User";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

describe("updateUser mutation", () => {
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

  it("should update user successfully", async () => {
    const user = await User.create({
      username: "testuser",
      email: "test@example.com",
      password: "password123",
    });

    const args = {
      id: user._id.toString(),
      username: "updateduser",
      email: "updated@example.com",
      password: "newpassword",
    };

    const updatedUser = await updateUser(null, args);

    expect(updatedUser).toBeDefined();
    expect(updatedUser.username).toBe(args.username);
    expect(updatedUser.email).toBe(args.email);

    const isPasswordMatch = await bcrypt.compare(args.password, updatedUser.password);
    expect(isPasswordMatch).toBe(true);
  });

  it("should update user with only username", async () => {
    const user = await User.create({
      username: "testuser",
      email: "test@example.com",
      password: "password123",
    });

    const args = {
      id: user._id.toString(),
      username: "updateduser",
    };

    const updatedUser = await updateUser(null, args);

    expect(updatedUser).toBeDefined();
    expect(updatedUser.username).toBe(args.username);
    expect(updatedUser.email).toBe(user.email);
  });

  it("should update user with only email", async () => {
    const user = await User.create({
      username: "testuser",
      email: "test@example.com",
      password: "password123",
    });

    const args = {
      id: user._id.toString(),
      email: "updated@example.com",
    };

    const updatedUser = await updateUser(null, args);

    expect(updatedUser).toBeDefined();
    expect(updatedUser.username).toBe(user.username);
    expect(updatedUser.email).toBe(args.email);
  });

  it("should update user with only password", async () => {
    const user = await User.create({
      username: "testuser",
      email: "test@example.com",
      password: "password123",
    });

    const args = {
      id: user._id.toString(),
      password: "newpassword",
    };

    const updatedUser = await updateUser(null, args);

    expect(updatedUser).toBeDefined();

    const isPasswordMatch = await bcrypt.compare(args.password, updatedUser.password);
    expect(isPasswordMatch).toBe(true);
  });

  it("should throw an error if user not found", async () => {
    const args = {
      id: new mongoose.Types.ObjectId().toString(),
      username: "updateduser",
    };

    await expect(updateUser(null, args)).rejects.toThrow("User not found");
  });

  it("should handle known errors (instanceof Error)", async () => {
    const args = {
      id: new mongoose.Types.ObjectId().toString(),
      username: "updateduser",
    };

    const findByIdMock = jest.spyOn(User, "findById").mockRejectedValue(new Error("Database error"));

    await expect(updateUser(null, args)).rejects.toThrow("Database error");

    findByIdMock.mockRestore();
  });

  it("should handle unknown errors (not instanceof Error)", async () => {
    const args = {
      id: new mongoose.Types.ObjectId().toString(),
      username: "updateduser",
    };

    const findByIdMock = jest.spyOn(User, "findById").mockRejectedValue("Some non-error");

    await expect(updateUser(null, args)).rejects.toThrow("An unknown error occurred");

    findByIdMock.mockRestore();
  });
});