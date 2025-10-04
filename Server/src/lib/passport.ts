import passport from 'passport';
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { AuthenticatedUser } from '../types';

const prisma = new PrismaClient();

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: "http://localhost:3000/auth/google/callback"
}, async (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
  try {
    // Find or create user in database
    let user = await prisma.user.findUnique({ 
      where: { googleId: profile.id } 
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          googleId: profile.id,
          email: profile.emails?.[0].value || '',
          name: profile.displayName || '',
          image: profile.photos?.[0].value || '',
          googleAccessToken: accessToken,
          googleRefreshToken: refreshToken || null,
      }});
    } else {
      // Update tokens for existing user
      await prisma.user.update({
        where: { googleId: profile.id },
        data: {
          googleAccessToken: accessToken,
          googleRefreshToken: refreshToken || null,
      }});
    }

    done(null, profile); // user as AuthenticatedUser
  } catch (error) {
    console.error("Passport strategy error:", error);
    done(error as Error, undefined);
  }
}));

passport.serializeUser((user: any, done) => { // user: AuthenticatedUser
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user as AuthenticatedUser);
  } catch (error) {
    done(error as Error, null);
  }
});

export default passport;
