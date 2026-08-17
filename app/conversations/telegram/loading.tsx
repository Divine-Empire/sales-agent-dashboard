export default function TelegramInboxLoading() {
  return (
    <div className="flex h-[calc(100svh-8.75rem)] min-h-[34rem] animate-pulse overflow-hidden rounded-xl border border-border">
      <div className="w-full border-r border-border bg-surface/35 p-4 md:w-[19rem]">
        <div className="h-5 w-28 rounded bg-border" />
        <div className="mt-4 h-10 rounded-lg bg-border/70" />
        <div className="mt-5 space-y-5">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="flex gap-3">
              <div className="h-10 w-10 shrink-0 rounded-full bg-border" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-3 w-2/3 rounded bg-border" />
                <div className="h-3 w-full rounded bg-border/70" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="hidden flex-1 place-items-center md:grid">
        <div className="h-4 w-44 rounded bg-border" />
      </div>
    </div>
  );
}
