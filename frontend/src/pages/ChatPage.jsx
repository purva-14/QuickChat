import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import api from "../api/axios";
import toast from "react-hot-toast";
import { HiOutlineChatBubbleLeftRight, HiXMark, HiMagnifyingGlass } from "react-icons/hi2";

import Sidebar from "../components/Sidebar";
import ChatHeader from "../components/ChatHeader";
import MessageBubble from "../components/MessageBubble";
import MessageInput from "../components/MessageInput";
import TypingIndicator from "../components/TypingIndicator";
import ProfilePanel from "../components/ProfilePanel";


export default function ChatPage() {
  const { user, logout, updateUser } = useAuth();
  const { socket, onlineUserIds ,lastSeenMap} = useSocket();

  const [users, setUsers] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingFrom, setTypingFrom] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
 
  const [profileDrawer, setProfileDrawer] = useState(null); 
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const bottomRef = useRef(null);
  const activeUserRef = useRef(null);
  activeUserRef.current = activeUser;

 
  useEffect(() => {
    api.get("/users").then(({ data }) => setUsers(data.users)).catch(() => toast.error("Could not load users"));
  }, []);

 
  useEffect(() => {
    if (!activeUser) return;
    api
      .get(`/messages/${activeUser._id}`)
      .then(({ data }) => setMessages(data.messages))
      .catch(() => toast.error("Could not load conversation"));
    setReplyingTo(null);
  }, [activeUser]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingFrom]);

  // Mark visible messages as seen once loaded / when new ones arrive while open
  useEffect(() => {
    if (!activeUser || !socket || messages.length === 0) return;
    const unseenIncoming = messages.filter(
      (m) => m.sender === activeUser._id || m.sender?._id === activeUser._id
    ).filter((m) => m.status !== "seen").map((m) => m._id);

    if (unseenIncoming.length > 0) {
      socket.emit("message:seen", { messageIds: unseenIncoming, senderId: activeUser._id });
    }
  }, [messages, activeUser, socket]);

  // ---- Socket listeners ----
  useEffect(() => {
    if (!socket) return;

   const handleReceive = (message) => {
  const senderId = message.sender?._id || message.sender;
  if (activeUserRef.current && senderId === activeUserRef.current._id) {
    setMessages((prev) => [...prev, message]);
    socket.emit("message:seen", { messageIds: [message._id], senderId });
  } else {
    toast(`New message from ${message.senderName || "someone"}`, { icon: "💬" });
  }
};

    const handleStatus = ({ messageId, status }) => {
      setMessages((prev) => prev.map((m) => (m._id === messageId ? { ...m, status } : m)));
    };

    const handleStatusBulk = ({ messageIds, status }) => {
      setMessages((prev) => prev.map((m) => (messageIds.includes(m._id) ? { ...m, status } : m)));
    };

    const handleTypingStart = ({ userId }) => {
      if (activeUserRef.current?._id === userId) setTypingFrom(userId);
    };
    const handleTypingStop = ({ userId }) => {
      if (activeUserRef.current?._id === userId) setTypingFrom(null);
    };

    const handleReaction = (updatedMessage) => {
      setMessages((prev) => prev.map((m) => (m._id === updatedMessage._id ? updatedMessage : m)));
    };

    socket.on("message:receive", handleReceive);
    socket.on("message:status", handleStatus);
    socket.on("message:status:bulk", handleStatusBulk);
    socket.on("typing:start", handleTypingStart);
    socket.on("typing:stop", handleTypingStop);
    socket.on("reaction:update", handleReaction);

    return () => {
      socket.off("message:receive", handleReceive);
      socket.off("message:status", handleStatus);
      socket.off("message:status:bulk", handleStatusBulk);
      socket.off("typing:start", handleTypingStart);
      socket.off("typing:stop", handleTypingStop);
      socket.off("reaction:update", handleReaction);
    };
  }, [socket, users]);

  const handleSend = useCallback(
    async ({ text, imageFile, replyTo }) => {
      if (!activeUser) return;
      try {
        const formData = new FormData();
        if (text) formData.append("text", text);
        if (replyTo) formData.append("replyTo", replyTo);
        if (imageFile) formData.append("image", imageFile);

        const { data } = await api.post(`/messages/${activeUser._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        setMessages((prev) => [...prev, data.message]);
        socket?.emit("message:send", { receiverId: activeUser._id, message: data.message });
      } catch (err) {
        toast.error(err.response?.data?.message || "Message failed to send");
      }
    },
    [activeUser, socket]
  );

  const handleTyping = useCallback(
    (isTyping) => {
      if (!activeUser || !socket) return;
      socket.emit(isTyping ? "typing:start" : "typing:stop", { receiverId: activeUser._id });
    },
    [activeUser, socket]
  );

  const handleReact = useCallback(
    async (messageId, emoji) => {
      try {
        const { data } = await api.put(`/messages/${messageId}/react`, { emoji });
        setMessages((prev) => prev.map((m) => (m._id === messageId ? data.message : m)));
        if (activeUser) socket?.emit("reaction:update", { receiverId: activeUser._id, message: data.message });
      } catch {
        toast.error("Could not react to message");
      }
    },
    [socket, activeUser]
  );

  const handleSearchMessages = async (q) => {
    setSearchQuery(q);
    if (!q || !activeUser) return setSearchResults([]);
    const { data } = await api.get("/messages/search", { params: { q, userId: activeUser._id } });
    setSearchResults(data.messages);
  };

  const media = messages.filter((m) => m.image).map((m) => m.image);

  return (
    <div className="h-screen w-screen flex bg-base-950 overflow-hidden font-body">
      <Sidebar
        users={users}
        onlineUserIds={onlineUserIds}
         lastSeenMap={lastSeenMap}
        activeUserId={activeUser?._id}
        onSelectUser={setActiveUser}
        onOpenProfile={() => setProfileDrawer("edit-me")}
        currentUser={user}
        onLogout={logout}
      />

      <main className="flex-1 flex flex-col min-w-0">
        {!activeUser ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <HiOutlineChatBubbleLeftRight className="text-6xl text-neon/30 mb-3" />
            <p>Select a conversation to start chatting</p>
          </div>
        ) : (
          <>
            <ChatHeader
              user={activeUser}
              isOnline={onlineUserIds.has(activeUser._id)}
              isTyping={typingFrom === activeUser._id}
              onToggleInfo={() => setProfileDrawer((d) => (d ? null : "contact-info"))}
              onToggleSearch={() => setShowSearch((s) => !s)}
            />

            {showSearch && (
              <div className="px-4 py-2 bg-base-900 border-b border-base-700">
                <label className="input input-sm flex items-center gap-2 bg-base-800 border-base-700 rounded-full">
                  <HiMagnifyingGlass className="text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search messages..."
                    className="grow bg-transparent focus:outline-none text-sm text-gray-200"
                    value={searchQuery}
                    onChange={(e) => handleSearchMessages(e.target.value)}
                  />
                  <button onClick={() => setShowSearch(false)} className="text-gray-500 hover:text-red-400">
                    <HiXMark />
                  </button>
                </label>
                {searchQuery && (
                  <div className="mt-2 max-h-40 overflow-y-auto space-y-1">
                    {searchResults.length === 0 ? (
                      <p className="text-xs text-gray-500 px-1">No matches</p>
                    ) : (
                      searchResults.map((m) => (
                        <div key={m._id} className="text-xs text-gray-300 px-2 py-1 bg-base-800 rounded-md">
                          {m.text}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.map((m) => (
                <MessageBubble
                  key={m._id}
                  message={m}
                  isMine={(m.sender?._id || m.sender) === user._id}
                  onReply={setReplyingTo}
                  onReact={handleReact}
                />
              ))}
              {typingFrom === activeUser._id && <TypingIndicator />}
              <div ref={bottomRef} />
            </div>

            <MessageInput
              onSend={handleSend}
              onTyping={handleTyping}
              replyingTo={replyingTo}
              onCancelReply={() => setReplyingTo(null)}
            />
          </>
        )}
      </main>

      <ProfilePanel
        open={!!profileDrawer}
        onClose={() => setProfileDrawer(null)}
        user={profileDrawer === "contact-info" ? activeUser : user}
        editable={profileDrawer === "edit-me"}
        startInEditMode={profileDrawer === "edit-me"}
        onUpdated={updateUser}
        media={profileDrawer === "contact-info" ? media : []}
      />
    </div>
  );
}