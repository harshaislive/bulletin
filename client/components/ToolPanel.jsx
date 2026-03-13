import { useEffect, useRef, useState } from "react";
import {
  getMaxSlideNumber,
  getSlide,
  getSlideContext,
  getTeamSummary,
  getTeamSlides,
  isFirstSlideOfTeam,
  presentationConfig,
} from "../config/presentation";

const maxSlide = getMaxSlideNumber();
const BASE_PRESENTATION_BRIEF = [
  "Present only the current slide.",
  "Be assertive, grounded, and engaging.",
  "No hype, no exaggeration, no invented facts.",
  "Use the current slide markdown as the source of truth.",
  "If a detail is not in the markdown, say less.",
  "This is a live Beforest bulletin on Google Meet.",
  "Harsha is operating the deck.",
  "Invite a team member to step in only when that is genuinely useful.",
].join(" ");

function sendPrompt(sendClientEvent, slideNumber, options) {
  const slide = getSlide(slideNumber);
  const context = getSlideContext(slideNumber);
  const teamSlides = getTeamSlides(slideNumber);
  const teamSummary = getTeamSummary(slideNumber);
  const isTeamOpeningSlide = isFirstSlideOfTeam(slideNumber);
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
            isTeamOpeningSlide && teamSummary
              ? `Team arc: ${teamSummary}.`
              : "",
            teamSlides.length
              ? `Team sequence position: ${teamPosition} of ${teamSlides.length}.`
              : "",
            options.selectedPresenter
              ? `${options.selectedPresenter} is the preferred human presenter to call in if a handoff is useful.`
              : "",
            `Current slide markdown:\n${context}`,
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
        BASE_PRESENTATION_BRIEF,
        "Sound insightful, warm, and precise, with measured Indian-English delivery.",
        "Do not repeat the previous slide unless the current slide clearly depends on it.",
        "If Harsha jumps abruptly, reorient immediately and continue from the new slide.",
        options.selectedPresenter
          ? `If a human handoff makes sense, call on ${options.selectedPresenter} first.`
          : "",
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
  autoplayEnabled,
  elapsedSeconds,
  onInterruptNarration,
  selectedPresenter,
}) {
  const [hasStartedPrompting, setHasStartedPrompting] = useState(false);
  const [lastPromptedSlide, setLastPromptedSlide] = useState(null);
  const [timeWarningSent, setTimeWarningSent] = useState(false);
  const promptedSessionRef = useRef(false);
  const previousSlideRef = useRef(null);
  const slidePromptTimerRef = useRef(null);

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
        selectedPresenter,
      });
      setHasStartedPrompting(true);
      setLastPromptedSlide(currentSlide);
      previousSlideRef.current = currentSlide;
    }
  }, [
    autoplayEnabled,
    currentSlide,
    events,
    isSessionActive,
    selectedPresenter,
    sendClientEvent,
  ]);

  useEffect(() => {
    if (
      !isSessionActive ||
      !autoplayEnabled ||
      !hasStartedPrompting ||
      lastPromptedSlide === currentSlide
    ) {
      return;
    }

    onInterruptNarration?.();

    slidePromptTimerRef.current = window.setTimeout(() => {
      sendPrompt(sendClientEvent, currentSlide, {
        previousSlideNumber: previousSlideRef.current,
        selectedPresenter,
      });
      setLastPromptedSlide(currentSlide);
      setTimeWarningSent(false);
      previousSlideRef.current = currentSlide;
      slidePromptTimerRef.current = null;
    }, 120);

    return () => {
      if (slidePromptTimerRef.current) {
        window.clearTimeout(slidePromptTimerRef.current);
        slidePromptTimerRef.current = null;
      }
    };
  }, [
    autoplayEnabled,
    currentSlide,
    hasStartedPrompting,
    isSessionActive,
    lastPromptedSlide,
    onInterruptNarration,
    selectedPresenter,
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
      if (slidePromptTimerRef.current) {
        window.clearTimeout(slidePromptTimerRef.current);
        slidePromptTimerRef.current = null;
      }
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
