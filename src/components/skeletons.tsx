// Pasek postępu na górze (pokazywany w trakcie ładowania trasy).
export function TopBar() {
  return (
    <div className="fixed left-0 right-0 top-0 z-50 h-[3px] overflow-hidden bg-brand/10">
      <span
        className="absolute top-0 h-full rounded-full bg-brand"
        style={{ animation: "ciao-bar 1.1s ease-in-out infinite" }}
      />
    </div>
  );
}

function Bar({ className = "" }: { className?: string }) {
  return <div className={`rounded-lg bg-muted ${className}`} />;
}

// Ogólny szkielet treści (nagłówek + kafelki + wiersze).
export function ContentSkeleton() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse">
      <Bar className="mb-2 h-7 w-44" />
      <Bar className="mb-6 h-4 w-64 opacity-70" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Bar key={i} className="h-24" />
        ))}
      </div>
      <div className="mt-6 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Bar key={i} className="h-14" />
        ))}
      </div>
    </div>
  );
}

// Szkielet katalogu (siatka kart).
export function CatalogSkeleton() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse">
      <Bar className="mb-2 h-7 w-40" />
      <Bar className="mb-6 h-4 w-72 opacity-70" />
      <Bar className="mb-4 h-9 w-full max-w-sm" />
      <div className="mb-6 flex flex-wrap gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Bar key={i} className="h-7 w-20" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl border border-border bg-surface"
          >
            <div className="aspect-[4/3] bg-muted" />
            <div className="space-y-2 p-3">
              <Bar className="h-4 w-3/4" />
              <Bar className="h-5 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
