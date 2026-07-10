import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("quickchat_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("quickchat_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/auth/me")
      .then(({ data }) => {
        setUser(data.user);
        localStorage.setItem("quickchat_user", JSON.stringify(data.user));
      })
      .catch(() => {
        localStorage.removeItem("quickchat_token");
        localStorage.removeItem("quickchat_user");
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (emailOrUsername, password) => {
    const { data } = await api.post("/auth/login", { emailOrUsername, password });
    localStorage.setItem("quickchat_token", data.token);
    localStorage.setItem("quickchat_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    localStorage.setItem("quickchat_token", data.token);
    localStorage.setItem("quickchat_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      
    }
    localStorage.removeItem("quickchat_token");
    localStorage.removeItem("quickchat_user");
    setUser(null);
    toast.success("Logged out");
  };

  const updateUser = (updated) => {
    setUser(updated);
    localStorage.setItem("quickchat_user", JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
