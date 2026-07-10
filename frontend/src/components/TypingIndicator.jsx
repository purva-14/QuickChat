export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-2 w-fit rounded-2xl bg-base-800 border border-neon/20">
      <span className="w-1.5 h-1.5 rounded-full bg-neon animate-pulseDot" style={{ animationDelay: "0ms" }} />
      <span className="w-1.5 h-1.5 rounded-full bg-neon animate-pulseDot" style={{ animationDelay: "150ms" }} />
      <span className="w-1.5 h-1.5 rounded-full bg-neon animate-pulseDot" style={{ animationDelay: "300ms" }} />
    </div>
  );
}
