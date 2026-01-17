import express, { Request, Response, Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import axios, { AxiosResponse } from "axios";
import { handleGoogleSignIn } from "../utils/handleSignIn";
import { GoogleTokenResponse, GoogleUserInfo, UserData } from "../types";

const router: Router = express.Router();

// Initiate Google OAuth - Updated with Drive scopes
router.get("/google", (req: Request, res: Response) => {
  const scopes: string[] = [
    "profile",
    "email",
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/drive.metadata.readonly",
  ];

const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${
    process.env.GOOGLE_CLIENT_ID
  }&redirect_uri=${process.env.GOOGLE_CALLBACK_URL || 'http://betterdrive-production.up.railway.app/auth/google/callback'}&response_type=code&scope=${encodeURIComponent(
    scopes.join(" ")
  )}&access_type=offline&prompt=consent`;
  res.redirect(authUrl);
});

// Google OAuth callback - Manual token exchange
router.get("/google/callback", async (req: Request, res: Response) => {
  try {
    const code = req.query.code as string;

    if (!code) {
      return res.status(400).json({ error: "Missing code" });
    }

    // Exchange code for tokens
    const tokenResponse: AxiosResponse<GoogleTokenResponse> = await axios.post(
      "https://oauth2.googleapis.com/token",
      new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        redirect_uri: process.env.GOOGLE_CALLBACK_URL!,
        grant_type: "authorization_code",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    // Get user info
    const userResponse: AxiosResponse<GoogleUserInfo> = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokenResponse.data.access_token}`,
        },
      }
    );

    const userData: UserData = {
      googleId: userResponse.data.id,
      name: userResponse.data.name,
      email: userResponse.data.email,
      image: userResponse.data.picture,
      accessToken: tokenResponse.data.access_token,
      refreshToken: tokenResponse.data.refresh_token,
    };

    const existingUser = await handleGoogleSignIn(userData);

    if (!existingUser) {
      console.error("Failed to sign in user");
      return res.redirect("http://betterdrive-production.up.railway.app/error");
    }

    // Generate JWT for session management
    const token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" }
    );

    // Set JWT as HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    const minimalUserData = {
      name: userResponse.data.name,
      image: userResponse.data.picture,
      email: userResponse.data.email, // For display purposes
      isAuthenticated: true,
    };

    // Set minimal user data cookie
    res.cookie("user_data", JSON.stringify(minimalUserData), {
      httpOnly: false, // Frontend can read
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    console.log("User signed in:", existingUser.email);
    res.redirect("https://betterdrive.rhythmdoshi.site/dashboard");
  } catch (error: any) {
    console.error("Google OAuth Error:", error.response?.data || error.message);
    res.redirect("https://betterdrive-production.up.railway.app/error");
  }
});

// Logout route
router.post("/logout", (req: Request, res: Response) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});

export default router;
