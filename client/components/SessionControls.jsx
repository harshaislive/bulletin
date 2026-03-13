import { useState } from "react";
import {
  CloudLightning,
  CloudOff,
  MessageSquare,
  Mic,
  MicOff,
} from "react-feather";
import Button from "./Button";

function SessionStopped({ startSession }) {
  const [isActivating, setIsActivating] = useState(false);

  function handleStartSession() {
    if (isActivating) return;

    setIsActivating(true);
    startSession();
  }

  return (
    <div className="flex items-center justify-center w-full h-full">
      <Button
        onClick={handleStartSession}
        className={isActivating ? "bg-gray-600" : "bg-red-600"}
        icon={<CloudLightning height={16} />}
      >
        {isActivating ? "starting session..." : "start session"}
      </Button>
    </div>
  );
}

function SessionActive({
  stopSession,
  sendTextMessage,
  isPushToTalkActive,
  onHoldToTalkStart,
  onHoldToTalkEnd,
  autoplayEnabled,
  onToggleAutoplay,
}) {
  const [message, setMessage] = useState("");

  function handleSendClientEvent() {
    sendTextMessage(message);
    setMessage("");
  }

  return (
    <div className="flex items-center justify-center w-full h-full gap-4">
      <input
        onKeyDown={(e) => {
          if (e.key === "Enter" && message.trim()) {
            handleSendClientEvent();
          }
        }}
        type="text"
        placeholder="send a text message..."
        className="border border-gray-200 rounded-full p-4 flex-1"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <Button
        onClick={() => {
          if (message.trim()) {
            handleSendClientEvent();
          }
        }}
        icon={<MessageSquare height={16} />}
        className="bg-blue-400"
      >
        send text
      </Button>
      <Button
        onMouseDown={onHoldToTalkStart}
        onMouseUp={onHoldToTalkEnd}
        onMouseLeave={onHoldToTalkEnd}
        onTouchStart={onHoldToTalkStart}
        onTouchEnd={onHoldToTalkEnd}
        className={isPushToTalkActive ? "bg-green-600" : "bg-emerald-500"}
        icon={isPushToTalkActive ? <Mic height={16} /> : <MicOff height={16} />}
      >
        {isPushToTalkActive ? "listening..." : "hold to talk"}
      </Button>
      <Button
        onClick={onToggleAutoplay}
        className={autoplayEnabled ? "bg-amber-600" : "bg-gray-600"}
      >
        {autoplayEnabled ? "autoplay on" : "autoplay off"}
      </Button>
      <Button onClick={stopSession} icon={<CloudOff height={16} />}>
        disconnect
      </Button>
    </div>
  );
}

export default function SessionControls({
  startSession,
  stopSession,
  sendTextMessage,
  isSessionActive,
  isPushToTalkActive,
  onHoldToTalkStart,
  onHoldToTalkEnd,
  autoplayEnabled,
  onToggleAutoplay,
}) {
  return (
    <div className="flex gap-4 border-t-2 border-gray-200 h-full rounded-md">
      {isSessionActive ? (
        <SessionActive
          stopSession={stopSession}
          sendTextMessage={sendTextMessage}
          isPushToTalkActive={isPushToTalkActive}
          onHoldToTalkStart={onHoldToTalkStart}
          onHoldToTalkEnd={onHoldToTalkEnd}
          autoplayEnabled={autoplayEnabled}
          onToggleAutoplay={onToggleAutoplay}
        />
      ) : (
        <SessionStopped startSession={startSession} />
      )}
    </div>
  );
}
