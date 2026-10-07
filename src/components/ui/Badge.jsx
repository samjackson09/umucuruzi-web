import { cn } from "../../lib/cn";
import { HTMLAttributes } from "react";

interface Props extends HTMLAttributes<HTMLSpanElement> {
  color?: "brand" | "amber" | "emerald" | "danger" | "ink";
}

const map = {
  brand:   "bg-brand-50 text-brand-700 dark:bg-brand-600/15 dark:text-brand-300",
  amber:   "bg-amber-500/15 text-amber-600",
  emerald: "bg-emerald-500/15 text-emerald-600",
  danger:  "bg-danger-500/15 text-danger-500",
  ink:     "bg-ink-100 text-ink-700 dark:bg-ink-800 dark:text-ink-300",
};

export function Badge({ color = "ink", className, ...rest }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-extrabold tracking-wide",
        map[color],
        className
      )}
      {...rest}
    />
  );
}