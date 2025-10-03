import { Request } from 'express';

export interface UserData {
  googleId: string;
  name: string;
  email: string;
  image: string;
  accessToken: string;
  refreshToken?: string;
}

export interface Waitlist {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export interface AuthenticatedUser {
  id: string;
  googleId: string;
  email: string;
  name: string;
  image?: string;
  googleAccessToken?: string;
  googleRefreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

export interface GoogleTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}
