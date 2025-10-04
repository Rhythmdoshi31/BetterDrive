import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { UserData, AuthenticatedUser } from '../types';

const prisma = new PrismaClient();

export async function handleGoogleSignIn(userData: UserData): Promise<AuthenticatedUser | null> {
  try {
    // Find or create user
    let user = await prisma.user.findUnique({
      where: { googleId: userData.googleId }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          googleId: userData.googleId,
          email: userData.email,
          name: userData.name,
          image: userData.image,
          googleAccessToken: userData.accessToken,
          googleRefreshToken: userData.refreshToken || null,
      }
      });
    } else {
      // Update existing user with new tokens
      user = await prisma.user.update({
        where: { googleId: userData.googleId },
        data: {
          googleAccessToken: userData.accessToken,
          googleRefreshToken: userData.refreshToken || user.googleRefreshToken,
          name: userData.name,
          image: userData.image,
      }
      });
    }

    return user as AuthenticatedUser;
  } catch (error) {
    console.error("Error handling Google sign in:", error);
    return null;
  }
}
