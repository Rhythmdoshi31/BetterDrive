"use strict";
// Sending user data as A cookie afte logging in..
// We gotta create a useAuth() hook to know if a user is Logged in already..
// Gotta put his name, img in navigation bar..
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCookieValue = void 0;
// utils/cookieHelper.ts
const getCookieValue = (name) => {
    const cookies = document.cookie.split(';');
    const targetCookie = cookies.find(cookie => cookie.trim().startsWith(`${name}=`));
    if (targetCookie) {
        const cookieValue = targetCookie.split('=')[1];
        try {
            return JSON.parse(decodeURIComponent(cookieValue));
        }
        catch (error) {
            console.error('Error parsing cookie:', error);
            return null;
        }
    }
    return null;
};
exports.getCookieValue = getCookieValue;
//# sourceMappingURL=cookieHelper.js.map