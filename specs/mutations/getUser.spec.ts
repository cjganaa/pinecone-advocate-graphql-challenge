import { getUser } from "@/graphql/resolvers/mutations/getUser"; // Таны файлын зам
import User from "@/models/User";
import mongoose from "mongoose";

describe("getUser query", () => {
  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URL_TEST;
    if (!mongoUri) {
      throw new Error("MONGODB_URL_TEST is not defined in the environment variables");
    }
    await mongoose.connect(mongoUri);
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("should return a user if found", async () => {
    const user = await User.create({
      username: "testuser",
      email: "test@example.com",
      password: "password123",
    });

    const result = await getUser(null, { id: user._id.toString() });

    expect(result).toBeDefined();
    expect(result.username).toBe("testuser");
    expect(result.email).toBe("test@example.com");
  });

  it("should throw an error if user is not found", async () => {
    const nonExistingId = new mongoose.Types.ObjectId().toString();

    await expect(getUser(null, { id: nonExistingId })).rejects.toThrow("User not found");
  });

  it("should handle known errors (instanceof Error)", async () => {
    const findByIdMock = jest
      .spyOn(User, "findById")
      .mockRejectedValue(new Error("Database error"));

    await expect(getUser(null, { id: "someId" })).rejects.toThrow("Database error");

    findByIdMock.mockRestore();
  });

  it("should handle unknown errors (not instanceof Error)", async () => {
    const findByIdMock = jest
      .spyOn(User, "findById")
      .mockRejectedValue("Some non-error");

    await expect(getUser(null, { id: "someId" })).rejects.toThrow(
      "An unknown error occurred"
    );

    findByIdMock.mockRestore();
  });
});