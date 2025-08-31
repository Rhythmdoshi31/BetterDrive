// Sending user data as A cookie afte logging in..
// We gotta create a useAuth() hook to know if a user is Logged in already..
// Gotta put his name, img in navigation bar..


// utils/cookieHelper.ts
export const getCookieValue = <T = unknown>(name: string): T | null => {
  const cookies = document.cookie.split(';');
  const targetCookie = cookies.find(cookie => 
    cookie.trim().startsWith(`${name}=`)
  );
  
  if (targetCookie) {
    const cookieValue = targetCookie.split('=')[1];
    try {
      return JSON.parse(decodeURIComponent(cookieValue)) as T;
    } catch (error) {
      console.error('Error parsing cookie:', error);
      return null;
    }
  }
  
  return null;
};
