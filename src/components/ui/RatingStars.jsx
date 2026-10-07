import { Star } from "lucide-react";

export function RatingStars({ value = 0, size = 14 }: { value?: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={
            i <= Math.round(value)
              ? "fill-amber-500 text-amber-500"
              : "text-ink-300"
          }
        />
      ))}
    </div>
  );
}