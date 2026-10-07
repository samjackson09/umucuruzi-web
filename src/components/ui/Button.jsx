import { forwardRef } from "react";
import { Loader2 } from "lucide-react";

export const Button = forwardRef(function Button(
  { loading, fullWidth, className = "", children, disabled, ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={
        "inline-flex h-14 items-center justify-center gap-2 rounded-full bg-brand-600 px-6 text-[15px] font-extrabold text-white transition-all hover:bg-brand-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 " +
        (fullWidth ? "w-full " : "") +
        className
      }
      {...rest}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : children}
    </button>
  );
});