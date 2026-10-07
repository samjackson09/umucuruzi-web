import { ShoppingCart, Store, Bike, CheckCircle2, Sparkles } from "lucide-react";
import { cn } from "../../lib/cn";

const ROLES = [
  {
    value: "customer",
    label: "Customer",
    sub: "Shop & buy",
    icon: ShoppingCart,
    accent: "from-sky-500 to-blue-600",
  },
  {
    value: "trader",
    label: "Trader",
    sub: "Sell products",
    icon: Store,
    accent: "from-brand-500 to-brand-700",
  },
  {
    value: "agent",
    label: "Agent",
    sub: "Deliver orders",
    icon: Bike,
    accent: "from-emerald-500 to-emerald-700",
  },
];

export default function RolePicker({ value, onChange, error }) {
  return (
    <div className="mb-4">
      <div className="grid grid-cols-3 gap-3">
        {ROLES.map((r) => {
          const Icon = r.icon;
          const selected = value === r.value;

          return (
            <button
              key={r.value}
              type="button"
              onClick={() => onChange(r.value)}
              className={cn(
                "group relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 px-3 py-5 transition-all",
                "hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-brand-600/40",
                selected
                  ? "border-brand-600 bg-gradient-to-br " + r.accent + " text-white shadow-brand"
                  : "border-ink-200 bg-white text-ink-700 hover:border-brand-600 dark:border-ink-800 dark:bg-ink-900 dark:text-ink-200"
              )}
            >
              {/* Check mark */}
              {selected && (
                <CheckCircle2
                  size={14}
                  className="absolute right-2 top-2 text-white drop-shadow"
                />
              )}

              {/* Icon */}
              <span
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-xl transition-transform",
                  selected
                    ? "bg-white/25 text-white"
                    : "bg-brand-50 text-brand-600 group-hover:scale-110 dark:bg-brand-600/10"
                )}
              >
                <Icon size={20} />
              </span>

              {/* Label */}
              <span className="text-[13px] font-extrabold leading-tight">
                {r.label}
              </span>

              {/* Sub */}
              <span
                className={cn(
                  "text-[10.5px] font-semibold",
                  selected ? "text-white/85" : "text-ink-400"
                )}
              >
                {r.sub}
              </span>
            </button>
          );
        })}
      </div>

      {/* Hint */}
      <p className="mt-3 flex items-center gap-1.5 text-[11.5px] text-ink-400">
        <Sparkles size={11} className="text-brand-600" />
        You can change this anytime from your profile settings.
      </p>

      {/* Error */}
      {error && (
        <p className="mt-2 flex items-center gap-1 text-[11.5px] font-semibold text-danger-500">
          {error}
        </p>
      )}
    </div>
  );
}