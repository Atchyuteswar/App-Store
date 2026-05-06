import { createContext, useContext, useState, useEffect } from "react";
import { login as apiLogin, userLogin as apiUserLogin, userSignup as apiUserSignup, logout as apiLogout, getMe } from "@/services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await getMe();
      if (data.admin) setAdmin(data.admin);
      if (data.user) setUser(data.user);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        setAdmin(null);
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const loginFn = async (email, password) => {
    const { data } = await apiLogin({ email, password });
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    setAdmin(data.admin);
    return data;
  };

  const userLoginFn = async (email, password) => {
    const { data } = await apiUserLogin({ email, password });
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    setUser(data.user);
    return data;
  };

  const userSignupFn = async (username, email, password) => {
    const { data } = await apiUserSignup({ username, email, password });
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    setUser(data.user);
    return data;
  };

  const logoutFn = async () => {
    try {
      await apiLogout();
    } finally {
      localStorage.removeItem('token');
      setAdmin(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        user,
        isAuthenticated: !!admin || !!user,
        loading,
        login: loginFn,
        userLogin: userLoginFn,
        userSignup: userSignupFn,
        logout: logoutFn,
        refreshUser: checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

export default AuthContext;
