import { Link } from "react-router-dom";
import { Star, Store } from "lucide-react";
import { getFullImageUrl } from "../../lib/image";

export default function TraderCircle({ trader }) {
  const shop = trader.TraderProfile?.shop_name || trader.full_name || "Shop";
  const short = shop.length > 14 ? shop.slice(0, 13) + "…" : shop;
  const img = getFullImageUrl(trader.profile_image);
  const rating = parseFloat(trader.TraderProfile?.rating_avg) || 0;

  return (
    <Link
      to={`/traders/${trader.id}`}
      className="group flex w-[96px] shrink-0 flex-col items-center"
    >
      <div className="relative">
        <div className="h-[76px] w-[76px] overflow-hidden rounded-full border-2 border-brand-600/40 bg-white p-0.5 transition-transform group-hover:scale-105 dark:bg-ink-900">
          {img ? (
            <img
              src={img}
              alt={shop}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-600/10">
              <Store size={26} />
            </div>
          )}
        </div>
        {rating > 0 && (
          <span className="absolute -bottom-1 -right-1 flex items-center gap-1 rounded-full border-2 border-white bg-white px-1.5 py-0.5 text-[10px] font-black text-ink-900 shadow dark:border-ink-900 dark:bg-ink-900 dark:text-ink-100">
            <Star size={9} className="fill-amber-500 text-amber-500" />
            {rating.toFixed(1)}
          </span>
        )}
      </div>
      <span className="mt-2 line-clamp-1 w-full text-center text-[11px] font-bold text-ink-800 dark:text-ink-200">
        {short}
      </span>
    </Link>
  );
}