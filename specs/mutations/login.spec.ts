import { login, refreshToken } from "@/graphql/resolvers/mutations/login";
import User from "@/models/User";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "secret-key";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "refresh-secret-key";

describe("Authentication mutations", () => {
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

  describe("login mutation", () => {
    it("should return access and refresh tokens on successful login", async () => {
      const password = "password123";
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        email: "test@example.com",
        password: hashedPassword,
      });

      const args = {
        email: "test@example.com",
        password: "password123",
      };

      const result = await login(null, args);

      expect(result).toBeDefined();
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.user.id).toBe(user.id);
    });

    it("should throw an error on invalid email", async () => {
      const args = {
        email: "invalid@example.com",
        password: "password123",
      };

      await expect(login(null, args)).rejects.toThrow("Invalid email or password");
    });

    it("should throw an error on invalid password", async () => {
      const password = "password123";
      const hashedPassword = await bcrypt.hash(password, 10);
      await User.create({
        email: "test@example.com",
        password: hashedPassword,
      });

      const args = {
        email: "test@example.com",
        password: "wrongpassword",
      };

      await expect(login(null, args)).rejects.toThrow("Invalid email or password");
    });
  });

  describe("refreshToken mutation", () => {
    it("should return a new access token on valid refresh token", async () => {
      const password = "password123";
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        email: "test@example.com",
        password: hashedPassword,
      });

      const refreshTokenValue = jwt.sign({ userId: user.id }, REFRESH_TOKEN_SECRET, {
        expiresIn: "2h",
      });

      const args = {
        refreshToken: refreshTokenValue,
      };

      const result = await refreshToken(null, args);
      expect(result).toBeDefined();
      expect(result.accessToken).toBeDefined();
    });

    it("should throw an error on invalid refresh token", async () => {
      const args = {
        refreshToken: "invalid-refresh-token",
      };

      await expect(refreshToken(null, args)).rejects.toThrow("Invalid refresh token");
    });

    it("should throw an error on expired refresh token", async () => {
      const password = "password123";
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        email: "test@example.com",
        password: hashedPassword,
      });

      const expiredRefreshToken = jwt.sign({ userId: user.id }, REFRESH_TOKEN_SECRET, {
        expiresIn: "0s",
      });

      const args = {
        refreshToken: expiredRefreshToken,
      };

      // wait for token to expire
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await expect(refreshToken(null, args)).rejects.toThrow("Invalid or expired refresh token");
    });
  });
});