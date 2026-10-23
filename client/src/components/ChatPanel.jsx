import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";

function formatTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function ChatPanel({ userId, messages, onSendMessage, onClose }) {
  const [draft, setDraft] = useState("");
  const endRef = useRef(null);
  const messagesRef = useRef(null);

  useEffect(() => {
    messagesRef.current?.scrollTo({
      top: messagesRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const renderedMessages = useMemo(() => messages.slice(-100), [messages]);

  function handleSend(event) {
    event.preventDefault();
    const text = draft.trim();

    if (!text) {
      return;
    }

    onSendMessage(text);
    setDraft("");
  }

  return (
    <aside className="absolute right-3 top-3 z-20 flex h-[min(420px,calc(100%-1.5rem))] max-h-[420px] w-[min(300px,calc(100%-1.5rem))] flex-col overflow-hidden rounded-2xl border border-zinc-700/40 bg-zinc-950/95 shadow-2xl backdrop-blur">
      <header className="flex items-center justify-between border-b border-zinc-700/50 px-4 py-3">
        <h2 className="font-['Space_Grotesk',sans-serif] text-base font-semibold text-zinc-100">Room Chat</h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md px-2 py-1 text-lg leading-none text-zinc-400 hover:bg-zinc-800 hover:text-white"
          aria-label="Close chat"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </header>

      <div ref={messagesRef} className="flex-1 space-y-2 overflow-y-auto px-3 py-3">
        {renderedMessages.length === 0 ? (
          <p className="rounded-lg border border-dashed border-zinc-700/60 bg-zinc-900/70 px-3 py-2 text-xs text-zinc-400">
            No messages yet. Say hello to your collaborators.
          </p>
        ) : (
          renderedMessages.map((message) => {
            const isSelf = message.userId === userId;

            return (
              <div key={message.id} className={`rounded-lg px-3 py-2 ${isSelf ? "bg-emerald-500/20" : "bg-zinc-800/90"}`}>
                <div className="mb-1 flex items-center justify-between gap-2 text-[11px]">
                  <span className={`font-semibold ${isSelf ? "text-emerald-300" : "text-zinc-300"}`}>{message.userId}</span>
                  <span className="text-zinc-500">{formatTime(message.createdAt)}</span>
                </div>
                <p className="break-words text-sm text-zinc-100">{message.text}</p>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={handleSend} className="border-t border-zinc-700/50 p-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Type a message"
            maxLength={400}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-emerald-400"
          />
          <button type="submit" className="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-emerald-400">
            Send
          </button>
        </div>
      </form>
    </aside>
  );
}
