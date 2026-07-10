function formatLastSeen(date) {
  if (!date) return null;
  const diffMs = Date.now() - new Date(date).getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffMin < 1440) return `${Math.floor(diffMin / 60)}h ago`;
  return new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function UserListItem({ user, isOnline, isActive, onClick, lastMessagePreview, lastSeen }) {
  const statusText = lastMessagePreview
    ? lastMessagePreview
    : isOnline
    ? "Online"
    : lastSeen
    ? `Last seen ${formatLastSeen(lastSeen)}`
    : "Offline";

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left ${
        isActive ? "bg-neon/10 border border-neon/30" : "hover:bg-base-800 border border-transparent"
      }`}
    >
      <div className="relative shrink-0">
        <div className="w-11 h-11 rounded-full overflow-hidden bg-base-700 border border-base-700">
          {user.avatar ? (
            <img
              src={`${import.meta.env.VITE_SOCKET_URL || "http://localhost:5000"}${user.avatar}`}
              alt={user.fullName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neon font-semibold">
              {user.fullName?.[0]?.toUpperCase()}
            </div>
          )}
        </div>
        {isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-neon border-2 border-base-900 shadow-neon-sm" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-gray-100 font-medium truncate">{user.fullName}</p>
        <p className={`text-xs truncate ${isOnline ? "text-neon" : "text-gray-500"}`}>
          {statusText}
        </p>
      </div>
    </button>
  );
}