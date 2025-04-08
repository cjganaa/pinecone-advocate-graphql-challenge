import User from "@/models/User";

export const deleteUser = async (_: any, { id }: { id: string }) => {
    try {
      const user = await User.findById(id);
      if (!user) throw new Error('User not found');
      await User.findByIdAndDelete(id);
      return user; // Return the deleted user
    } catch (error) {
      throw new Error((error as Error).message);
    }
}