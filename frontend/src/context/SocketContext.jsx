import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [onlineUserIds, setOnlineUserIds] = useState(new Set());
  const [lastSeenMap, setLastSeenMap] = useState({});
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("quickchat_token");
    if (!user || !token) {
      socketRef.current?.disconnect();
      return;
    }

    const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
      auth: { token },
    });
    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    // NEW: snapshot of who's already online at connect time
    socket.on("presence:init", (userIds) => {
      setOnlineUserIds(new Set(userIds));
    });

    socket.on("presence:update", ({ userId, isOnline, lastSeen }) => {
      setOnlineUserIds((prev) => {
        const next = new Set(prev);
        isOnline ? next.add(userId) : next.delete(userId);
        return next;
      });
      // NEW: capture lastSeen whenever someone goes offline
      if (lastSeen) {
        setLastSeenMap((prev) => ({ ...prev, [userId]: lastSeen }));
      }
    });

    return () => socket.disconnect();
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, onlineUserIds, lastSeenMap, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);