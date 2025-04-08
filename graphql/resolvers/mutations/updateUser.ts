import User from "@/models/User";
import bcrypt from "bcrypt";

type UpdateUserArgs = {
  id: string;
  username?: string;
  email?: string;
  password?: string;
};

export const updateUser = async (_: any, { id, username, email, password }: UpdateUserArgs) => {
  try {
    const user = await User.findById(id);
    if (!user) throw new Error("User not found");

    const updates: Partial<UpdateUserArgs> = {};
    if (username !== undefined) updates.username = username;
    if (email !== undefined) updates.email = email;
    if (password !== undefined) {
      updates.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!updatedUser) throw new Error("Failed to update user");

    return updatedUser;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("An unknown error occurred");
  }
};