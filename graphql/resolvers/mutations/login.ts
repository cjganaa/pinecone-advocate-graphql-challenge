import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const users: { id: string; username: string; email: string; password: string }[] = [];

export const login = async (_: any, { email, password }: { email: string; password: string }) => {
    const user = await User.findOne({ email: email });
    if (!user) {
    throw new Error('Invalid email or password');
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
    throw new Error('Invalid email or password');
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
        expiresIn: '1h',
    });

    return { token, user };
}