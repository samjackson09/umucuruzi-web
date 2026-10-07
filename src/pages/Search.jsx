import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Search as SearchIcon, X, ArrowRight, MapPin, Store, Trophy, Star,
  Award, SlidersHorizontal, XCircle, RefreshCw, Package, LayoutGrid,
  CloudOff, Tag, Layers,
} from "lucide-react";
import { categoryService } from "../services/category";
import { searchService } from "../services/search";
import { traderService } from "../services/trader";
import { getFullImageUrl } from "../lib/image";
import { useAuthStore } from "../store/auth";

const SUGGESTIONS = ["Nyabugogo", "Kimironko", "Rulindo", "Musanze", "juice"];

const initials = (name) =>
  name
    ?.split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

function parseImages(images) {
  if (!images) return [];
  if (Array.isArray(images)) return images;
  try {
    const parsed = JSON.parse(images);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function Search() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const routeQ = params.get("q") || "";

  const [query, setQuery] = useState("");
  const [standard, setStandard] = useState({ products: [], traders: [], markets: [] });
  const [location, setLocation] = useState({ location: "", traders: [], categories: [] });
  const [activeTab, setActiveTab] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sortBy, setSortBy] = useState("rating");
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Filters (All tab)
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState(null);

  // Recommendations
  const [businessCategories, setBusinessCategories] = useState([]);
  const [productCategories, setProductCategories] = useState([]);
  const [topRatedShops, setTopRatedShops] = useState([]);
  const [recLoading, setRecLoading] = useState(true);

  const lastQ = useRef(null);

  /* Load recommendations once */
  useEffect(() => {
    (async () => {
      try {
        const [biz, prod, traders] = await Promise.allSettled([
          traderService.getBusinessCategories(),
          categoryService.getCategories(),
          traderService.getTraders(),
        ]);
        if (biz.status === "fulfilled") {
          setBusinessCategories(
            (biz.value || [])
              .filter((c) => c.is_active !== false)
              .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
              .slice(0, 12)
          );
        }
        if (prod.status === "fulfilled") {
          setProductCategories((prod.value || []).slice(0, 8));
        }
        if (traders.status === "fulfilled") {
          setTopRatedShops(
            (traders.value || [])
              .map((t) => ({
                ...t,
                _rating: parseFloat(t?.TraderProfile?.rating_avg) || 0,
              }))
              .filter((t) => t._rating > 0)
              .sort((a, b) => b._rating - a._rating)
              .slice(0, 12)
          );
        }
      } finally {
        setRecLoading(false);
      }
    })();
  }, []);

  /* Search */
  const handleSearch = async (overrideQ) => {
    const q = (overrideQ ?? query).trim();
    if (!q) return;
    if (overrideQ) setQuery(overrideQ);

    setLoading(true);
    setHasSearched(true);
    setSelectedCategory(null);
    setFilterType("all");
    setFilterCategory(null);

    try {
      const [stdRes, locRes] = await Promise.allSettled([
        searchService.searchAll(q),
        searchService.searchTradersByLocation(q),
      ]);
      const std =
        stdRes.status === "fulfilled"
          ? stdRes.value
          : { products: [], traders: [], markets: [] };
      const loc =
        locRes.status === "fulfilled"
          ? locRes.value
          : { location: q, traders: [], categories: [] };
      setStandard(std);
      setLocation(loc);
      setActiveTab((loc.traders || []).length >= 2 ? "location" : "all");
    } finally {
      setLoading(false);
    }
  };

  /* Auto-search from URL */
  useEffect(() => {
    if (routeQ && lastQ.current !== routeQ) {
      lastQ.current = routeQ;
      handleSearch(routeQ);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeQ]);

  const clearSearch = () => {
    setQuery("");
    setStandard({ products: [], traders: [], markets: [] });
    setLocation({ location: "", traders: [], categories: [] });
    setSelectedCategory(null);
    setHasSearched(false);
    setActiveTab("all");
    setFilterType("all");
    setFilterCategory(null);
    nav("/search");
  };

  /* Location traders (filtered + sorted) */
  const filteredLocationTraders = useMemo(() => {
    let list = [...(location.traders || [])];
    if (selectedCategory) {
      const c = selectedCategory.toLowerCase().trim();
      list = list.filter(
        (t) => (t.TraderProfile?.business_category || "").toLowerCase().trim() === c
      );
    }
    if (sortBy === "rating") {
      list.sort(
        (a, b) =>
          (parseFloat(b.TraderProfile?.rating_avg) || 0) -
          (parseFloat(a.TraderProfile?.rating_avg) || 0)
      );
    } else {
      list.sort((a, b) =>
        (a.TraderProfile?.shop_name || a.full_name || "").localeCompare(
          b.TraderProfile?.shop_name || b.full_name || ""
        )
      );
    }
    return list;
  }, [location.traders, selectedCategory, sortBy]);

  /* All results */
  const allItems = useMemo(
    () => [
      ...(standard.products || []).map((p) => ({ ...p, _type: "product" })),
      ...(standard.traders || []).map((t) => ({ ...t, _type: "trader" })),
      ...(standard.markets || []).map((m) => ({ ...m, _type: "market" })),
    ],
    [standard]
  );

  const typeCounts = useMemo(
    () => ({
      all: allItems.length,
      traders: allItems.filter((i) => i._type === "trader").length,
      products: allItems.filter((i) => i._type === "product").length,
      markets: allItems.filter((i) => i._type === "market").length,
    }),
    [allItems]
  );

  const filterCategories = useMemo(() => {
    const map = {};
    (standard.traders || []).forEach((t) => {
      const c = (t.TraderProfile?.business_category || "").trim();
      if (!c) return;
      if (!map[c]) map[c] = { name: c, count: 0, kind: "business" };
      map[c].count++;
    });
    (standard.products || []).forEach((p) => {
      const c = (p.Category?.name || "").trim();
      if (!c) return;
      if (!map[c]) map[c] = { name: c, count: 0, kind: "product" };
      map[c].count++;
    });
    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [standard]);

  const filteredAll = useMemo(() => {
    let list = allItems;
    if (filterType !== "all") list = list.filter((i) => i._type === filterType);
    if (filterCategory) {
      const c = filterCategory.toLowerCase();
      list = list.filter((i) => {
        if (i._type === "trader")
          return (i.TraderProfile?.business_category || "").toLowerCase() === c;
        if (i._type === "product")
          return (i.Category?.name || "").toLowerCase() === c;
        return false;
      });
    }
    return list;
  }, [allItems, filterType, filterCategory]);

  const hasLocation = (location.traders || []).length >= 2;
  const hasStandard = allItems.length > 0;

  return (
    <div className="container-app min-h-screen py-6">
      {/* ── Search bar ── */}
      <div className="mb-4 flex h-14 items-center gap-2 rounded-full border-2 border-brand-600 bg-white px-2 dark:bg-ink-900">
        <SearchIcon size={18} className="ml-3 text-ink-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Search products, traders, places…"
          className="h-full flex-1 bg-transparent px-2 text-[15px] font-medium outline-none placeholder:text-ink-400"
        />
        {query && (
          <button onClick={() => setQuery("")} className="p-1 text-ink-400">
            <X size={17} />
          </button>
        )}
        <button
          onClick={() => handleSearch()}
          className="flex h-10 items-center gap-1.5 rounded-full bg-brand-600 px-5 text-[13px] font-extrabold text-white hover:bg-brand-700"
        >
          <ArrowRight size={15} />
          Search
        </button>
      </div>

      {/* ── Body ── */}
      {loading ? (
        <div className="flex flex-col items-center py-24">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-ink-200 border-t-brand-600" />
          <p className="mt-3 text-sm text-ink-500">
            Searching "{query}"…
          </p>
        </div>
      ) : !hasSearched ? (
        <Recommendations
          recLoading={recLoading}
          businessCategories={businessCategories}
          productCategories={productCategories}
          topRatedShops={topRatedShops}
          onSearch={handleSearch}
        />
      ) : !hasStandard && !hasLocation ? (
        <div className="flex flex-col items-center py-24 text-center">
          <SearchIcon size={56} className="text-ink-300" />
          <h3 className="mt-4 text-lg font-extrabold">
            No results for "{query}"
          </h3>
          <p className="mt-1 text-sm text-ink-500">
            Try a different keyword or check the spelling.
          </p>
          <button
            onClick={clearSearch}
            className="mt-5 flex items-center gap-1.5 rounded-full border-2 border-brand-600 px-4 py-2 text-[12.5px] font-extrabold text-brand-600 hover:bg-brand-50"
          >
            <RefreshCw size={13} />
            New search
          </button>
        </div>
      ) : (
        <>
          {/* Tabs */}
          {hasLocation && (
            <div className="mb-4 flex gap-4 border-b border-ink-200 dark:border-ink-800">
              <TabBtn
                active={activeTab === "all"}
                onClick={() => setActiveTab("all")}
                icon={<LayoutGrid size={13} />}
                label="All results"
                count={allItems.length}
              />
              <TabBtn
                active={activeTab === "location"}
                onClick={() => setActiveTab("location")}
                icon={<MapPin size={13} />}
                label={`Shops in ${location.location}`}
                count={location.traders.length}
              />
            </div>
          )}

          {/* Filter bar (only for "all" tab) */}
          {activeTab === "all" && hasStandard && (
            <FilterBar
              filterType={filterType}
              setFilterType={setFilterType}
              filterCategory={filterCategory}
              setFilterCategory={setFilterCategory}
              counts={typeCounts}
              categories={filterCategories}
            />
          )}

          {/* Content */}
          {activeTab === "location" && hasLocation ? (
            <LocationList
              traders={filteredLocationTraders}
              allTraders={location.traders}
              location={location.location}
              categories={location.categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              sortBy={sortBy}
              setSortBy={setSortBy}
            />
          ) : (
            <AllResultsList
              items={filteredAll}
              total={allItems.length}
              query={query}
              filterCategory={filterCategory}
            />
          )}
        </>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   Recommendation (initial view)
   ══════════════════════════════════════════════════ */
function Recommendations({
  recLoading,
  businessCategories,
  productCategories,
  topRatedShops,
  onSearch,
}) {
  return (
    <div className="pb-16">
      {/* Hero */}
      <div className="mb-8 mt-4 flex flex-col items-center text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-600/10">
          <SearchIcon size={28} className="text-brand-600" />
        </div>
        <h2 className="text-xl font-black">What are you looking for?</h2>
        <p className="mt-1 text-sm text-ink-500">
          Search anything, or tap a suggestion below
        </p>

        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => onSearch(s)}
              className="flex items-center gap-1.5 rounded-full border border-ink-200 bg-white px-3.5 py-1.5 text-[12.5px] font-semibold text-ink-800 hover:border-brand-600 hover:text-brand-600 dark:border-ink-800 dark:bg-ink-900 dark:text-ink-200"
            >
              {/^[A-Z]/.test(s) ? <MapPin size={11} className="text-brand-600" /> : <SearchIcon size={11} className="text-brand-600" />}
              {s}
            </button>
          ))}
        </div>
      </div>

      {recLoading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-ink-200 border-t-brand-600" />
        </div>
      ) : (
        <>
          {topRatedShops.length > 0 && (
            <RecSection
              icon={<Trophy size={16} className="text-amber-500" />}
              title="Top rated shops"
              subtitle="Highest rated"
            >
              <div className="scrollbar-none flex gap-4 overflow-x-auto pb-2">
                {topRatedShops.map((t) => (
                  <Link
                    key={t.id}
                    to={`/traders/${t.id}`}
                    className="flex w-[96px] shrink-0 flex-col items-center"
                  >
                    <div className="relative">
                      <div className="h-[72px] w-[72px] overflow-hidden rounded-full border-2 border-brand-600/40 bg-white p-0.5 dark:bg-ink-900">
                        {t.profile_image ? (
                          <img
                            src={getFullImageUrl(t.profile_image)}
                            alt={t.full_name}
                            className="h-full w-full rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center rounded-full bg-brand-600 text-xl font-extrabold text-white">
                            {initials(t.full_name)}
                          </div>
                        )}
                      </div>
                      <span className="absolute -bottom-1 -right-1 flex items-center gap-1 rounded-full border-2 border-white bg-white px-1.5 py-0.5 text-[10px] font-black shadow dark:border-ink-900 dark:bg-ink-900">
                        ⭐ {t._rating.toFixed(1)}
                      </span>
                    </div>
                    <span className="mt-2 line-clamp-1 w-full text-center text-[11px] font-bold">
                      {t.TraderProfile?.shop_name || t.full_name}
                    </span>
                  </Link>
                ))}
              </div>
            </RecSection>
          )}

          {businessCategories.length > 0 && (
            <RecSection icon={<Store size={16} className="text-brand-600" />} title="Browse by business">
              <div className="scrollbar-none flex gap-3 overflow-x-auto pb-2">
                {businessCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => onSearch(cat.name)}
                    className="flex w-[110px] shrink-0 flex-col items-start rounded-2xl border border-ink-200 bg-white p-3 text-left hover:border-brand-600 hover:shadow-md dark:border-ink-800 dark:bg-ink-900"
                  >
                    <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-600/10">
                      <Store size={16} />
                    </span>
                    <span className="line-clamp-1 text-[12.5px] font-extrabold">
                      {cat.name}
                    </span>
                    {cat.group_name && (
                      <span className="mt-0.5 line-clamp-1 text-[10px] text-ink-400">
                        {cat.group_name}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </RecSection>
          )}

          {productCategories.length > 0 && (
            <RecSection icon={<Package size={16} className="text-brand-600" />} title="Popular products">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {productCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => onSearch(cat.name)}
                    className="flex items-center gap-2 rounded-xl border border-ink-200 bg-ink-50 px-3 py-3 text-left hover:border-brand-600 dark:border-ink-800 dark:bg-ink-900"
                  >
                    <Tag size={16} className="text-brand-600" />
                    <span className="line-clamp-1 text-[12.5px] font-bold">
                      {cat.name}
                    </span>
                  </button>
                ))}
              </div>
            </RecSection>
          )}

          {businessCategories.length === 0 &&
            productCategories.length === 0 &&
            topRatedShops.length === 0 && (
              <div className="flex flex-col items-center py-16 text-center">
                <CloudOff size={40} className="text-ink-300" />
                <p className="mt-3 text-sm text-ink-500">
                  Couldn't load suggestions. Try searching manually.
                </p>
              </div>
            )}
        </>
      )}
    </div>
  );
}

function RecSection({ icon, title, subtitle, children }) {
  return (
    <div className="mb-8">
      <div className="mb-3 flex items-end justify-between">
        <h3 className="flex items-center gap-2 text-[15px] font-black">
          {icon}
          {title}
        </h3>
        {subtitle && <span className="text-[11.5px] text-ink-400">{subtitle}</span>}
      </div>
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   Tabs + Filter bar
   ══════════════════════════════════════════════════ */
function TabBtn({ active, onClick, icon, label, count }) {
  return (
    <button
      onClick={onClick}
      className={
        "flex items-center gap-1.5 border-b-2 pb-2.5 text-[13px] font-bold transition-colors " +
        (active
          ? "border-brand-600 text-brand-600"
          : "border-transparent text-ink-500 hover:text-brand-600")
      }
    >
      {icon}
      {label}
      {count > 0 && (
        <span
          className={
            "ml-0.5 rounded-md px-1.5 py-0.5 text-[10.5px] font-extrabold " +
            (active
              ? "bg-brand-50 text-brand-600 dark:bg-brand-600/15"
              : "bg-ink-100 text-ink-500 dark:bg-ink-800")
          }
        >
          {count}
        </span>
      )}
    </button>
  );
}

function FilterBar({
  filterType, setFilterType,
  filterCategory, setFilterCategory,
  counts, categories,
}) {
  const active = (filterType !== "all" ? 1 : 0) + (filterCategory ? 1 : 0);

  const chip = (key, label, Icon, count) => {
    const sel = filterType === key;
    return (
      <button
        key={key}
        onClick={() => setFilterType(sel ? "all" : key)}
        className={
          "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-bold transition-colors " +
          (sel
            ? "border-brand-600 bg-brand-600 text-white"
            : "border-ink-200 bg-ink-50 text-ink-700 hover:border-brand-600 dark:border-ink-800 dark:bg-ink-900 dark:text-ink-200")
        }
      >
        <Icon size={12} />
        {label}
        <span
          className={
            "ml-0.5 rounded-md px-1.5 py-0.5 text-[10.5px] font-extrabold " +
            (sel ? "bg-white/25 text-white" : "bg-ink-200 text-ink-600 dark:bg-ink-800 dark:text-ink-300")
          }
        >
          {count}
        </span>
      </button>
    );
  };

  return (
    <div className="mb-4 border-b border-ink-200 pb-3 dark:border-ink-800">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[10.5px] font-extrabold uppercase tracking-wider text-ink-500">
          <SlidersHorizontal size={12} />
          Filter results
        </div>
        {active > 0 && (
          <button
            onClick={() => {
              setFilterType("all");
              setFilterCategory(null);
            }}
            className="flex items-center gap-1 text-[11.5px] font-bold text-brand-600"
          >
            <XCircle size={12} />
            Clear ({active})
          </button>
        )}
      </div>

      <div className="scrollbar-none flex gap-2 overflow-x-auto pb-1">
        {chip("all", "All", LayoutGrid, counts.all)}
        {counts.traders > 0 && chip("traders", "Shops", Store, counts.traders)}
        {counts.products > 0 && chip("products", "Products", Package, counts.products)}
        {counts.markets > 0 && chip("markets", "Markets", Layers, counts.markets)}

        {categories.length > 0 && (
          <div className="mx-1 h-5 w-px shrink-0 bg-ink-200 dark:bg-ink-800" />
        )}

        {categories.map((cat) => {
          const sel = filterCategory === cat.name;
          return (
            <button
              key={cat.name}
              onClick={() => setFilterCategory(sel ? null : cat.name)}
              className={
                "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-bold transition-colors " +
                (sel
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-ink-200 bg-ink-50 text-ink-700 hover:border-brand-600 dark:border-ink-800 dark:bg-ink-900 dark:text-ink-200")
              }
            >
              {cat.kind === "business" ? <Store size={11} /> : <Tag size={11} />}
              <span className="max-w-[140px] truncate">{cat.name}</span>
              <span
                className={
                  "ml-0.5 rounded-md px-1.5 py-0.5 text-[10.5px] font-extrabold " +
                  (sel ? "bg-white/25 text-white" : "bg-ink-200 text-ink-600 dark:bg-ink-800 dark:text-ink-300")
                }
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   All results list
   ══════════════════════════════════════════════════ */
function AllResultsList({ items, total, query, filterCategory }) {
  return (
    <>
      <p className="mb-3 text-[12.5px] font-semibold text-ink-500">
        {items.length} of {total} results for "{query}"
        {filterCategory ? ` in ${filterCategory}` : ""}
      </p>

      {items.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <SlidersHorizontal size={40} className="text-ink-300" />
          <h3 className="mt-3 text-base font-extrabold">No matching results</h3>
          <p className="mt-1 text-sm text-ink-500">
            Try changing the filter or clearing the category.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <StandardResult key={`${item._type}-${item.id}`} item={item} />
          ))}
        </div>
      )}
    </>
  );
}

function StandardResult({ item }) {
  let image = null;
  let title = "";
  let subtitle = "";
  let to = "";
  let typeLabel = item._type.toUpperCase();

  if (item._type === "product") {
    const imgs = parseImages(item.images);
    image = getFullImageUrl(imgs[0] || null);
    title = item.name;
    const shop = item.trader?.TraderProfile?.shop_name || item.trader?.full_name || "Trader";
    subtitle = `${shop} • ${item.price} RWF`;
    to = `/products/${item.id}`;
  } else if (item._type === "trader") {
    const p = item.TraderProfile || {};
    image = getFullImageUrl(item.profile_image);
    title = p.shop_name || item.full_name;
    subtitle = p.district ? `${p.district}${p.sector ? ", " + p.sector : ""}` : "Trader";
    to = `/traders/${item.id}`;
  } else {
    image = getFullImageUrl(item.logo_image);
    title = item.name;
    subtitle = `${item.district || ""}${item.sector ? ", " + item.sector : ""}`;
    to = `/markets/${item.id}`;
  }

  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-xl border border-ink-200 bg-white p-3 transition-all hover:border-brand-600 hover:shadow-md dark:border-ink-800 dark:bg-ink-900"
    >
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-ink-100 dark:bg-ink-800">
        {image ? (
          <img src={image} alt={title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-ink-400">
            <Store size={20} />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14.5px] font-bold text-ink-900 dark:text-ink-100">
          {title}
        </p>
        <p className="mt-0.5 truncate text-[12.5px] text-ink-500">{subtitle}</p>
        <span className="mt-1 inline-block rounded-md bg-brand-50 px-1.5 py-0.5 text-[9.5px] font-extrabold tracking-wide text-brand-600 dark:bg-brand-600/10">
          {typeLabel}
        </span>
      </div>
      <span className="shrink-0 text-ink-300">›</span>
    </Link>
  );
}

/* ══════════════════════════════════════════════════
   Location traders list
   ══════════════════════════════════════════════════ */
function LocationList({
  traders, allTraders, location, categories,
  selectedCategory, setSelectedCategory,
  sortBy, setSortBy,
}) {
  return (
    <>
      <div className="mb-4 flex flex-col gap-3 border-b border-ink-200 pb-4 sm:flex-row sm:items-center sm:justify-between dark:border-ink-800">
        <div>
          <h2 className="flex items-center gap-1.5 text-[17px] font-black">
            <MapPin size={15} className="text-brand-600" />
            {location}
          </h2>
          <p className="mt-0.5 text-[12px] text-ink-500">
            {allTraders.length} shop{allTraders.length === 1 ? "" : "s"} found
            {selectedCategory ? ` • ${traders.length} in ${selectedCategory}` : ""}
          </p>
        </div>

        <div className="flex gap-1 rounded-lg border border-ink-200 bg-ink-50 p-0.5 dark:border-ink-800 dark:bg-ink-900">
          <SortBtn active={sortBy === "rating"} onClick={() => setSortBy("rating")} icon={<Star size={11} />} label="Rated" />
          <SortBtn active={sortBy === "name"} onClick={() => setSortBy("name")} icon={<Award size={11} />} label="A-Z" />
        </div>
      </div>

      {categories.length > 0 && (
        <div className="scrollbar-none mb-4 flex gap-2 overflow-x-auto pb-1">
          <CatChip active={!selectedCategory} onClick={() => setSelectedCategory(null)}>
            All ({allTraders.length})
          </CatChip>
          {categories.map((c) => (
            <CatChip
              key={c.name}
              active={selectedCategory === c.name}
              onClick={() =>
                setSelectedCategory(selectedCategory === c.name ? null : c.name)
              }
            >
              {c.name} ({c.count})
            </CatChip>
          ))}
        </div>
      )}

      {traders.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <SlidersHorizontal size={40} className="text-ink-300" />
          <h3 className="mt-3 text-base font-extrabold">
            No {selectedCategory} in {location}
          </h3>
          <button
            onClick={() => setSelectedCategory(null)}
            className="mt-3 flex items-center gap-1.5 rounded-full border-2 border-brand-600 px-4 py-2 text-[12.5px] font-extrabold text-brand-600"
          >
            <RefreshCw size={13} />
            Show all {allTraders.length}
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {traders.map((t) => (
            <LocationTraderRow key={t.id} trader={t} />
          ))}
        </div>
      )}
    </>
  );
}

function SortBtn({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={
        "flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[11.5px] font-bold " +
        (active ? "bg-brand-600 text-white" : "text-ink-500")
      }
    >
      {icon}
      {label}
    </button>
  );
}

function CatChip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={
        "shrink-0 rounded-full border px-3 py-1.5 text-[12px] font-bold transition-colors " +
        (active
          ? "border-brand-600 bg-brand-600 text-white"
          : "border-ink-200 bg-ink-50 text-ink-700 hover:border-brand-600 dark:border-ink-800 dark:bg-ink-900 dark:text-ink-200")
      }
    >
      {children}
    </button>
  );
}

function LocationTraderRow({ trader }) {
  const p = trader.TraderProfile || {};
  const shop = p.shop_name || trader.full_name || "Trader";
  const avatar = getFullImageUrl(trader.profile_image);
  const rating = parseFloat(p.rating_avg) || 0;
  const top = rating >= 4.5;
  const cat = (p.business_category || "").trim();
  const loc = [p.district, p.sector].filter(Boolean).join(", ");

  return (
    <Link
      to={`/traders/${trader.id}`}
      className="flex items-center gap-3 rounded-xl border border-ink-200 bg-white p-3 transition-all hover:border-brand-600 hover:shadow-md dark:border-ink-800 dark:bg-ink-900"
    >
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
        {avatar ? (
          <img src={avatar} alt={shop} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center bg-brand-600 text-lg font-extrabold text-white">
            {initials(trader.full_name || shop)}
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-[14.5px] font-bold text-ink-900 dark:text-ink-100">
            {shop}
          </p>
          {top && (
            <span className="flex shrink-0 items-center gap-1 rounded-md bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-extrabold tracking-wider text-amber-600">
              <Trophy size={9} />
              TOP
            </span>
          )}
        </div>

        {cat && (
          <span className="mt-1 inline-block rounded-md bg-brand-50 px-1.5 py-0.5 text-[10.5px] font-bold text-brand-600 dark:bg-brand-600/10">
            {cat}
          </span>
        )}

        {loc && (
          <p className="mt-1 flex items-center gap-1 text-[11.5px] text-ink-500">
            <MapPin size={10} />
            {loc}
          </p>
        )}
      </div>

      <div className="flex shrink-0 flex-col items-end">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              size={11}
              className={
                s <= Math.round(rating)
                  ? "fill-amber-500 text-amber-500"
                  : "text-ink-300"
              }
            />
          ))}
        </div>
        <p className="mt-1 text-[13px] font-extrabold text-ink-900 dark:text-ink-100">
          {rating > 0 ? rating.toFixed(1) : "New"}
        </p>
      </div>
    </Link>
  );
}