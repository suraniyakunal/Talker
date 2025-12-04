
import { createContext, useState, useEffect } from "react";
import axiosInstance from "../configs/axios.js";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // ← ADD THIS

  useEffect(() => {
    const globalAuthCheck = async () => {
      try {
        const authenticatedUser = await axiosInstance.get('/users/check');
        // console.log('Auth check response:', authenticatedUser.data.user); // ← FIXED logging

        // Set user if exists, otherwise null
        setUser(authenticatedUser.data.user || null);
      } catch (error) {
        console.log('Auth check failed:', error);
        setUser(null); // ← ENSURE null on error
      } finally {
        setLoading(false); // ← ALWAYS set loading false
      }
    };

    globalAuthCheck();
  }, []);

  // CRITICAL: Export loading too
  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

