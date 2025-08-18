"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
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
                }
            });
        }
        else {
            // Update tokens for existing user
            await prisma.user.update({
                where: { googleId: profile.id },
                data: {
                    googleAccessToken: accessToken,
                    googleRefreshToken: refreshToken || null,
                }
            });
        }
        done(null, profile); // user as AuthenticatedUser
    }
    catch (error) {
        console.error("Passport strategy error:", error);
        done(error, undefined);
    }
}));
passport_1.default.serializeUser((user, done) => {
    done(null, user.id);
});
passport_1.default.deserializeUser(async (id, done) => {
    try {
        const user = await prisma.user.findUnique({ where: { id } });
        done(null, user);
    }
    catch (error) {
        done(error, null);
    }
});
exports.default = passport_1.default;
//# sourceMappingURL=passport.js.map