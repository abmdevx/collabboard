import { useEffect, useRef } from "react";
import { MessageCircle, Mic, MicOff, PhoneOff, UsersRound } from "lucide-react";

function RemoteAudio({ stream }) {
  const audioRef = useRef(null);

  useEffect(() => {
    if (!audioRef.current) {
      return;
    }

    audioRef.current.srcObject = stream;
  }, [stream]);

  return <audio ref={audioRef} autoPlay playsInline />;
}

export function VoiceControls({
  isJoining,
  isInVoice,
  isMuted,
  isSpeaking,
  activeSpeakerIds,
  participantCount,
  onJoin,
  onLeave,
  onToggleMute,
  remotePeers,
  error,
  isChatVisible,
  onChatToggle,
}) {
  return (
    <>
      <div className="rounded-xl border border-zinc-700 bg-zinc-900/70 px-3 py-2">
      <div className="flex flex-wrap items-center gap-2">
        {!isInVoice ? (
          <button
            type="button"
            onClick={onJoin}
            disabled={isJoining}
            className="rounded-lg bg-sky-500 p-2 text-zinc-950 hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label={isJoining ? "Joining voice" : "Join voice"}
            title={isJoining ? "Joining voice" : "Join voice"}
          >
            <Mic size={16} aria-hidden="true" />
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={onToggleMute}
              className="rounded-lg bg-zinc-800 p-2 text-zinc-100 hover:bg-zinc-700"
              aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
              title={isMuted ? "Unmute microphone" : "Mute microphone"}
            >
              {isMuted ? <MicOff size={16} aria-hidden="true" /> : <Mic size={16} aria-hidden="true" />}
            </button>
            <button
              type="button"
              onClick={onLeave}
              className="rounded-lg bg-rose-500 p-2 text-white hover:bg-rose-400"
              aria-label="Leave voice"
              title="Leave voice"
            >
              <PhoneOff size={16} aria-hidden="true" />
            </button>
          </>
        )}

        <span className="flex items-center gap-1 rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-300" title={`Voice participants: ${participantCount}`}>
          <UsersRound size={14} aria-hidden="true" />
          {participantCount}
        </span>
        <button
          type="button"
          onClick={onChatToggle}
          className="ml-auto rounded-lg bg-violet-500 p-2 text-zinc-950 hover:bg-violet-400"
          aria-pressed={isChatVisible}
          aria-label={isChatVisible ? "Close chat" : "Open chat"}
          title={isChatVisible ? "Close chat" : "Open chat"}
        >
          <MessageCircle size={16} aria-hidden="true" />
        </button>
      </div>

      {error ? <p className="mt-2 text-xs text-rose-300">{error}</p> : null}

      <div className="hidden">
        {remotePeers.map((peer) => (
          <RemoteAudio key={peer.socketId} stream={peer.stream} />
        ))}
      </div>
      </div>

      {(isSpeaking || activeSpeakerIds.length > 0) && (
        <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex max-w-[260px] flex-col gap-2">
          {isSpeaking ? (
            <span className="rounded-full border border-emerald-400/40 bg-emerald-500/20 px-3 py-1.5 text-xs font-medium text-emerald-200 shadow-lg">
              You are speaking
            </span>
          ) : null}
          {activeSpeakerIds.map((socketId) => (
            <span
              key={socketId}
              className="rounded-full border border-sky-400/40 bg-sky-500/20 px-3 py-1.5 text-xs font-medium text-sky-200 shadow-lg"
            >
              {`User ${socketId.slice(0, 6)} speaking`}
            </span>
          ))}
        </div>
      )}
    </>
  );
}
