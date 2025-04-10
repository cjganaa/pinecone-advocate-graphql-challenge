import { getUsers } from "@/graphql/resolvers/queries/getUsers";
import User from "@/models/User";
import mongoose from "mongoose";

describe("getUsers query", () => {
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

  it("should return all users", async () => {
    await User.create({
      username: "user1",
      email: "user1@example.com",
      password: "password1",
    });
    await User.create({
      username: "user2",
      email: "user2@example.com",
      password: "password2",
    });

    const users = await getUsers();

    expect(users).toBeDefined();
    expect(users.length).toBe(2);
    expect(users[0].username).toBe("user1");
    expect(users[1].username).toBe("user2");
  });

  it("should return an empty array if no users exist", async () => {
    const users = await getUsers();

    expect(users).toBeDefined();
    expect(users.length).toBe(0);
  });

  it("should handle known errors (instanceof Error)", async () => {
    const findMock = jest.spyOn(User, "find").mockRejectedValue(new Error("Database error"));

    const users = await getUsers();

    expect(users).toBeDefined();
    expect(users.length).toBe(0);
  });

  it("should handle unknown errors (not instanceof Error)", async () => {
    const findMock = jest.spyOn(User, "find").mockRejectedValue("Some non-error");

    const users = await getUsers();

    expect(users).toBeDefined();
    expect(users.length).toBe(0);
  });
});