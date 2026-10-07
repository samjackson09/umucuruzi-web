import { Link } from "react-router-dom";
import {
  Store, Utensils, Shirt, Smartphone, Wrench, Car, Hammer,
  Scissors, Coffee, Apple, Book, Flower2, ShoppingBag, Boxes,
} from "lucide-react";
import { useMemo } from "react";

const ICON_MAP = {
  food: Utensils, restaurant: Utensils, coffee: Coffee,
  clothing: Shirt, fashion: Shirt, textile: Shirt, tailor: Scissors,
  electronics: Smartphone, phone: Smartphone, tech: Smartphone,
  repair: Wrench, mechanic: Wrench, car: Car, auto: Car,
  construction: Hammer, hardware: Hammer,
  grocery: Apple, market: ShoppingBag, vegetables: Apple,
  beauty: Scissors, salon: Scissors,
  book: Book, stationery: Book,
  flower: Flower2, agriculture: Flower2,
};

function pickIcon(name, backendIcon) {
  if (backendIcon) return backendIcon;
  const n = (name || "").toLowerCase();
  for (const key of Object.keys(ICON_MAP)) {
    if (n.includes(key)) return ICON_MAP[key];
  }
  return Store;
}

const PALETTES = [
  { bg: "bg-brand-50 dark:bg-brand-600/10",   fg: "text-brand-600" },
  { bg: "bg-amber-500/10",                     fg: "text-amber-600" },
  { bg: "bg-emerald-500/10",                   fg: "text-emerald-600" },
  { bg: "bg-navy-600/10",                      fg: "text-navy-600" },
  { bg: "bg-pink-500/10",                      fg: "text-pink-600" },
  { bg: "bg-violet-500/10",                    fg: "text-violet-600" },
];

export default function BusinessCategories({ categories }) {
  const enriched = useMemo(() => {
    return (categories || []).slice(0, 12).map((c, i) => ({
      ...c,
      Icon: pickIcon(c.name, c.icon_web),
      palette: PALETTES[i % PALETTES.length],
    }));
  }, [categories]);

  if (!enriched.length) return null;

  return (
    <section>
      {/* Header */}
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-[17px] font-black tracking-tight text-ink-900 dark:text-ink-100">
            <Boxes size={16} className="text-brand-600" />
            Shop by business
          </h2>
          <p className="mt-0.5 text-[12px] text-ink-400">
            Discover {enriched.length}+ business categories
          </p>
        </div>
        <Link
          to="/search"
          className="text-[12.5px] font-bold text-brand-600 hover:text-brand-700"
        >
          View all →
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {enriched.map((cat) => (
          <Link
            key={cat.id}
            to={`/search?q=${encodeURIComponent(cat.name)}`}
            className="group relative flex flex-col items-start gap-2 overflow-hidden rounded-2xl border border-ink-200/70 bg-white p-3 transition-all hover:-translate-y-0.5 hover:border-brand-600 hover:shadow-lg dark:border-ink-800 dark:bg-ink-900"
          >
            {/* Icon */}
            <div
              className={
                "flex h-11 w-11 items-center justify-center rounded-xl transition-transform group-hover:scale-110 " +
                cat.palette.bg
              }
            >
              <cat.Icon size={20} className={cat.palette.fg} />
            </div>

            {/* Name */}
            <div className="min-w-0">
              <p className="line-clamp-1 text-[13px] font-extrabold text-ink-900 dark:text-ink-100">
                {cat.name}
              </p>
              {cat.group_name && (
                <p className="mt-0.5 line-clamp-1 text-[10.5px] text-ink-400">
                  {cat.group_name}
                </p>
              )}
            </div>

            {/* Hover arrow */}
            <span className="absolute right-3 top-3 text-ink-300 opacity-0 transition-opacity group-hover:opacity-100">
              →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}