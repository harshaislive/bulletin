import { getSlide, getSlidePath, presentationConfig } from "../config/presentation";

export default function SlideDeck({
  currentSlide,
  maxSlide,
  onSlideChange,
  iframeRef,
  deckContainerRef,
  isFullscreen,
  onToggleFullscreen,
}) {
  const slide = getSlide(currentSlide);

  return (
    <section className="h-full w-full flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">{presentationConfig.title}</h2>
          <p className="text-sm text-gray-600">
            {slide?.team || "Presentation"}:{" "}
            <code>{slide?.id || "slide"}</code>
          </p>
        </div>
        <div className="text-sm font-semibold">
          Slide {currentSlide} / {maxSlide}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <button
          className="rounded-full bg-gray-800 px-4 py-2 text-white disabled:opacity-40"
          disabled={currentSlide <= 1}
          onClick={() => onSlideChange(currentSlide - 1)}
        >
          Previous
        </button>
        <button
          className="rounded-full bg-gray-800 px-4 py-2 text-white disabled:opacity-40"
          disabled={currentSlide >= maxSlide}
          onClick={() => onSlideChange(currentSlide + 1)}
        >
          Next
        </button>
        <button
          className="rounded-full bg-blue-600 px-4 py-2 text-white"
          onClick={onToggleFullscreen}
        >
          {isFullscreen ? "Exit Full Screen" : "Full Screen"}
        </button>
        <p className="text-sm text-gray-600">
          Use arrow keys, buttons, or AI navigation. Source deck lives under{" "}
          <code>client/public/beforest/</code>.
        </p>
      </div>
      <div
        ref={deckContainerRef}
        className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
      >
        <iframe
          ref={iframeRef}
          title="Presentation"
          src={getSlidePath(currentSlide)}
          className="h-full w-full border-0"
        />
      </div>
    </section>
  );
}
