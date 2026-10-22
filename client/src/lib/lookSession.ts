export type PreparedLook = {
  id: number;
  outfit: {
    type: "dress" | "separates";
    top: { id: number; name: string; imageUrl: string } | null;
    bottom: { id: number; name: string; imageUrl: string } | null;
    outer: { id: number; name: string; imageUrl: string } | null;
    dress: { id: number; name: string; imageUrl: string } | null;
    background: { id: number; name: string; imageUrl: string | null };
  };
  pose: { id: number; name: string; promptKeyword: string };
};

const PHOTO_KEY = "lesoul-user-photo";
const LOOK_KEY = "lesoul-prepared-look";
const LOGIN_KEY = "lesoul-login-next-upload";

export const savePhoto = (url: string) => sessionStorage.setItem(PHOTO_KEY, url);
export const getPhoto = () => sessionStorage.getItem(PHOTO_KEY);
export const savePreparedLook = (look: PreparedLook) => sessionStorage.setItem(LOOK_KEY, JSON.stringify(look));
export const getPreparedLook = () => {
  const stored = sessionStorage.getItem(LOOK_KEY);
  try { return stored ? JSON.parse(stored) as PreparedLook : null; } catch { return null; }
};
export const setLoginIntent = () => sessionStorage.setItem(LOGIN_KEY, "true");
export const consumeLoginIntent = () => {
  const shouldContinue = sessionStorage.getItem(LOGIN_KEY) === "true";
  sessionStorage.removeItem(LOGIN_KEY);
  return shouldContinue;
};
