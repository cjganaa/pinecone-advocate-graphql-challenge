import User from "@/models/User";

export const getUsers = async () => {
    try {
      const users = await User.find();
      return users || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
}