import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../axios";

interface User {
  id: number;
  username: string;
  role: string;
}

interface AuthContextType {
  user: User | null; 
  loading: boolean;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setUser(null);
    window.location.href = "/";
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get<User>("/me/");
        setUser(response.data);
        localStorage.setItem("username", response.data.username); 
        localStorage.setItem("role", response.data.role);
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };
  
    if (localStorage.getItem("access")) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
