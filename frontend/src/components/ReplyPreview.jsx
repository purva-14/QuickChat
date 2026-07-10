import { HiXMark } from "react-icons/hi2";

export default function ReplyPreview({ message, onCancel, compact }) {
  if (!message) return null;

  return (
    <div
      className={`flex items-center justify-between gap-2 border-l-2 border-neon bg-neon/5 rounded-md px-2 py-1 ${
        compact ? "mb-1" : "mb-2"
      }`}
    >
      <div className="min-w-0">
        <p className="text-[11px] text-neon font-medium">Replying to</p>
        <p className="text-xs text-gray-300 truncate max-w-[220px]">
          {message.text || (message.image ? "Photo" : "")}
        </p>
      </div>
      {onCancel && (
        <button onClick={onCancel} className="text-gray-400 hover:text-red-400 shrink-0">
          <HiXMark />
        </button>
      )}
    </div>
  );
}
