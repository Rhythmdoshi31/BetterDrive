"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGoogleSignIn = handleGoogleSignIn;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function handleGoogleSignIn(userData) {
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
        }
        else {
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
        return user;
    }
    catch (error) {
        console.error("Error handling Google sign in:", error);
        return null;
    }
}
//# sourceMappingURL=handleSignIn.js.map