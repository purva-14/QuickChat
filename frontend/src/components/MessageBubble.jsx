import { useState } from "react";
import { HiOutlineFaceSmile, HiOutlineArrowUturnLeft } from "react-icons/hi2";
import { BsCheck, BsCheckAll } from "react-icons/bs";
import ReplyPreview from "./ReplyPreview";
import EmojiReactionPicker from "./EmojiReactionPicker";

const SERVER_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export default function MessageBubble({ message, isMine, onReply, onReact }) {
  const [showPicker, setShowPicker] = useState(false);
  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const StatusIcon = () => {
    if (!isMine) return null;
    if (message.status === "seen") return <BsCheckAll className="text-neon text-sm" />;
    if (message.status === "delivered") return <BsCheckAll className="text-gray-400 text-sm" />;
    return <BsCheck className="text-gray-400 text-sm" />;
  };

  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"} group px-1`}>
      <div className={`max-w-[70%] flex flex-col ${isMine ? "items-end" : "items-start"}`}>
        <div className="relative flex items-center gap-1">
          {!isMine && (
            <button
              onClick={() => setShowPicker((s) => !s)}
              className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-neon transition-opacity"
            >
              <HiOutlineFaceSmile />
            </button>
          )}
          <button
            onClick={() => onReply(message)}
            className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-neon transition-opacity"
            title="Reply"
          >
            <HiOutlineArrowUturnLeft />
          </button>

          <div
            className={`rounded-2xl px-4 py-2 relative ${
              isMine
                ? "bg-neon text-black rounded-br-sm"
                : "bg-base-800 text-gray-100 border border-base-700 rounded-bl-sm"
            }`}
          >
            {showPicker && (
              <EmojiReactionPicker
                onSelect={(emoji) => onReact(message._id, emoji)}
                onClose={() => setShowPicker(false)}
              />
            )}

            {message.replyTo && (
              <ReplyPreview message={message.replyTo} compact />
            )}

            {message.image && (
              <img
                src={`${SERVER_URL}${message.image}`}
                alt="attachment"
                className="rounded-lg max-w-[240px] max-h-[240px] object-cover mb-1"
              />
            )}
            {message.text && <p className="text-sm break-words whitespace-pre-wrap">{message.text}</p>}
          </div>

          {isMine && (
            <button
              onClick={() => setShowPicker((s) => !s)}
              className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-neon transition-opacity"
            >
              <HiOutlineFaceSmile />
            </button>
          )}
        </div>

        {message.reactions?.length > 0 && (
          <div className="flex gap-1 mt-1 flex-wrap">
            {message.reactions.map((r, i) => (
              <span key={i} className="text-xs bg-base-800 border border-neon/20 rounded-full px-1.5">
                {r.emoji}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-1 mt-0.5 px-1">
          <span className="text-[10px] text-gray-500">{time}</span>
          <StatusIcon />
        </div>
      </div>
    </div>
  );
}
