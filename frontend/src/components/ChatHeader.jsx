import { useEffect, useState } from "react";
import { HiOutlineInformationCircle, HiOutlineMagnifyingGlass } from "react-icons/hi2";
import { useSocket } from "../context/SocketContext";
import axios from "../api/axios"; // adjust to your actual axios instance path

const SERVER_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

function formatLastSeen(date) {
  if (!date) return null;
  const diffMs = Date.now() - new Date(date).getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffMin < 1440) return `${Math.floor(diffMin / 60)}h ago`;
  return new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function ChatHeader({ user, isOnline, isTyping, onToggleInfo, onToggleSearch }) {
  const { lastSeenMap } = useSocket();
  const [fetchedLastSeen, setFetchedLastSeen] = useState(null);

  useEffect(() => {
    // Only hit the REST fallback if we don't already have it from a live socket event
    if (isOnline || lastSeenMap[user._id]) return;

    axios
     .get(`/users/${user._id}/status`)
      .then((res) => setFetchedLastSeen(res.data.lastSeen))
      .catch(() => {});
  }, [user._id, isOnline, lastSeenMap]);

  const lastSeen = lastSeenMap[user._id] || fetchedLastSeen;

  const statusText = isTyping
    ? "typing..."
    : isOnline
    ? "Online"
    : lastSeen
    ? `Last seen ${formatLastSeen(lastSeen)}`
    : "Offline";

  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-base-700 bg-base-900">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-base-700 border border-neon/20">
          {user.avatar ? (
            <img src={`${SERVER_URL}${user.avatar}`} className="w-full h-full object-cover" alt={user.fullName} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neon font-semibold">
              {user.fullName?.[0]?.toUpperCase()}
            </div>
          )}
        </div>
        <div>
          <p className="font-semibold text-gray-100">{user.fullName}</p>
          <p className="text-xs text-neon h-4">{statusText}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 text-gray-400">
        <button onClick={onToggleSearch} className="hover:text-neon transition-colors">
          <HiOutlineMagnifyingGlass className="text-xl" />
        </button>
        <button onClick={onToggleInfo} className="hover:text-neon transition-colors">
          <HiOutlineInformationCircle className="text-xl" />
        </button>
      </div>
    </div>
  );
}