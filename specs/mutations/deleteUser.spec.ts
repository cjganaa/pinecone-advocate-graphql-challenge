import { deleteUser } from "@/graphql/resolvers/mutations/deleteUser"; // Таны файлын зам
import User from "@/models/User";
import mongoose from "mongoose";

describe("deleteUser mutation", () => {
  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URL_TEST;
    if (!mongoUri) {
      throw new Error("MONGODB_URL_TEST is not defined in the environment variables");
    }
    return await mongoose.connect(mongoUri);
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("should delete a user if found", async () => {
    const user = await User.create({
      username: "testuser",
      email: "test@example.com",
      password: "password123",
    });

    const result = await deleteUser(null, { id: user._id.toString() });

    expect(result).toBeDefined();
    expect(result.username).toBe("testuser");
    expect(result.email).toBe("test@example.com");

    const deletedUser = await User.findById(user._id.toString());
    expect(deletedUser).toBeNull();
  });

  it("should throw an error if user is not found", async () => {
    const nonExistingId = new mongoose.Types.ObjectId().toString();

    await expect(deleteUser(null, { id: nonExistingId })).rejects.toThrow("User not found");
  });

  it("should handle known errors (database error)", async () => {
    const findByIdMock = jest
      .spyOn(User, "findById")
      .mockRejectedValue(new Error("Database error"));

    await expect(deleteUser(null, { id: "someId" })).rejects.toThrow("Database error");

    findByIdMock.mockRestore();
  });

  it("should handle known errors (other error)", async () => {
    const findByIdMock = jest
      .spyOn(User, "findById")
      .mockRejectedValue(new Error("Some other error"));

    await expect(deleteUser(null, { id: "someId" })).rejects.toThrow("Some other error");

    findByIdMock.mockRestore();
  });

});