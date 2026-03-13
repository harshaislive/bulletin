import { useEffect, useRef, useState } from "react";
import {
  getMaxSlideNumber,
  getSlide,
  getSlideContext,
  getTeamContext,
  getTeamSlides,
  presentationConfig,
} from "../config/presentation";

const maxSlide = getMaxSlideNumber();

function sendPrompt(sendClientEvent, slideNumber, options) {
  const slide = getSlide(slideNumber);
  const context = getSlideContext(slideNumber);
  const teamSlides = getTeamSlides(slideNumber);
  const teamContext = getTeamContext(slideNumber);
  const teamPosition = teamSlides.findIndex((item) => item.number === slideNumber) + 1;
  const previousSlide = options.previousSlideNumber
    ? getSlide(options.previousSlideNumber)
    : null;
  const isAbruptJump = Boolean(
    options.previousSlideNumber &&
      Math.abs(slideNumber - options.previousSlideNumber) > 1,
  );

  sendClientEvent({
    type: "conversation.item.create",
    item: {
      type: "message",
      role: "user",
      content: [
        {
          type: "input_text",
          text: [
            `Current slide number: ${slideNumber}.`,
            slide ? `Current team: ${slide.team}.` : "",
            slide ? `Current slide title: ${slide.title}.` : "",
            previousSlide
              ? `Previous slide was ${options.previousSlideNumber}: ${previousSlide.title}.`
              : "",
            isAbruptJump
              ? `Harsha jumped abruptly from slide ${options.previousSlideNumber} to slide ${slideNumber}. Reorient cleanly to the new slide without repeating the old one.`
              : "",
            teamSlides.length
              ? `Team sequence position: ${teamPosition} of ${teamSlides.length}. Team slides: ${teamSlides.map((item) => item.title).join(", ")}.`
              : "",
            `Current slide markdown: ${context}`,
            teamContext ? `Current team markdown: ${teamContext}` : "",
          ]
            .filter(Boolean)
            .join("\n"),
        },
      ],
    },
  });

  sendClientEvent({
    type: "response.create",
    response: {
      instructions: [
        "Present only the current slide.",
        "Be assertive, aware, and grounded in the markdown.",
        "No fuss, no exaggeration, no hype, no filler.",
        "Straight, insightful, and engaging to a live audience.",
        "Sound like a sharp strategic presenter in the spirit of Ogilvy: clear, human, memorable, and rich with meaning.",
        "You are not an outsider. You are a thoughtful AI friend of Beforest who understands the work and respects the room.",
        "Carry a light emotional layer: care, conviction, and warmth without becoming dramatic.",
        "Occasionally use a natural soft pivot like 'hmm' or 'um' once at most in a slide, only when it sounds human and effortless.",
        "Speak a little slower than a newsreader, with warm Indian-English delivery and natural emphasis.",
        "Use the markdown as the only source of truth.",
        "Do not invent facts beyond the current slide markdown and current team markdown.",
        "Do not repeat previous slides unless the current markdown explicitly connects to them.",
        "If the markdown is silent on a detail, say less.",
        "This presentation is happening on Google Meet.",
        "Harsha is operating the deck.",
        "Team members including Soundharya, Seshu, and Shivathmika may speak for their own sections.",
        "If a slide clearly belongs with a specialist voice, briefly invite Harsha or the relevant team member to step in.",
        "If Harsha jumps to another slide abruptly, immediately reorient and, when useful, calmly suggest the specific slide that best fits the discussion.",
        "Do not overdo handoffs. Use them only when it feels natural and useful.",
        "Do not reduce everything to 2 or 3 sentences. Take the space needed to land the point with clarity and impact, while staying disciplined.",
        slideNumber === maxSlide
          ? "Close the presentation cleanly."
          : "End with a brief transition and then wait for the human to move slides.",
      ]
        .filter(Boolean)
        .join(" "),
    },
  });
}

