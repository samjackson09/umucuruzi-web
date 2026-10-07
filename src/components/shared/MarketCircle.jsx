import { Link } from "react-router-dom";
import { MapPin, Store } from "lucide-react";
import { getFullImageUrl } from "../../lib/image";

export default function MarketCircle({ market }) {
  const img = getFullImageUrl(market.logo_image);
  const name = market.name?.length > 14 ? market.name.slice(0, 13) + "…" : market.name;

  return (
    <Link
      to={`/markets/${market.id}`}
      className="group flex w-[104px] shrink-0 flex-col items-center"
    >
      <div className="h-[76px] w-[76px] overflow-hidden rounded-full border-2 border-ink-200 bg-ink-50 transition-transform group-hover:scale-105 dark:border-ink-800 dark:bg-ink-900">
        {img ? (
          <img src={img} alt={market.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-ink-400">
            <Store size={26} />
          </div>
        )}
      </div>
      <span className="mt-2 line-clamp-1 w-full text-center text-[11px] font-bold">
        {name}
      </span>
      {market.district && (
        <span className="mt-0.5 flex items-center gap-0.5 text-[10px] text-ink-400">
          <MapPin size={8} />
          {market.district}
        </span>
      )}
    </Link>
  );
}