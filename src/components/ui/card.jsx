import { cn } from "../../lib/cn";
import { HTMLAttributes } from "react";

interface Props extends HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
  elevated?: boolean;
}

export function Card({ padded = true, elevated = true, className, ...rest }: Props) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-ink-200/70 bg-white dark:border-ink-800 dark:bg-ink-900",
        padded && "p-5",
        elevated && "shadow-card",
        className
      )}
      {...rest}
    />
  );
}