export default function Loading() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading workspace">
      <div className="space-y-2">
        <div className="h-7 w-40 animate-pulse rounded bg-border" />
        <div className="h-4 w-72 max-w-full animate-pulse rounded bg-border/70" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="h-24 animate-pulse rounded-xl bg-surface" />
        ))}
      </div>
      <div className="h-80 animate-pulse rounded-xl bg-surface" />
    </div>
  );
}
