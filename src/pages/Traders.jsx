import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search, MapPin, Star, Store, SlidersHorizontal, X, Loader2,
  Award, ChevronRight,
} from "lucide-react";
import { traderService } from "../services/trader";
import { getFullImageUrl } from "../lib/image";

const SORTS = [
  { key: "rating", label: "Top rated" },
  { key: "name",   label: "A → Z" },
  { key: "new",    label: "Newest" },
];

export default function Traders() {
  const [traders, setTraders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState(null);
  const [sortBy, setSortBy] = useState("rating");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await traderService.getTraders();
        setTraders(res || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* Business categories from trader data */
  const categories = useMemo(() => {
    const counts = {};
    traders.forEach((t) => {
      const c = (
        t.TraderProfile?.business_category ||
        t.business_category ||
        ""
      ).trim();
      if (!c) return;
      counts[c] = (counts[c] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [traders]);

  /* Filter + sort */
  const filtered = useMemo(() => {
    let list = traders;
    if (category) {
      list = list.filter((t) => {
        const c = (
          t.TraderProfile?.business_category ||
          t.business_category ||
          ""
        ).trim();
        return c === category;
      });
    }
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      list = list.filter((t) => {
        const name = (t.TraderProfile?.shop_name || t.full_name || "").toLowerCase();
        const district = (t.TraderProfile?.district || "").toLowerCase();
        return name.includes(needle) || district.includes(needle);
      });
    }
    const sorted = [...list];
    if (sortBy === "rating") {
      sorted.sort(
        (a, b) =>
          (parseFloat(b.TraderProfile?.rating_avg) || 0) -
          (parseFloat(a.TraderProfile?.rating_avg) || 0)
      );
    } else if (sortBy === "name") {
      sorted.sort((a, b) =>
        (a.TraderProfile?.shop_name || a.full_name || "").localeCompare(
          b.TraderProfile?.shop_name || b.full_name || ""
        )
      );
    } else {
      sorted.sort(
        (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
      );
    }
    return sorted;
  }, [traders, category, q, sortBy]);

  const filtersActive = !!category || !!q.trim() || sortBy !== "rating";

  return (
    <div className="container-app py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black tracking-tight">All traders</h1>
        <p className="mt-1 text-[12.5px] text-ink-500">
          {loading
            ? "Loading…"
            : `${filtered.length} of ${traders.length} ${
                traders.length === 1 ? "shop" : "shops"
              }`}
        </p>
      </div>

      {/* Search + filter toggle */}
      <div className="mb-5 flex gap-2">
        <div className="flex h-11 flex-1 items-center gap-2 rounded-full border border-ink-200 bg-white px-4 dark:border-ink-800 dark:bg-ink-900">
          <Search size={15} className="text-ink-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search shops or districts…"
            className="h-full flex-1 bg-transparent text-[13.5px] font-medium outline-none placeholder:text-ink-400"
          />
          {q && (
            <button onClick={() => setQ("")} className="text-ink-400">
              <X size={15} />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={
            "flex h-11 items-center gap-1.5 rounded-full border px-4 text-[12.5px] font-extrabold transition-colors " +
            (showFilters || filtersActive
              ? "border-brand-600 bg-brand-600 text-white"
              : "border-ink-200 bg-white text-ink-600 hover:border-brand-600 dark:border-ink-800 dark:bg-ink-900 dark:text-ink-300")
          }
        >
          <SlidersHorizontal size={14} />
          Filter
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mb-5 rounded-2xl border border-ink-200/70 bg-white p-4 dark:border-ink-800 dark:bg-ink-900">
          <p className="mb-3 text-[10.5px] font-extrabold uppercase tracking-wider text-ink-500">
            Sort by
          </p>
          <div className="mb-4 flex flex-wrap gap-2">
            {SORTS.map((s) => (
              <button
                key={s.key}
                onClick={() => setSortBy(s.key)}
                className={
                  "rounded-full border px-3.5 py-1.5 text-[12.5px] font-bold transition-colors " +
                  (sortBy === s.key
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-ink-200 bg-white text-ink-600 hover:border-brand-600 dark:border-ink-800 dark:bg-ink-900 dark:text-ink-300")
                }
              >
                {s.label}
              </button>
            ))}
          </div>

          {categories.length > 0 && (
            <>
              <p className="mb-3 text-[10.5px] font-extrabold uppercase tracking-wider text-ink-500">
                Business category
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setCategory(null)}
                  className={
                    "rounded-full border px-3.5 py-1.5 text-[12.5px] font-bold transition-colors " +
                    (!category
                      ? "border-brand-600 bg-brand-600 text-white"
                      : "border-ink-200 bg-white text-ink-600 hover:border-brand-600 dark:border-ink-800 dark:bg-ink-900 dark:text-ink-300")
                  }
                >
                  All
                </button>
                {categories.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setCategory(category === c.name ? null : c.name)}
                    className={
                      "rounded-full border px-3.5 py-1.5 text-[12.5px] font-bold transition-colors " +
                      (category === c.name
                        ? "border-brand-600 bg-brand-600 text-white"
                        : "border-ink-200 bg-white text-ink-600 hover:border-brand-600 dark:border-ink-800 dark:bg-ink-900 dark:text-ink-300")
                    }
                  >
                    {c.name} ({c.count})
                  </button>
                ))}
              </div>
            </>
          )}

          {filtersActive && (
            <button
              onClick={() => {
                setQ("");
                setCategory(null);
                setSortBy("rating");
              }}
              className="mt-4 flex items-center gap-1.5 text-[12.5px] font-bold text-brand-600"
            >
              <X size={12} />
              Reset filters
            </button>
          )}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-200 bg-white py-20 text-center dark:border-ink-800 dark:bg-ink-900">
          <Store size={44} className="mx-auto text-ink-300" />
          <p className="mt-4 text-lg font-black">No traders found</p>
          <p className="mt-1 text-[13px] text-ink-500">
            Try a different search or clear the filters.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((t) => (
            <TraderCard key={t.id} trader={t} />
          ))}
        </div>
      )}
    </div>
  );
}

function TraderCard({ trader }) {
  const p = trader.TraderProfile || {};
  const shop = p.shop_name || trader.full_name || "Shop";
  const img = getFullImageUrl(trader.profile_image);
  const rating = parseFloat(p.rating_avg) || 0;
  const location = [p.district, p.sector].filter(Boolean).join(", ");
  const isTop = rating >= 4.5;
  const initials = shop
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Link
      to={`/traders/${trader.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-ink-200/70 bg-white transition-all hover:-translate-y-0.5 hover:border-brand-600 hover:shadow-lg dark:border-ink-800 dark:bg-ink-900"
    >
      {/* Cover strip */}
      <div className="relative h-20 bg-gradient-to-br from-brand-600 to-navy-600">
        {isTop && (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[9.5px] font-black uppercase tracking-wide text-white shadow">
            <Award size={10} />
            Top
          </span>
        )}
      </div>

      {/* Avatar overlapping */}
      <div className="-mt-10 flex flex-col items-center px-4 pb-4">
        <div className="relative">
          <div className="h-20 w-20 overflow-hidden rounded-full border-4 border-white bg-brand-600 dark:border-ink-900">
            {img ? (
              <img src={img} alt={shop} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-lg font-black text-white">
                {initials}
              </div>
            )}
          </div>
          {rating > 0 && (
            <span className="absolute -bottom-1 right-0 flex items-center gap-1 rounded-full border-2 border-white bg-white px-1.5 py-0.5 text-[10px] font-black text-ink-900 shadow dark:border-ink-900 dark:bg-ink-900 dark:text-ink-100">
              <Star size={9} className="fill-amber-500 text-amber-500" />
              {rating.toFixed(1)}
            </span>
          )}
        </div>

        <p className="mt-3 line-clamp-1 text-center text-[14.5px] font-black">
          {shop}
        </p>

        {p.business_category && (
          <span className="mt-1.5 inline-block rounded-full bg-brand-50 px-2.5 py-0.5 text-[10.5px] font-extrabold text-brand-600 dark:bg-brand-600/10">
            {p.business_category}
          </span>
        )}

        {location && (
          <p className="mt-1.5 flex items-center gap-1 text-[11.5px] text-ink-500">
            <MapPin size={10} />
            {location}
          </p>
        )}

        <div className="mt-3 flex items-center gap-1 text-[12px] font-bold text-brand-600 opacity-0 transition-opacity group-hover:opacity-100">
          Visit shop <ChevronRight size={12} />
        </div>
      </div>
    </Link>
  );
}