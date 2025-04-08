import User from "@/models/User";

interface CreateUserArgs {
  username: string;
  email: string;
  password: string;
}

export const createUser = async (_: any, { username, email, password }: CreateUserArgs) => {
    try {
      const existingUser = await User.findOne({ $or: [{ username }, { email }] });
      if (existingUser) {
        throw new Error('Username or email already exists');
      }
      const user = new User({ username, email, password });
      await user.save();
      return user;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('An unknown error occurred');
    }
}