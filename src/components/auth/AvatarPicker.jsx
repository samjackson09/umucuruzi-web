import { ShoppingCart, Store, Bike, CheckCircle2 } from "lucide-react";

const ROLES = [
  { value: "customer", label: "Customer", sub: "Shop", icon: ShoppingCart },
  { value: "trader",   label: "Trader",   sub: "Sell", icon: Store },
  { value: "agent",    label: "Agent",    sub: "Deliver", icon: Bike },
];

export default function RolePicker({ value, onChange }) {
  return (
    <div className="mb-4 grid grid-cols-3 gap-3">
      {ROLES.map((r) => {
        const selected = value === r.value;
        const Icon = r.icon;
        return (
          <button
            key={r.value}
            type="button"
            onClick={() => onChange(r.value)}
            className={
              "relative flex flex-col items-center justify-center rounded-2xl border-2 px-2 py-4 transition-all " +
              (selected
                ? "border-brand-600 bg-brand-600 text-white shadow-brand"
                : "border-ink-200 bg-ink-50 text-ink-700 hover:border-brand-600 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-200")
            }
          >
            {selected && (
              <CheckCircle2
                size={14}
                className="absolute right-2 top-2 text-white"
              />
            )}
            <span
              className={
                "mb-2 flex h-10 w-10 items-center justify-center rounded-xl " +
                (selected ? "bg-white/20" : "bg-brand-50 dark:bg-brand-600/10")
              }
            >
              <Icon
                size={18}
                className={selected ? "text-white" : "text-brand-600"}
              />
            </span>
            <span className="text-[12.5px] font-extrabold leading-tight">
              {r.label}
            </span>
            <span
              className={
                "mt-0.5 text-[10.5px] font-semibold " +
                (selected ? "text-white/85" : "text-ink-400")
              }
            >
              {r.sub}
            </span>
          </button>
        );
      })}
    </div>
  );
}