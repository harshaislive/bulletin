import { useCallback, useEffect, useRef, useState } from "react";
import logo from "/assets/openai-logomark.svg";
import { getMaxSlideNumber } from "../config/presentation";
import EventLog from "./EventLog";
import SessionControls from "./SessionControls";
import SlideDeck from "./SlideDeck";
import ToolPanel from "./ToolPanel";

export default function App() {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [events, setEvents] = useState([]);
  const [dataChannel, setDataChannel] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [slideInput, setSlideInput] = useState("1");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPushToTalkActive, setIsPushToTalkActive] = useState(false);
  const [autoplayEnabled, setAutoplayEnabled] = useState(true);
  const [slideStartedAt, setSlideStartedAt] = useState(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const peerConnection = useRef(null);
  const audioElement = useRef(null);
  const slideFrame = useRef(null);
  const deckContainer = useRef(null);
  const localAudioTrack = useRef(null);
  const maxSlide = getMaxSlideNumber();

  async function startSession() {
    setCurrentSlide(1);
    setSlideInput("1");
    setSlideStartedAt(Date.now());
    setElapsedSeconds(0);

    // Get a session token for OpenAI Realtime API
    const tokenResponse = await fetch("/token");
    const data = await tokenResponse.json();
    const EPHEMERAL_KEY = data.value;

    // Create a peer connection
    const pc = new RTCPeerConnection();

    // Set up to play remote audio from the model
    audioElement.current = document.createElement("audio");
    audioElement.current.autoplay = true;
    audioElement.current.playsInline = true;
    audioElement.current.style.display = "none";
    document.body.appendChild(audioElement.current);
    pc.ontrack = async (e) => {
      audioElement.current.srcObject = e.streams[0];
      try {
        await audioElement.current.play();
      } catch (error) {
        console.error("Remote audio playback failed:", error);
      }
    };

    // Add local audio track for microphone input in the browser
    const ms = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    const track = ms.getTracks()[0];
    track.enabled = false;
    localAudioTrack.current = track;
    pc.addTrack(track);

    // Set up data channel for sending and receiving events
    const dc = pc.createDataChannel("oai-events");
    setDataChannel(dc);

    // Start the session using the Session Description Protocol (SDP)
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    const baseUrl = "https://api.openai.com/v1/realtime/calls";
    const model = "gpt-realtime-mini";
    const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
      method: "POST",
      body: offer.sdp,
      headers: {
        Authorization: `Bearer ${EPHEMERAL_KEY}`,
        "Content-Type": "application/sdp",
      },
    });

    const sdp = await sdpResponse.text();
    const answer = { type: "answer", sdp };
    await pc.setRemoteDescription(answer);

    peerConnection.current = pc;
  }

  // Stop current session, clean up peer connection and data channel
  function stopSession() {
    if (dataChannel) {
      dataChannel.close();
    }

    peerConnection.current?.getSenders().forEach((sender) => {
      if (sender.track) {
        sender.track.stop();
      }
    });

    if (peerConnection.current) {
      peerConnection.current.close();
    }

    setIsSessionActive(false);
    setDataChannel(null);
    setIsPushToTalkActive(false);
    peerConnection.current = null;
    localAudioTrack.current = null;
    if (audioElement.current) {
      audioElement.current.remove();
      audioElement.current = null;
    }
  }

  // Send a message to the model
  const sendClientEvent = useCallback((message) => {
    if (dataChannel) {
      const timestamp = new Date().toLocaleTimeString();
      message.event_id = message.event_id || crypto.randomUUID();

      // send event before setting timestamp since the backend peer doesn't expect this field
      dataChannel.send(JSON.stringify(message));

      // if guard just in case the timestamp exists by miracle
      if (!message.timestamp) {
        message.timestamp = timestamp;
      }
      setEvents((prev) => [message, ...prev]);
    } else {
      console.error(
        "Failed to send message - no data channel available",
        message,
      );
    }
  }, [dataChannel]);

  // Send a text message to the model
  const sendTextMessage = useCallback((message) => {
    const event = {
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [
          {
            type: "input_text",
            text: message,
          },
        ],
      },
    };

    sendClientEvent(event);
    sendClientEvent({ type: "response.create" });
  }, [sendClientEvent]);

  const handleSlideChange = useCallback((slideNumber) => {
    const nextSlide = Math.min(Math.max(slideNumber, 1), maxSlide);
    setCurrentSlide(nextSlide);
    setSlideInput(String(nextSlide));
    setSlideStartedAt(Date.now());
    setElapsedSeconds(0);
  }, [maxSlide]);

  function handleHoldToTalkStart() {
    if (!isSessionActive || !localAudioTrack.current) return;

    setIsPushToTalkActive(true);
    localAudioTrack.current.enabled = true;
    sendClientEvent({
      type: "response.cancel",
    });
  }

  function handleHoldToTalkEnd() {
    if (!localAudioTrack.current) return;

    localAudioTrack.current.enabled = false;
    if (isPushToTalkActive) {
      sendClientEvent({ type: "response.create" });
    }
    setIsPushToTalkActive(false);
  }

  async function toggleFullscreen() {
    if (!document.fullscreenElement) {
      await deckContainer.current?.requestFullscreen?.();
      return;
    }

    await document.exitFullscreen?.();
  }

  // Attach event listeners to the data channel when a new one is created
  useEffect(() => {
    if (dataChannel) {
      // Append new server events to the list
      dataChannel.addEventListener("message", (e) => {
        const event = JSON.parse(e.data);
        if (!event.timestamp) {
          event.timestamp = new Date().toLocaleTimeString();
        }

        setEvents((prev) => [event, ...prev]);
      });

      // Set session active when the data channel is opened
      dataChannel.addEventListener("open", () => {
        setIsSessionActive(true);
        setEvents([]);
      });
    }
  }, [dataChannel]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - slideStartedAt) / 1000));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [slideStartedAt]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (event.key === "ArrowRight") {
        handleSlideChange(currentSlide + 1);
      }

      if (event.key === "ArrowLeft") {
        handleSlideChange(currentSlide - 1);
      }
    }

    function handleFullscreenChange() {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [currentSlide, maxSlide]);

  return (
    <>
      <nav
        className={`${isFullscreen ? "hidden" : "absolute"} top-0 left-0 right-0 h-16 flex items-center`}
      >
        <div className="flex items-center gap-4 w-full m-4 pb-2 border-0 border-b border-solid border-gray-200">
          <img style={{ width: "24px" }} src={logo} />
          <h1>realtime console</h1>
        </div>
      </nav>
      <main
        className={`${isFullscreen ? "absolute top-0" : "absolute top-16"} left-0 right-0 bottom-0`}
      >
        <section
          className={`${isFullscreen ? "absolute inset-0" : "absolute top-0 left-0 right-[420px] bottom-0"} flex`}
        >
          <section className="absolute top-0 left-0 right-0 bottom-80">
            <SlideDeck
              currentSlide={currentSlide}
              maxSlide={maxSlide}
              onSlideChange={handleSlideChange}
              iframeRef={slideFrame}
              deckContainerRef={deckContainer}
              isFullscreen={isFullscreen}
              onToggleFullscreen={toggleFullscreen}
            />
          </section>
          <section
            className={`${isFullscreen ? "hidden" : "absolute left-0 right-0 bottom-32 h-48 px-4 overflow-y-auto"}`}
          >
            <EventLog events={events} />
          </section>
          <section
            className={`${isFullscreen ? "hidden" : "absolute h-32 left-0 right-0 bottom-0 p-4"}`}
          >
            <SessionControls
              startSession={startSession}
              stopSession={stopSession}
              sendTextMessage={sendTextMessage}
              isSessionActive={isSessionActive}
              isPushToTalkActive={isPushToTalkActive}
              onHoldToTalkStart={handleHoldToTalkStart}
              onHoldToTalkEnd={handleHoldToTalkEnd}
              autoplayEnabled={autoplayEnabled}
              onToggleAutoplay={() => setAutoplayEnabled((value) => !value)}
            />
          </section>
        </section>
        <section
          className={`${isFullscreen ? "hidden" : "absolute top-0 w-[420px] right-0 bottom-0 p-4 pt-0 overflow-y-auto"}`}
        >
          <div className="mb-4 rounded-2xl bg-gray-50 p-4">
            <h2 className="text-lg font-bold">Human Navigation</h2>
            <div className="mt-3 flex items-center gap-2">
              <button
                className="rounded-full bg-gray-800 px-4 py-2 text-white disabled:opacity-40"
                disabled={currentSlide <= 1}
                onClick={() => handleSlideChange(currentSlide - 1)}
              >
                Previous
              </button>
              <button
                className="rounded-full bg-gray-800 px-4 py-2 text-white disabled:opacity-40"
                disabled={currentSlide >= maxSlide}
                onClick={() => handleSlideChange(currentSlide + 1)}
              >
                Next
              </button>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <input
                type="number"
                min="1"
                max={String(maxSlide)}
                value={slideInput}
                onChange={(event) => setSlideInput(event.target.value)}
                className="w-24 rounded-full border border-gray-200 px-4 py-2"
              />
              <button
                className="rounded-full bg-blue-600 px-4 py-2 text-white"
                onClick={() => handleSlideChange(Number(slideInput) || 1)}
              >
                Go To
              </button>
              <button
                className="rounded-full bg-gray-200 px-4 py-2"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? "Exit Full Screen" : "Present"}
              </button>
            </div>
            <p className="mt-3 text-sm text-gray-600">
              Keyboard shortcuts: <code>Left</code> and <code>Right</code>.
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Slide timer: <code>{elapsedSeconds}s</code> / <code>120s</code>
            </p>
          </div>
          <ToolPanel
            sendClientEvent={sendClientEvent}
            events={events}
            isSessionActive={isSessionActive}
            currentSlide={currentSlide}
            onSlideChange={handleSlideChange}
            autoplayEnabled={autoplayEnabled}
            elapsedSeconds={elapsedSeconds}
          />
        </section>
      </main>
    </>
  );
}
