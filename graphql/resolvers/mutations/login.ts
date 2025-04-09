import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '@/models/User';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'secret-key';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh-secret-key';

let users: { id: string; username: string; email: string; password: string }[] = [];
let refreshTokens: string[] = [];

export const login = async (_: any, { email, password }: { email: string; password: string }) => {
    const user = await User.findOne({email: email});
    if (!user) {
        throw new Error('Invalid email or password');
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
        throw new Error('Invalid email or password');
    }

    const accessToken = jwt.sign({ userId: user.id, email: user.email }, ACCESS_TOKEN_SECRET, {
        expiresIn: '1h',
    });

    const refreshToken = jwt.sign({ userId: user.id }, REFRESH_TOKEN_SECRET, {
        expiresIn: '2h', 
    });

    refreshTokens.push(refreshToken);

    return { accessToken, refreshToken, user };
}

export const refreshToken = async (_: any, { refreshToken }: { refreshToken: string }) => {
    if (!refreshTokens.includes(refreshToken)) {
      throw new Error('Invalid refresh token');
    }

    try {
      const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
      if (typeof decoded !== 'object' || !decoded || !('userId' in decoded)) {
        throw new Error('Invalid token payload');
      }
      const user = await User.findOne({ id: decoded.userId });
      if (!user) {
        throw new Error('User not found');
      }

      const newAccessToken = jwt.sign({ userId: user.id, email: user.email }, ACCESS_TOKEN_SECRET, {
        expiresIn: '15m',
      });

      return { accessToken: newAccessToken };
    } catch (err) {
      throw new Error('Invalid or expired refresh token');
    }
}