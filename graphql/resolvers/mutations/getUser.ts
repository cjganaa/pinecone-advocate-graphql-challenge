import User from "@/models/User";

export const getUser = async (_: any, { id }: { id: string }) => {
    try {
      const user = await User.findById(id);
      if (!user) throw new Error('User not found');
      return user;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('An unknown error occurred');
    }
}