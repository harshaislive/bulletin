import { beforestSlides } from "./beforestSlides";

const markdownModules = import.meta.glob("../presentation/beforest/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
});

const contextsByNumber = Object.fromEntries(
  Object.entries(markdownModules).map(([path, content]) => {
    const match = path.match(/slide-(\d+)\.md$/);
    return [Number(match[1]), String(content).trim()];
  }),
);

export const presentationConfig = {
  title: "Beforest Bulletin",
  deckRoot: "/beforest",
};

export function getSlide(number) {
  return beforestSlides.find((slide) => slide.number === number) || null;
}

export function getSlideContext(slideNumber) {
  const slide = getSlide(slideNumber);
  return (
    contextsByNumber[slideNumber] ||
    `No markdown context is configured for slide ${slideNumber}${slide ? ` (${slide.id})` : ""}.`
  );
}

export function getSlidePath(slideNumber) {
  return getSlide(slideNumber)?.path || beforestSlides[0]?.path || "/";
}

export function getMaxSlideNumber() {
  return beforestSlides.length;
}

export function getAvailableSlides() {
  return beforestSlides.map((slide) => slide.number);
}

export function getTeamSlides(slideNumber) {
  const slide = getSlide(slideNumber);
  if (!slide) return [];

  return beforestSlides.filter((item) => item.team === slide.team);
}

export function isFirstSlideOfTeam(slideNumber) {
  const teamSlides = getTeamSlides(slideNumber);
  return Boolean(teamSlides.length && teamSlides[0].number === slideNumber);
}

export function getTeamSummary(slideNumber) {
  const teamSlides = getTeamSlides(slideNumber);
  if (!teamSlides.length) {
    return "";
  }

  return teamSlides.map((slide) => slide.title).join(" -> ");
}

export function getTeamContext(slideNumber) {
  const teamSlides = getTeamSlides(slideNumber);
  if (!teamSlides.length) {
    return "";
  }

  return teamSlides
    .map((slide) => {
      const context = contextsByNumber[slide.number] || "";
      return [
        `Slide ${slide.number}: ${slide.title}`,
        context ? context.replace(/^# .+\n+/m, "").trim() : "",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");
}
