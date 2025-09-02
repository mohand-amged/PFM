import { compare } from 'bcryptjs';
import { sign, verify } from 'jsonwebtoken';
import prisma from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '7d';

export interface User {
  id: string;
  email: string | null;
  name: string | null;
}

export async function login(email: string, password: string): Promise<{ token: string; user: Omit<User, 'password'> } | null> {
  try {
    const user = await Promise.race([
      prisma.user.findUnique({
        where: { email },
      }),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Database timeout')), 10000)
      )
    ]);

    if (!user) {
      return null;
    }

    const isPasswordValid = await compare(password, user.password!);
    if (!isPasswordValid) {
      return null;
    }

    const { password: _, ...userWithoutPassword } = user;
    const token = sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    return { token, user: userWithoutPassword };
  } catch (error) {
    if (error instanceof Error && error.message === 'Database timeout') {
      throw new Error('Database timeout');
    }
    throw error;
  }
}

export async function verifyToken(token: string): Promise<User | null> {
  try {
    const payload = verify(token, JWT_SECRET) as { userId: string };
    const user = await Promise.race([
      prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, email: true, name: true },
      }),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Database timeout')), 10000)
      )
    ]);
    return user;
  } catch (error) {
    return null;
  }
}

export async function getCurrentUser(token: string | undefined): Promise<User | null> {
  if (!token) return null;
  return verifyToken(token);
}

// Server-side function to get current user from request headers (set by middleware)
export async function getCurrentUserFromHeaders(headers: Headers): Promise<User | null> {
  const userId = headers.get('x-user-id');
  const userEmail = headers.get('x-user-email');
  const userName = headers.get('x-user-name');
  
  if (!userId) return null;
  
  return {
    id: userId,
    email: userEmail,
    name: userName,
  };
}

// Server-side function to get current user from database using user ID from headers
export async function getCurrentUserFromDatabase(headers: Headers): Promise<User | null> {
  const userId = headers.get('x-user-id');
  
  if (!userId) return null;
  
  try {
    const user = await Promise.race([
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true },
      }),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Database timeout')), 10000)
      )
    ]);
    return user;
  } catch (error) {
    return null;
  }
}