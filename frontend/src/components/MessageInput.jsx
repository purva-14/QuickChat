import { useRef, useState } from "react";
import { HiOutlinePhoto, HiPaperAirplane } from "react-icons/hi2";
import ReplyPreview from "./ReplyPreview";

export default function MessageInput({ onSend, onTyping, replyingTo, onCancelReply }) {
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);
  const typingTimeout = useRef(null);

  const handleChange = (e) => {
    setText(e.target.value);
    onTyping?.(true);
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => onTyping?.(false), 1500);
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() && !imageFile) return;
    onSend({ text: text.trim(), imageFile, replyTo: replyingTo?._id });
    setText("");
    setImageFile(null);
    setPreview(null);
    onCancelReply?.();
    onTyping?.(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-base-700 bg-base-900 px-4 py-3">
      {replyingTo && <ReplyPreview message={replyingTo} onCancel={onCancelReply} />}
      {preview && (
        <div className="relative w-20 h-20 mb-2">
          <img src={preview} className="w-full h-full object-cover rounded-lg border border-neon/30" alt="preview" />
          <button
            type="button"
            onClick={() => {
              setImageFile(null);
              setPreview(null);
            }}
            className="absolute -top-2 -right-2 bg-base-800 text-red-400 border border-red-400 rounded-full w-5 h-5 text-xs flex items-center justify-center"
          >
            ×
          </button>
        </div>
      )}
      <div className="flex items-center gap-2">
        <label className="cursor-pointer text-gray-400 hover:text-neon p-2 rounded-full hover:bg-base-800">
          <HiOutlinePhoto className="text-xl" />
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFile} className="hidden" />
        </label>
        <input
          type="text"
          value={text}
          onChange={handleChange}
          placeholder="Send a message"
          className="input flex-1 bg-base-800 border-base-700 focus:border-neon focus:outline-none text-gray-100 rounded-full"
        />
        <button
          type="submit"
          className="btn btn-circle bg-neon hover:bg-neon-soft border-none text-black shadow-neon"
        >
          <HiPaperAirplane className="text-lg" />
        </button>
      </div>
    </form>
  );
}
