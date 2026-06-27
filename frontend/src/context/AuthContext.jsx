/* eslint-disable react-refresh/only-export-components */
import { createContext, useState } from "react";
import axios from "axios";

export const AuthContext = createContext();

// Configure axios interceptor to automatically send Authorization header with token
axios.interceptors.request.use(
  (config) => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.token) {
          config.headers.Authorization = `Bearer ${parsed.token}`;
        }
      } catch (error) {
        console.error("Error reading auth token for request:", error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (error) {
        console.error("Failed to parse user session", error);
        localStorage.removeItem("user");
      }
    }
    return null;
  });

  const login = async (email, password) => {
    const response = await axios.post("http://localhost:5000/auth/login", {
      email,
      password,
    });
    const userData = response.data;
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    return userData;
  };

  const register = async (name, roll, department, email, password) => {
    const response = await axios.post("http://localhost:5000/auth/register", {
      name,
      roll,
      department,
      email,
      password,
    });
    return response.data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
