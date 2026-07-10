const EMOJIS = ["❤️", "😂", "👍", "😮", "😢", "🔥"];

export default function EmojiReactionPicker({ onSelect, onClose }) {
  return (
    <div className="absolute z-30 bottom-full mb-2 bg-base-800 border border-neon/30 rounded-full px-2 py-1 flex gap-1 shadow-neon-sm">
      {EMOJIS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => {
            onSelect(emoji);
            onClose();
          }}
          className="text-lg hover:scale-125 transition-transform"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
