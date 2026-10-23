import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Hash, UserRound, UsersRound } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { WhiteboardCanvas } from "../canvas/WhiteboardCanvas";
import { ChatPanel } from "../components/ChatPanel";
import { CursorLayer } from "../components/CursorLayer";
import { Toolbar } from "../components/Toolbar";
import { VoiceControls } from "../components/VoiceControls";
import { useRoomSocket } from "../hooks/useRoomSocket";
import { useVoiceChat } from "../hooks/useVoiceChat";
import { useBoardStore } from "../store/useBoardStore";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export function CanvasPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [copyState, setCopyState] = useState("idle");
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [visibleRoomInfo, setVisibleRoomInfo] = useState(null);

  const {
    userId,
    socket,
    users,
    elements,
    messages,
    cursors,
    setRoomId,
    setUsers,
    setMessages,
    addUser,
    addMessage,
    removeUser,
    setCursor,
    setElements,
    addOrUpdateElement,
    deleteElement,
    clearElements,
    selectedTool,
    color,
    strokeWidth,
    setSelectedTool,
    setColor,
    setStrokeWidth,
    undo,
    redo,
    fontFamily,
    setFontFamily,
    fontSize,
    setFontSize,
  } = useBoardStore();

  useEffect(() => {
    if (!roomId) {
      navigate("/");
      return;
    }

    setRoomId(roomId);
  }, [navigate, roomId, setRoomId]);

  useEffect(() => {
    async function bootstrap() {
      if (!roomId) {
        return;
      }

      const [roomResponse, canvasResponse] = await Promise.all([
        fetch(`${API_BASE}/room/${roomId}`),
        fetch(`${API_BASE}/canvas/${roomId}`),
      ]);

      if (roomResponse.ok) {
        const room = await roomResponse.json();
        setUsers(room.users || []);
        setMessages(room.chatMessages || []);
      }

      if (canvasResponse.ok) {
        const canvas = await canvasResponse.json();
        setElements(canvas.elements || [], { record: false });
      }
    }

    bootstrap();
  }, [roomId, setElements, setMessages, setUsers]);

  const handlers = useMemo(
    () => ({
      onUserJoined: ({ socketId }) => addUser(socketId),
      onUserLeft: ({ socketId }) => removeUser(socketId),
      onSyncDraw: ({ element, elements: incomingElements }) => {
        if (Array.isArray(incomingElements)) {
          setElements(incomingElements, { record: false });
          return;
        }

        if (element) {
          addOrUpdateElement(element, { record: false });
        }
      },
      onSyncUpdate: ({ element }) => {
        if (element) {
          addOrUpdateElement(element, { record: false });
        }
      },
      onSyncDelete: ({ elementId }) => {
        if (elementId) {
          deleteElement(elementId, { record: false });
        }
      },
      onSyncCursor: ({ socketId, cursor }) => {
        setCursor(socketId, cursor);
      },
      onSyncClear: () => {
        clearElements({ record: false });
      },
      onSyncScene: ({ elements: incomingElements }) => {
        if (Array.isArray(incomingElements)) {
          setElements(incomingElements, { record: false });
        }
      },
      onSyncChatHistory: ({ messages: incomingMessages }) => {
        if (Array.isArray(incomingMessages)) {
          setMessages(incomingMessages);
        }
      },
      onSyncChatMessage: ({ message }) => {
        if (message) {
          addMessage(message);
        }
      },
    }),
    [addMessage, addOrUpdateElement, addUser, clearElements, deleteElement, removeUser, setCursor, setElements, setMessages]
  );

  useRoomSocket(roomId, handlers);

  const {
    joinVoice,
    leaveVoice,
    toggleMute,
    isJoining,
    isInVoice,
    isMuted,
    isSpeaking,
    activeSpeakerIds,
    participantCount,
    remotePeers,
    error: voiceError,
  } = useVoiceChat({ roomId, socket, userId });

  async function handleSave() {
    await fetch(`${API_BASE}/canvas/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId, elements }),
    });
  }

  function handleClear() {
    clearElements();
    socket?.emit("CLEAR_CANVAS", { roomId });
  }

  function handleSendMessage(text) {
    socket?.emit("SEND_CHAT_MESSAGE", {
      roomId,
      message: {
        id: `msg-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
        userId,
        text,
        createdAt: new Date().toISOString(),
      },
    });
  }

  async function handleCopyRoomCode() {
    if (!roomId) {
      return;
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(roomId);
      } else {
        const input = document.createElement("input");
        input.value = roomId;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
      }

      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 1400);
    } catch {
      setCopyState("error");
      window.setTimeout(() => setCopyState("idle"), 1800);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-900 px-3 py-3 md:px-6 md:py-6">
      <section className="mx-auto max-w-[1400px]">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-zinc-300">
          <h1 className="font-['Space_Grotesk',sans-serif] text-xl font-semibold text-white md:text-2xl">CollabBoard Room</h1>
          <div className="flex items-center gap-2 text-sm">
            <button
              type="button"
              onClick={() => setVisibleRoomInfo((current) => (current === "room" ? null : "room"))}
              className="flex items-center gap-2 rounded bg-zinc-800 p-2 text-sm hover:bg-zinc-700"
              title="Show room code"
              aria-label={`Show room code ${roomId}`}
            >
              <Hash size={14} aria-hidden="true" />
              {visibleRoomInfo === "room" ? <span>{roomId}</span> : null}
            </button>
            <button
              type="button"
              onClick={() => setVisibleRoomInfo((current) => (current === "users" ? null : "users"))}
              className="flex items-center gap-2 rounded bg-zinc-800 p-2 text-sm hover:bg-zinc-700"
              title="Show total users"
              aria-label={`Show total users ${users.length + 1}`}
            >
              <UsersRound size={14} aria-hidden="true" />
              {visibleRoomInfo === "users" ? <span>{users.length + 1}</span> : null}
            </button>
            <button
              type="button"
              onClick={() => setVisibleRoomInfo((current) => (current === "user" ? null : "user"))}
              className="flex items-center gap-2 rounded bg-zinc-800 p-2 text-sm hover:bg-zinc-700"
              title="Show your user ID"
              aria-label={`Show your user ID ${userId}`}
            >
              <UserRound size={14} aria-hidden="true" />
              {visibleRoomInfo === "user" ? <span>{userId}</span> : null}
            </button>
            <button
              type="button"
              onClick={handleCopyRoomCode}
              className="rounded bg-sky-500 p-2 text-zinc-900 hover:bg-sky-400"
              aria-label={copyState === "copied" ? "Room code copied" : "Copy room code"}
              title={copyState === "copied" ? "Room code copied" : "Copy room code"}
            >
              {copyState === "copied" ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
            </button>
            {copyState === "copied" ? (
              <span className="rounded bg-emerald-500/20 px-2 py-1 text-xs text-emerald-300" role="status">
                Room code copied!
              </span>
            ) : null}
            {copyState === "error" ? (
              <span className="rounded bg-rose-500/20 px-2 py-1 text-xs text-rose-300" role="alert">
                Copy failed
              </span>
            ) : null}
          </div>
        </div>

        <Toolbar
          onClear={handleClear}
          onSave={handleSave}
          selectedTool={selectedTool}
          onToolChange={setSelectedTool}
          color={color}
          onColorChange={setColor}
          strokeWidth={strokeWidth}
          onStrokeWidthChange={setStrokeWidth}
          onUndo={() => {
            const nextElements = undo();
            socket?.emit("SCENE_CHANGE", { roomId, elements: nextElements });
          }}
          onRedo={() => {
            const nextElements = redo();
            socket?.emit("SCENE_CHANGE", { roomId, elements: nextElements });
          }}
          fontFamily={fontFamily}
          onFontFamilyChange={setFontFamily}
          fontSize={fontSize}
          onFontSizeChange={setFontSize}
        />

        <div className="mt-3">
          <VoiceControls
            isJoining={isJoining}
            isInVoice={isInVoice}
            isMuted={isMuted}
            isSpeaking={isSpeaking}
            activeSpeakerIds={activeSpeakerIds}
            participantCount={participantCount}
            onJoin={joinVoice}
            onLeave={leaveVoice}
            onToggleMute={toggleMute}
            remotePeers={remotePeers}
            error={voiceError}
            isChatVisible={isChatVisible}
            onChatToggle={() => setIsChatVisible((visible) => !visible)}
          />
        </div>

        <div className="relative mt-3">
          <div className="relative flex-1">
            <WhiteboardCanvas
              elements={elements}
              roomId={roomId}
              socket={socket}
              setElements={setElements}
              selectedTool={selectedTool}
              color={color}
              strokeWidth={strokeWidth}
              userId={userId}
              fontFamily={fontFamily}
              fontSize={fontSize}
            />
            <CursorLayer cursors={cursors} />
          </div>

          {isChatVisible ? (
            <ChatPanel
              userId={userId}
              messages={messages}
              onSendMessage={handleSendMessage}
              onClose={() => setIsChatVisible(false)}
            />
          ) : null}
        </div>
      </section>
    </main>
  );
}
