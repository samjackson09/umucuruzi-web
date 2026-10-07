import { Link } from "react-router-dom";
import { Star, MapPin, Store, ShieldCheck } from "lucide-react";
import { getFullImageUrl, extractFirstImage } from "../../lib/image";

export default function ProductCard({ product }) {
  const img = getFullImageUrl(extractFirstImage(product.images));
  const trader = product.trader || {};
  const shop =
    trader.TraderProfile?.shop_name || trader.full_name || "Verified Trader";
  const rating = parseFloat(trader.TraderProfile?.rating_avg) || 0;
  const location =
    trader.TraderProfile?.district ||
    trader.TraderProfile?.city ||
    "Rwanda";

  return (
    <Link
      to={`/products/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-ink-200/70 bg-white transition-all hover:-translate-y-0.5 hover:border-brand-600/50 hover:shadow-lg dark:border-ink-800 dark:bg-ink-900"
    >
      {/* Image */}
      <div className="relative aspect-square w-full overflow-hidden bg-ink-100 dark:bg-ink-800">
        {img ? (
          <img
            src={img}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-ink-300">
            <Store size={40} />
          </div>
        )}

        {/* Badges (like Alibaba: Verified, Top Pick) */}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          <span className="inline-flex items-center gap-1 rounded-md bg-brand-600/95 px-2 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wide text-white backdrop-blur">
            <ShieldCheck size={10} />
            Verified
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-3">
        {/* Title */}
        <h3 className="line-clamp-2 min-h-[34px] text-[13px] font-extrabold leading-snug text-ink-900 group-hover:text-brand-600 dark:text-ink-100">
          {product.name}
        </h3>

        {/* Description snippet — Alibaba style */}
        {product.description && (
          <p className="mt-1 line-clamp-2 min-h-[30px] text-[11px] leading-snug text-ink-500 dark:text-ink-400">
            {product.description}
          </p>
        )}

        {/* Price row */}
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-[10px] font-bold text-ink-500">RWF</span>
          <span className="text-[16px] font-black leading-none text-brand-600">
            {product.price}
          </span>
          <span className="text-[10px] font-semibold text-ink-400">
            /{product.unit || "piece"}
          </span>
        </div>

        {/* Min order */}
        <p className="mt-0.5 text-[10.5px] font-semibold text-ink-500">
          Min. order: {product.min_order || 1} {product.unit || "piece"}
        </p>

        {/* Supplier + location */}
        <div className="mt-2 flex items-center justify-between gap-2 border-t border-ink-100 pt-2 dark:border-ink-800">
          <div className="flex min-w-0 items-center gap-1">
            <Store size={10} className="shrink-0 text-ink-400" />
            <span className="truncate text-[10.5px] font-bold text-ink-600 dark:text-ink-300">
              {shop}
            </span>
          </div>
          {rating > 0 && (
            <div className="flex shrink-0 items-center gap-0.5 text-[10.5px] font-bold text-ink-500">
              <Star size={9} className="fill-amber-500 text-amber-500" />
              {rating.toFixed(1)}
            </div>
          )}
        </div>

        {/* Location */}
        <div className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-ink-400">
          <MapPin size={9} />
          <span className="truncate">{location}</span>
        </div>
      </div>
    </Link>
  );
}