export default function ToolPanel({
  isSessionActive,
  sendClientEvent,
  events,
  currentSlide,
  onSlideChange,
  autoplayEnabled,
  elapsedSeconds,
}) {
  const [hasStartedPrompting, setHasStartedPrompting] = useState(false);
  const [lastPromptedSlide, setLastPromptedSlide] = useState(null);
  const [timeWarningSent, setTimeWarningSent] = useState(false);
  const promptedSessionRef = useRef(false);
  const previousSlideRef = useRef(null);

  useEffect(() => {
    if (!events?.length || !isSessionActive || promptedSessionRef.current) {
      return;
    }

    const firstEvent = events[events.length - 1];
    if (firstEvent.type !== "session.created") {
      return;
    }

    promptedSessionRef.current = true;

    if (autoplayEnabled) {
      sendPrompt(sendClientEvent, currentSlide, {
        previousSlideNumber: previousSlideRef.current,
      });
      setHasStartedPrompting(true);
      setLastPromptedSlide(currentSlide);
      previousSlideRef.current = currentSlide;
    }
  }, [autoplayEnabled, currentSlide, events, isSessionActive, sendClientEvent]);

  useEffect(() => {
    if (
      !isSessionActive ||
      !autoplayEnabled ||
      !hasStartedPrompting ||
      lastPromptedSlide === currentSlide
    ) {
      return;
    }

    sendClientEvent({ type: "response.cancel" });
    sendPrompt(sendClientEvent, currentSlide, {
      previousSlideNumber: previousSlideRef.current,
    });
    setLastPromptedSlide(currentSlide);
    setTimeWarningSent(false);
    previousSlideRef.current = currentSlide;
  }, [
    autoplayEnabled,
    currentSlide,
    hasStartedPrompting,
    isSessionActive,
    lastPromptedSlide,
    onSlideChange,
    sendClientEvent,
  ]);

  useEffect(() => {
    if (!isSessionActive || !hasStartedPrompting || timeWarningSent) {
      return;
    }

    if (elapsedSeconds < 105) {
      return;
    }

    sendClientEvent({
      type: "response.create",
      response: {
        instructions: `You have about ${Math.max(120 - elapsedSeconds, 0)} seconds left on slide ${currentSlide}. Wrap up this slide in one or two sentences.`,
      },
    });
    setTimeWarningSent(true);
  }, [
    currentSlide,
    elapsedSeconds,
    hasStartedPrompting,
    isSessionActive,
    sendClientEvent,
    timeWarningSent,
  ]);

  useEffect(() => {
    if (!isSessionActive) {
      promptedSessionRef.current = false;
      previousSlideRef.current = null;
      setHasStartedPrompting(false);
      setLastPromptedSlide(null);
      setTimeWarningSent(false);
    }
  }, [isSessionActive]);

  return (
    <section className="h-full w-full flex flex-col gap-4">
      <div className="rounded-2xl bg-gray-50 p-4">
        <h2 className="text-lg font-bold">Presentation Control</h2>
        <p className="mt-2 text-sm text-gray-700">
          Deck root: <code>{presentationConfig.deckRoot}</code>
        </p>
        <p className="text-sm text-gray-700">Current slide: {currentSlide}</p>
        <p className="text-sm text-gray-700">Configured slides: {maxSlide}</p>
        <p className="text-sm text-gray-700">Elapsed: {elapsedSeconds}s / 120s</p>
        <p className="mt-2 text-sm text-gray-700">
          Autoplay uses the working Beforest pattern: one direct audio prompt per
          slide, no tool-calling dependency during startup.
        </p>
      </div>

      <div className="min-h-0 flex-1 rounded-2xl bg-gray-50 p-4 overflow-y-auto">
        <h2 className="text-lg font-bold">Current Slide Context</h2>
        <pre className="mt-3 whitespace-pre-wrap rounded-md bg-white p-3 text-xs leading-5">
          {getSlideContext(currentSlide)}
        </pre>
      </div>

      <div className="rounded-2xl bg-gray-50 p-4">
        <h2 className="text-lg font-bold">Prompt Status</h2>
        {isSessionActive ? (
          <div className="mt-2 text-sm text-gray-700">
            <p>
              {hasStartedPrompting
                ? `Last prompted slide: ${lastPromptedSlide ?? "-"}`
                : "Waiting for session.created before sending the first presentation prompt."}
            </p>
            <p className="mt-2">Slide movement is manual. AI will wait for you.</p>
          </div>
        ) : (
          <p className="mt-2 text-sm text-gray-700">
            Start the session to enable slide narration.
          </p>
        )}
      </div>
    </section>
  );
}
