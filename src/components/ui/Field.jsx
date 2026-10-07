import { useState } from "react";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

export default function Field({
  label,
  icon: Icon,
  type = "text",
  error,
  labelAccessory,
  multiline = false,
  rows = 3,
  className = "",
  children,
  ...rest
}) {
  const [focused, setFocused] = useState(false);
  const [show, setShow] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword && show ? "text" : type;

  return (
    <div className={`mb-4 ${className}`}>
      {(label || labelAccessory) && (
        <div className="mb-2 flex items-center justify-between">
          {label && (
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-ink-500 dark:text-ink-400">
              {label}
            </label>
          )}
          {labelAccessory}
        </div>
      )}

      <div
        className={
          "flex rounded-xl border-2 bg-ink-50 px-3 transition-colors dark:bg-ink-900 " +
          (multiline ? "items-start py-3 " : "h-12 items-center ") +
          (error
            ? "border-danger-500/70 bg-danger-500/5"
            : focused
            ? "border-brand-600 bg-white dark:bg-ink-800"
            : "border-ink-200 dark:border-ink-700")
        }
      >
        {Icon && (
          <Icon
            size={18}
            className={
              "shrink-0 " +
              (multiline ? "mt-0.5 mr-2 " : "mr-2 ") +
              (error
                ? "text-danger-500"
                : focused
                ? "text-brand-600"
                : "text-ink-400")
            }
          />
        )}

        {multiline ? (
          <textarea
            rows={rows}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="h-full w-full resize-none bg-transparent text-[15px] font-medium text-ink-900 outline-none placeholder:text-ink-400 dark:text-ink-100"
            {...rest}
          />
        ) : (
          <input
            type={inputType}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="h-full w-full bg-transparent text-[15px] font-medium text-ink-900 outline-none placeholder:text-ink-400 dark:text-ink-100"
            {...rest}
          />
        )}

        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            tabIndex={-1}
            className="ml-2 shrink-0 text-ink-400 hover:text-ink-600"
          >
            {show ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        )}
      </div>

      {children}

      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-[11.5px] font-semibold text-danger-500">
          <AlertCircle size={12} />
          {error}
        </p>
      )}
    </div>
  );
}