import { getSlide, getSlidePath, presentationConfig } from "../config/presentation";

const presenters = [
  {
    id: "Soundharya",
    initials: "SO",
    colorClass: "bg-amber-500",
  },
  {
    id: "Seshu",
    initials: "SE",
    colorClass: "bg-emerald-600",
  },
  {
    id: "Shivathmika",
    initials: "SH",
    colorClass: "bg-sky-600",
  },
];

export default function SlideDeck({
  currentSlide,
  maxSlide,
  onSlideChange,
  iframeRef,
  deckContainerRef,
  isFullscreen,
  onToggleFullscreen,
  aiStatusToast,
  autoplayEnabled,
  onToggleAiNarration,
  selectedPresenter,
  onSelectPresenter,
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
        className="relative min-h-0 flex-1 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
      >
        <iframe
          ref={iframeRef}
          title="Presentation"
          src={getSlidePath(currentSlide)}
          className="h-full w-full border-0"
        />
        {aiStatusToast ? (
          <div className="pointer-events-none absolute right-4 top-4 z-40 rounded-full bg-gray-950/92 px-4 py-2 text-sm font-semibold text-white shadow-lg">
            {aiStatusToast}
          </div>
        ) : null}
        <div className="absolute bottom-6 right-6 z-30 flex items-end gap-3">
          <button
            type="button"
            title={autoplayEnabled ? "Turn AI off" : "Turn AI on"}
            onClick={onToggleAiNarration}
            className={`rounded-full px-4 py-3 text-sm font-semibold text-white shadow-lg transition ${
              autoplayEnabled ? "bg-amber-600" : "bg-gray-700"
            }`}
          >
            {autoplayEnabled ? "AI on" : "AI off"}
          </button>
          {presenters.map((presenter) => {
            const isSelected = selectedPresenter === presenter.id;
            return (
              <button
                key={presenter.id}
                type="button"
                title={`Call ${presenter.id}`}
                onClick={() =>
                  onSelectPresenter?.(isSelected ? null : presenter.id)
                }
                className={`group flex h-12 w-12 items-center justify-center rounded-full border-2 text-sm font-bold text-white shadow-lg transition ${
                  isSelected
                    ? "scale-105 border-white ring-4 ring-white/35"
                    : "border-white/30 hover:scale-105"
                } ${presenter.colorClass}`}
              >
                <span>{presenter.initials}</span>
                <span className="pointer-events-none absolute bottom-14 right-0 rounded-md bg-black/85 px-3 py-1 text-xs font-medium text-white opacity-0 transition group-hover:opacity-100">
                  {presenter.id}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
