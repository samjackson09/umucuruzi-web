import { cn } from "../../lib/cn";

export function StatCard({ icon: Icon, label, value, suffix, color = "brand" }) {
  const palette = {
    brand: "bg-brand-50 text-brand-600 dark:bg-brand-600/10",
    amber: "bg-amber-500/15 text-amber-600",
    emerald: "bg-emerald-500/15 text-emerald-600",
    sky: "bg-sky-500/15 text-sky-600",
    violet: "bg-violet-500/15 text-violet-600",
    pink: "bg-pink-500/15 text-pink-600",
  };

  return (
    <div className="rounded-2xl border border-ink-200/70 bg-white p-4 shadow-sm dark:border-ink-800 dark:bg-ink-900">
      <div className={cn("mb-3 flex h-9 w-9 items-center justify-center rounded-xl", palette[color])}>
        <Icon size={17} />
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-black tracking-tight text-ink-900 dark:text-ink-100">
          {value}
        </span>
        {suffix && (
          <span className="text-[11px] font-bold text-ink-400">{suffix}</span>
        )}
      </div>
      <p className="mt-1 text-[11.5px] font-bold text-ink-500 dark:text-ink-400">
        {label}
      </p>
    </div>
  );
}