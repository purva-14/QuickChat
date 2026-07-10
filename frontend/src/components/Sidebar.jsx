import { useState } from "react";
import { HiOutlineChatBubbleLeftRight, HiOutlineEllipsisVertical, HiMagnifyingGlass } from "react-icons/hi2";
import UserListItem from "./UserListItem";

export default function Sidebar({
  users,
  onlineUserIds,
   lastSeenMap,  
  activeUserId,
  onSelectUser,
  onOpenProfile,
  currentUser,
  onLogout,
}) {
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const filtered = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(query.toLowerCase()) ||
      u.username.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <aside className="w-full sm:w-[300px] shrink-0 bg-base-900 border-r border-base-700 flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-4 border-b border-base-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-neon/10 border border-neon/40 flex items-center justify-center shadow-neon-sm">
            <HiOutlineChatBubbleLeftRight className="text-neon text-lg" />
          </div>
          <h1 className="font-display font-bold text-lg neon-text">QuickChat</h1>
        </div>
        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="text-gray-400 hover:text-neon p-1"
          >
            <HiOutlineEllipsisVertical className="text-xl" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-base-800 border border-base-700 rounded-lg shadow-lg z-20 overflow-hidden">
              <button
                onClick={() => {
                  onOpenProfile();
                  setMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-neon/10 hover:text-neon"
              >
                Edit Profile
              </button>
              <button
                onClick={onLogout}
                className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-red-500/10 hover:text-red-400"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="px-3 pt-3">
        <label className="input flex items-center gap-2 bg-base-800 border-base-700 rounded-xl">
          <HiMagnifyingGlass className="text-gray-500" />
          <input
            type="text"
            placeholder="Search User..."
            className="grow bg-transparent focus:outline-none text-sm text-gray-200"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        {filtered.length === 0 && (
          <p className="text-center text-gray-500 text-sm mt-6">No users found</p>
        )}
        {filtered.map((u) => (
          <UserListItem
            key={u._id}
            user={u}
            isOnline={onlineUserIds.has(u._id)}
            lastSeen={lastSeenMap[u._id] || u.lastSeen}
            isActive={activeUserId === u._id}
            onClick={() => onSelectUser(u)}
          />
        ))}
      </div>

      <div className="px-4 py-3 border-t border-base-700 flex items-center gap-2">
        <div className="w-8 h-8 rounded-full overflow-hidden bg-base-700 border border-neon/30">
          {currentUser?.avatar ? (
            <img
              src={`${import.meta.env.VITE_SOCKET_URL || "http://localhost:5000"}${currentUser.avatar}`}
              className="w-full h-full object-cover"
              alt="me"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neon text-sm font-semibold">
              {currentUser?.fullName?.[0]?.toUpperCase()}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm text-gray-200 truncate">{currentUser?.fullName}</p>
          <p className="text-xs text-neon">Online</p>
        </div>
      </div>
    </aside>
  );
}
