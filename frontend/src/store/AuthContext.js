import { createContext, useContext, useEffect, useState } from "react";

export const AuthContext = createContext({
  user: {},
  login: (user) => {},
  signup: (user) => {},
  logout: () => {},
  editChatWallpaper: (wallpaper) => {},
});

let userData = null;

if (typeof window !== "undefined") {
  userData = JSON.parse(localStorage.getItem("userData"));

  if (userData) {
    const tokenExpirationDate = userData.tokenExpirationDate;
    const currentDate = new Date(Date.now()).toISOString();

    if (currentDate > tokenExpirationDate) {
      localStorage.removeItem("userData");
      userData = null;
    }
  }
}

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(userData);

  const loginHandler = (user) => {
    const { userId, name, email, token, profileImage, chatWallpaper } = user;

    if (!userId || !email || !token || !profileImage) {
      return;
    }

    const tokenExpirationDate = new Date(
      new Date().getTime() + 15 * 24 * 60 * 60 * 1000
    );

    const userData = {
      isAuthenticated: true,
      userId,
      name,
      email,
      token,
      profileImage,
      chatWallpaper,
      tokenExpirationDate: tokenExpirationDate.toISOString(),
    };

    setUser({ ...userData });
  };

  const signupHandler = (user) => {
    const { userId, name, email, token, profileImage, chatWallpaper } = user;

    if (!userId || !email || !token || !profileImage) {
      return;
    }

    const tokenExpirationDate = new Date(
      new Date().getTime() + 15 * 24 * 60 * 60 * 1000
    );

    const userData = {
      isAuthenticated: true,
      userId,
      name,
      email,
      token,
      profileImage,
      chatWallpaper,
      tokenExpirationDate: tokenExpirationDate.toISOString(),
    };

    setUser({ ...userData });
  };

  const logoutHandler = () => {
    localStorage.removeItem("userData");
    setUser(null);
  };

  const editChatWallpaperHandler = (wallpaper) => {
    setUser({ ...user, chatWallpaper: wallpaper });
  };

  useEffect(() => {
    localStorage.setItem("userData", JSON.stringify(user));
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        login: loginHandler,
        signup: signupHandler,
        logout: logoutHandler,
        editChatWallpaper: editChatWallpaperHandler,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const authCtx = useContext(AuthContext);
  return authCtx;
};

export default AuthProvider;
