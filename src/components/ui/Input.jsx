import { cn } from "../../lib/cn";
import { InputHTMLAttributes, forwardRef, ReactNode, useState } from "react";
import { LucideIcon, Eye, EyeOff } from "lucide-react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: LucideIcon;
  error?: string | null;
  labelAccessory?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, icon: Icon, error, labelAccessory, className, type = "text", ...rest },
  ref
) {
  const [focused, setFocused] = useState(false);
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="mb-4">
      {label && (
        <div className="mb-2 flex items-center justify-between">
          <label className="text-[11px] font-extrabold uppercase tracking-wider text-ink-500 dark:text-ink-400">
            {label}
          </label>
          {labelAccessory}
        </div>
      )}

      <div
        className={cn(
          "flex h-12 items-center rounded-xl border-2 bg-ink-50 px-3 transition-colors dark:bg-ink-900",
          "focus-within:bg-white dark:focus-within:bg-ink-800",
          error
            ? "border-danger-500/70 bg-danger-500/5"
            : focused
            ? "border-brand-600"
            : "border-ink-200 dark:border-ink-700"
        )}
      >
        {Icon && (
          <Icon
            className={cn(
              "mr-2 h-[18px] w-[18px] shrink-0",
              error
                ? "text-danger-500"
                : focused
                ? "text-brand-600"
                : "text-ink-400"
            )}
          />
        )}

        <input
          ref={ref}
          type={isPassword && show ? "text" : type}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={cn(
            "h-full flex-1 bg-transparent text-[15px] font-medium text-ink-900 outline-none placeholder:text-ink-400 dark:text-ink-100",
            className
          )}
          {...rest}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="ml-2 text-ink-400 hover:text-ink-600"
            tabIndex={-1}
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-[11.5px] font-semibold text-danger-500">
          <span className="inline-block h-1 w-1 rounded-full bg-danger-500" />
          {error}
        </p>
      )}
    </div>
  );
});