import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft, MapPin, Store, Users, Package, CalendarDays,
  CheckCircle2, Clock, Search, X, Loader2, Plus, Share2, Star,
} from "lucide-react";
import { toast } from "sonner";
import { marketService } from "../services/market";
import { getFullImageUrl } from "../lib/image";
import { useAuthStore } from "../store/auth";

const fmtPrice = (n) => Number(n || 0).toLocaleString("en-US");

const parseDays = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return raw.replace(/[\[\]"]/g, "").split(",").map((s) => s.trim());
    }
  }
  return [];
};

const parseImages = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [raw];
    }
  }
  return [];
};

export default function MarketDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuthStore();

  const [market, setMarket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [q, setQ] = useState("");
  const [activeCat, setActiveCat] = useState(null);

  const isTrader = user?.role === "trader";

  useEffect(() => {
    (async () => {
      try {
        const res = await marketService.getMarketById(id);
        setMarket(res);
      } catch {
        toast.error("Could not load market");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const memberships = useMemo(() => market?.MarketMemberships || [], [market]);

  const allProducts = useMemo(() => {
    const list = [];
    memberships.forEach((m) => {
      const trader = m.User || m.trader;
      if (trader?.Products) {
        trader.Products.forEach((p) =>
          list.push({
            ...p,
            trader_name: trader.full_name || trader.username,
            trader_id: trader.id,
            trader_image: trader.profile_image,
          })
        );
      }
    });
    return list;
  }, [memberships]);

  const categories = useMemo(() => {
    const map = {};
    allProducts.forEach((p) => {
      if (p.Category?.name) {
        map[p.Category.name] = (map[p.Category.name] || 0) + 1;
      }
    });
    return Object.entries(map).map(([name, count]) => ({ name, count }));
  }, [allProducts]);

  const filtered = useMemo(() => {
    let list = allProducts;
    if (activeCat) {
      list = list.filter((p) => p.Category?.name === activeCat);
    }
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      list = list.filter((p) =>
        [p.name, p.description, p.trader_name]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(needle))
      );
    }
    return list;
  }, [allProducts, activeCat, q]);

  const isMember =
    isTrader &&
    memberships.some((m) => (m.User?.id || m.trader_id) === user?.id);

  const handleJoin = async () => {
    if (!isTrader) return toast.error("Only traders can join markets");
    setJoining(true);
    try {
      await marketService.joinMarket(id);
      toast.success("Joined market!");
      const updated = await marketService.getMarketById(id);
      setMarket(updated);
    } catch (e) {
      toast.error(e?.response?.data?.error || "Could not join market");
    } finally {
      setJoining(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: market?.name || "Market",
          text: `Check out ${market?.name} on umucuruzi!`,
          url,
        });
        return;
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.error("Could not share");
    }
  };

  if (loading) {
    return (
      <div className="container-app flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }
  if (!market) {
    return (
      <div className="container-app flex flex-col items-center py-24 text-center">
        <Store size={44} className="text-ink-300" />
        <p className="mt-4 text-lg font-black">Market not found</p>
        <Link
          to="/markets"
          className="mt-5 rounded-full bg-brand-600 px-5 py-2.5 text-[13px] font-extrabold text-white"
        >
          Back to markets
        </Link>
      </div>
    );
  }

  const logo = getFullImageUrl(market.logo_image);
  const banner = getFullImageUrl(market.banner_image);
  const days = parseDays(market.days_active);
  const isActive = market.is_active !== false;
  const location = [market.district, market.sector].filter(Boolean).join(", ");

  return (
    <div className="bg-surface dark:bg-ink-950">
      {/* ═══ Banner + logo ═══ */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-brand-600 to-navy-600 sm:h-64">
        {banner && (
          <img
            src={banner}
            alt={market.name}
            className="h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Back button */}
        <button
          onClick={() => nav(-1)}
          className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur hover:bg-black/60"
        >
          <ChevronLeft size={18} />
        </button>

        {/* Share */}
        <button
          onClick={handleShare}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur hover:bg-black/60"
        >
          <Share2 size={16} />
        </button>

        {/* Active badge */}
        <span
          className={
            "absolute right-4 top-16 flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wider text-white shadow-lg backdrop-blur " +
            (isActive ? "bg-emerald-500/90" : "bg-ink-500/80")
          }
        >
          {isActive ? <CheckCircle2 size={12} /> : <Clock size={12} />}
          {isActive ? "Active" : "Inactive"}
        </span>

        {/* Name block on banner */}
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
          <div className="flex items-end gap-4">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-2xl dark:border-ink-900 dark:bg-ink-900">
              {logo ? (
                <img src={logo} alt={market.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center bg-brand-600 text-2xl font-black text-white">
                  {market.name?.charAt(0)?.toUpperCase() || "M"}
                </div>
              )}
            </div>
            <div className="min-w-0 pb-1">
              <h1 className="line-clamp-1 text-2xl font-black tracking-tight text-white sm:text-3xl">
                {market.name}
              </h1>
              {location && (
                <p className="mt-1 flex items-center gap-1 text-[13px] text-white/85">
                  <MapPin size={12} />
                  {location}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Stats strip ═══ */}
      <div className="border-b border-ink-200/70 bg-white dark:border-ink-800 dark:bg-ink-900">
        <div className="container-app grid grid-cols-2 gap-4 py-5 sm:grid-cols-4">
          <StatBox icon={Users} label="Traders" value={memberships.length} />
          <StatBox icon={Store} label="Businesses" value={categories.length} />
          <StatBox icon={CalendarDays} label="Open days" value={days.length} />
          <StatBox icon={Package} label="Products" value={allProducts.length} />
        </div>
      </div>

      <div className="container-app grid gap-8 py-6 lg:grid-cols-[1fr_320px]">
        {/* ═══ LEFT: About + Open days + Products ═══ */}
        <div className="min-w-0 space-y-6">
          {/* About */}
          {market.description && (
            <div className="rounded-2xl border border-ink-200/70 bg-white p-5 dark:border-ink-800 dark:bg-ink-900">
              <h2 className="text-[15px] font-black">About this market</h2>
              <p className="mt-3 whitespace-pre-wrap text-[13.5px] leading-relaxed text-ink-600 dark:text-ink-300">
                {market.description}
              </p>
            </div>
          )}

          {/* Open days */}
          {days.length > 0 && (
            <div className="rounded-2xl border border-ink-200/70 bg-white p-5 dark:border-ink-800 dark:bg-ink-900">
              <h2 className="text-[15px] font-black">Open days</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {days.map((d) => (
                  <span
                    key={d}
                    className="rounded-full border border-brand-600/30 bg-brand-50 px-3 py-1.5 text-[12px] font-extrabold text-brand-600 dark:bg-brand-600/10"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Products */}
          <div className="rounded-2xl border border-ink-200/70 bg-white p-5 dark:border-ink-800 dark:bg-ink-900">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-[15px] font-black">
                Products ({filtered.length})
              </h2>
              <div className="flex h-10 min-w-[220px] flex-1 items-center gap-2 rounded-full border border-ink-200 bg-ink-50 px-3 dark:border-ink-800 dark:bg-ink-800/50">
                <Search size={14} className="text-ink-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search in this market…"
                  className="h-full flex-1 bg-transparent text-[13px] font-medium outline-none placeholder:text-ink-400"
                />
                {q && (
                  <button onClick={() => setQ("")} className="text-ink-400">
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Category chips */}
            {categories.length > 0 && (
              <div className="scrollbar-none mb-4 flex gap-2 overflow-x-auto pb-1">
                <button
                  onClick={() => setActiveCat(null)}
                  className={
                    "shrink-0 rounded-full border px-3 py-1.5 text-[12px] font-bold transition-colors " +
                    (!activeCat
                      ? "border-brand-600 bg-brand-600 text-white"
                      : "border-ink-200 bg-white text-ink-600 hover:border-brand-600 dark:border-ink-800 dark:bg-ink-900 dark:text-ink-300")
                  }
                >
                  All
                </button>
                {categories.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setActiveCat(activeCat === c.name ? null : c.name)}
                    className={
                      "shrink-0 rounded-full border px-3 py-1.5 text-[12px] font-bold transition-colors " +
                      (activeCat === c.name
                        ? "border-brand-600 bg-brand-600 text-white"
                        : "border-ink-200 bg-white text-ink-600 hover:border-brand-600 dark:border-ink-800 dark:bg-ink-900 dark:text-ink-300")
                    }
                  >
                    {c.name} ({c.count})
                  </button>
                ))}
              </div>
            )}

            {/* Grid */}
            {filtered.length === 0 ? (
              <div className="rounded-xl border border-dashed border-ink-200 py-16 text-center dark:border-ink-800">
                <Package size={36} className="mx-auto text-ink-300" />
                <p className="mt-3 text-[14px] font-black">No products yet</p>
                <p className="mt-1 text-[12.5px] text-ink-500">
                  {allProducts.length === 0
                    ? "Traders in this market haven't listed products yet."
                    : "Try a different search or category."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {filtered.map((p) => (
                  <ProductMiniCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ═══ RIGHT: Traders sidebar ═══ */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          {/* Join CTA (traders only) */}
          {isTrader && (
            <div className="rounded-2xl border border-ink-200/70 bg-white p-5 dark:border-ink-800 dark:bg-ink-900">
              <h3 className="text-[14px] font-black">
                {isMember ? "You're a member" : "Join this market"}
              </h3>
              <p className="mt-1.5 text-[12px] text-ink-500">
                {isMember
                  ? "Your shop is visible to customers browsing this market."
                  : "Add your shop to this market to reach more customers."}
              </p>
              <button
                onClick={handleJoin}
                disabled={joining || isMember}
                className={
                  "mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-full text-[13px] font-extrabold text-white shadow-md transition-all disabled:opacity-70 " +
                  (isMember
                    ? "bg-emerald-500"
                    : "bg-brand-600 shadow-brand hover:bg-brand-700")
                }
              >
                {joining ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : isMember ? (
                  <>
                    <CheckCircle2 size={15} />
                    Joined
                  </>
                ) : (
                  <>
                    <Plus size={15} />
                    Join market
                  </>
                )}
              </button>
            </div>
          )}

          {/* Traders list */}
          {memberships.length > 0 && (
            <div className="rounded-2xl border border-ink-200/70 bg-white p-5 dark:border-ink-800 dark:bg-ink-900">
              <h3 className="text-[14px] font-black">
                Traders ({memberships.length})
              </h3>
              <div className="mt-3 space-y-2">
                {memberships.slice(0, 12).map((m) => {
                  const trader = m.User || m.trader;
                  if (!trader) return null;
                  const avatar = getFullImageUrl(trader.profile_image);
                  return (
                    <Link
                      key={m.id}
                      to={`/traders/${trader.id}`}
                      className="flex items-center gap-3 rounded-xl p-1.5 transition-colors hover:bg-ink-50 dark:hover:bg-ink-800"
                    >
                      <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-brand-600">
                        {avatar ? (
                          <img
                            src={avatar}
                            alt={trader.full_name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[11px] font-black text-white">
                            {(trader.full_name || "T").charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[12.5px] font-bold">
                          {trader.TraderProfile?.shop_name ||
                            trader.full_name ||
                            "Trader"}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function StatBox({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-600/10">
        <Icon size={17} />
      </span>
      <div>
        <p className="text-[18px] font-black leading-none">{value}</p>
        <p className="mt-0.5 text-[10.5px] font-semibold uppercase tracking-wider text-ink-400">
          {label}
        </p>
      </div>
    </div>
  );
}

function ProductMiniCard({ product }) {
  const img = getFullImageUrl(parseImages(product.images)[0]);
  return (
    <Link
      to={`/products/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-ink-200/70 bg-white transition-all hover:-translate-y-0.5 hover:border-brand-600 hover:shadow-md dark:border-ink-800 dark:bg-ink-900"
    >
      <div className="aspect-square w-full overflow-hidden bg-ink-100 dark:bg-ink-800">
        {img ? (
          <img
            src={img}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-ink-300">
            <Store size={26} />
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="line-clamp-2 min-h-[34px] text-[12.5px] font-bold leading-tight">
          {product.name}
        </p>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-[14px] font-black text-brand-600">
            {fmtPrice(product.price)}
          </span>
          <span className="text-[9.5px] font-bold text-brand-600/80">RWF</span>
        </div>
      </div>
    </Link>
  );
}