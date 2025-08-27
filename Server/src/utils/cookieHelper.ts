
// utils/cookieHelper.ts
export const getCookieValue = (name: string): any => {
  const cookies = document.cookie.split(';');
  const targetCookie = cookies.find(cookie => 
    cookie.trim().startsWith(`${name}=`)
  );
  
  if (targetCookie) {
    const cookieValue = targetCookie.split('=')[1];
    try {
      return JSON.parse(decodeURIComponent(cookieValue));
    } catch (error) {
      console.error('Error parsing cookie:', error);
      return null;
    }
  }
  
  return null;
};
