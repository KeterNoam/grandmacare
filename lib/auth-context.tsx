import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect } from "react";

const AUTH_TOKEN_KEY = "auth_token";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "family_member" | "caregiver";
  familyId: string;
}

export const [AuthContext, useAuth] = createContextHook(() => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadToken();
  }, []);



  const loadToken = async () => {
    try {
      const storedToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      if (storedToken) {
        setToken(storedToken);
      }
    } catch (error) {
      console.error("Failed to load token:", error);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 100);
    }
  };

  const login = async (authToken: string, userData: User) => {
    setToken(authToken);
    setUser(userData);
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, authToken);
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
  };

  return {
    token,
    user,
    isLoading,
    isAuthenticated: !!token,
    login,
    logout,
    setUser,
  };
});
