import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft, MapPin, Store, Star, Award, Phone, Share2, Package,
  Search, X, Loader2, Calendar, MessageCircle, CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { traderService } from "../services/trader";
import { productService } from "../services/product";
import { reviewService } from "../services/review";
import { getFullImageUrl, extractFirstImage } from "../lib/image";
import { useAuthStore } from "../store/auth";

const fmtPrice = (n) => Number(n || 0).toLocaleString("en-US");

const formatPhone = (phone) => {
  if (!phone) return null;
  let cleaned = phone.replace(/[^\d+]/g, "");
  if (cleaned.startsWith("00")) cleaned = "+" + cleaned.slice(2);
  if (!cleaned.startsWith("+")) cleaned = "+250" + cleaned;
  return cleaned.replace("+", "");
};

const timeAgo = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "";
  const s = (Date.now() - dt.getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return Math.floor(s / 60) + "m ago";
  if (s < 86400) return Math.floor(s / 3600) + "h ago";
  return Math.floor(s / 86400) + "d ago";
};

export default function TraderProfile() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuthStore();

  const [trader, setTrader] = useState(null);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [sortBy, setSortBy] = useState("default");

  // review form
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isSelf = user && String(user.id) === String(id);
  const canReview = user && user.role === "customer" && !isSelf;

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [t, p, r] = await Promise.all([
          traderService.getTraderById(id),
          productService.getProductsByTrader(id).catch(() => []),
          reviewService.getTraderReviews(id).catch(() => []),
        ]);
        setTrader(t);
        setProducts(p || []);
        setReviews(Array.isArray(r) ? r : []);
      } catch {
        toast.error("Could not load trader");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const filtered = useMemo(() => {
    let list = [...products];
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      list = list.filter((p) =>
        [p.name, p.description]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(needle))
      );
    }
    if (sortBy === "price_asc")
      list.sort((a, b) => Number(a.price) - Number(b.price));
    else if (sortBy === "price_desc")
      list.sort((a, b) => Number(b.price) - Number(a.price));
    else if (sortBy === "name")
      list.sort((a, b) => String(a.name).localeCompare(String(b.name)));
    return list;
  }, [products, q, sortBy]);

  const myReview = useMemo(
    () => reviews.find((r) => String(r.customer_id) === String(user?.id)) || null,
    [reviews, user]
  );

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: shop, url });
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

  const handleWhatsApp = () => {
    const phone = trader?.phone || trader?.TraderProfile?.payment_phone;
    if (!phone) return toast.error("No phone number on file");
    const cleaned = formatPhone(phone);
    window.open(`https://wa.me/${cleaned}`, "_blank");
  };

  const handleCall = () => {
    const phone = trader?.phone || trader?.TraderProfile?.payment_phone;
    if (!phone) return toast.error("No phone number on file");
    window.location.href = `tel:${phone}`;
  };

  const submitReview = async () => {
    if (!canReview) return toast.error("Only customers can review");
    if (reviewRating < 1) return toast.error("Please choose a rating");
    setSubmitting(true);
    try {
      await reviewService.createTraderReview(id, {
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      toast.success(myReview ? "Review updated" : "Review submitted");
      setShowReviewForm(false);
      setReviewRating(0);
      setReviewComment("");
      const fresh = await reviewService.getTraderReviews(id);
      setReviews(Array.isArray(fresh) ? fresh : []);
    } catch (e) {
      toast.error(e?.response?.data?.error || "Could not submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteReview = async () => {
    if (!myReview) return;
    if (!confirm("Delete your review?")) return;
    try {
      await reviewService.deleteTraderReview(myReview.id);
      toast.success("Review deleted");
      const fresh = await reviewService.getTraderReviews(id);
      setReviews(Array.isArray(fresh) ? fresh : []);
    } catch {
      toast.error("Could not delete review");
    }
  };

  if (loading) {
    return (
      <div className="container-app flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }
  if (!trader) {
    return (
      <div className="container-app flex flex-col items-center py-24 text-center">
        <Store size={44} className="text-ink-300" />
        <p className="mt-4 text-lg font-black">Trader not found</p>
        <Link to="/traders" className="mt-5 rounded-full bg-brand-600 px-5 py-2.5 text-[13px] font-extrabold text-white">
          Back to traders
        </Link>
      </div>
    );
  }

  const profile = trader.TraderProfile || {};
  const avatar = getFullImageUrl(trader.profile_image);
  const shop = profile.shop_name || trader.full_name || "Shop";
  const rating = parseFloat(profile.rating_avg) || 0;
  const location = [profile.district, profile.sector].filter(Boolean).join(", ");
  const isTop = rating >= 4.5;

  const ratingCounts = [0, 0, 0, 0, 0];
  reviews.forEach((r) => {
    if (r.rating >= 1 && r.rating <= 5) ratingCounts[r.rating - 1]++;
  });

  return (
    <div className="bg-surface dark:bg-ink-950">
      {/* ═══ Cover + avatar ═══ */}
      <div className="relative h-40 overflow-hidden bg-gradient-to-br from-brand-600 via-brand-600 to-navy-600 sm:h-56">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <button
          onClick={() => nav(-1)}
          className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur hover:bg-black/60"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={handleShare}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur hover:bg-black/60"
        >
          <Share2 size={16} />
        </button>
      </div>

      {/* ═══ Identity card ═══ */}
      <div className="container-app -mt-16">
        <div className="rounded-3xl border border-ink-200/70 bg-white p-5 shadow-lg dark:border-ink-800 dark:bg-ink-900 sm:p-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <div className="relative">
              <div className="h-24 w-24 overflow-hidden rounded-2xl border-4 border-white bg-brand-600 shadow-lg dark:border-ink-900">
                {avatar ? (
                  <img src={avatar} alt={shop} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-3xl font-black text-white">
                    {shop.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              {isTop && (
                <span className="absolute -right-1 -top-1 flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[9.5px] font-black uppercase tracking-wide text-white shadow">
                  <Award size={10} />
                  Top
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-black tracking-tight text-ink-900 dark:text-ink-100 sm:text-3xl">
                {shop}
              </h1>
              {trader.full_name && trader.full_name !== shop && (
                <p className="mt-1 text-[13px] font-semibold text-ink-500">
                  {trader.full_name}
                </p>
              )}
              <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 sm:justify-start">
                {rating > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Star size={14} className="fill-amber-500 text-amber-500" />
                    <span className="text-[13.5px] font-black text-ink-900 dark:text-ink-100">
                      {rating.toFixed(1)}
                    </span>
                    <span className="text-[12px] text-ink-400">
                      ({reviews.length})
                    </span>
                  </div>
                )}
                {profile.business_category && (
                  <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-extrabold text-brand-600 dark:bg-brand-600/10">
                    {profile.business_category}
                  </span>
                )}
                {location && (
                  <span className="flex items-center gap-1 text-[12.5px] text-ink-500">
                    <MapPin size={11} />
                    {location}
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-2 sm:ml-auto">
              {(trader.phone || profile.payment_phone) && (
                <>
                  <button
                    onClick={handleWhatsApp}
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#25D366] text-white shadow-sm transition-transform hover:scale-105"
                    title="Chat on WhatsApp"
                  >
                    <MessageCircle size={18} />
                  </button>
                  <button
                    onClick={handleCall}
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-ink-200 bg-white text-ink-600 hover:border-brand-600 dark:border-ink-800 dark:bg-ink-900"
                    title="Call"
                  >
                    <Phone size={17} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-5 grid grid-cols-3 gap-3 border-t border-ink-100 pt-5 dark:border-ink-800">
            <StatBox label="Products" value={products.length} />
            <StatBox label="Reviews" value={reviews.length} />
            <StatBox label="Rating" value={rating ? rating.toFixed(1) : "—"} />
          </div>
        </div>
      </div>

      {/* ═══ Main content ═══ */}
      <div className="container-app grid gap-8 py-8 lg:grid-cols-[1fr_360px]">
        {/* LEFT: products */}
        <div className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-[17px] font-black">
              Products ({filtered.length})
            </h2>

            <div className="flex flex-1 items-center gap-2 sm:max-w-md">
              <div className="flex h-10 flex-1 items-center gap-2 rounded-full border border-ink-200 bg-white px-3 dark:border-ink-800 dark:bg-ink-900">
                <Search size={14} className="text-ink-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search this shop…"
                  className="h-full flex-1 bg-transparent text-[13px] font-medium outline-none placeholder:text-ink-400"
                />
                {q && (
                  <button onClick={() => setQ("")} className="text-ink-400">
                    <X size={14} />
                  </button>
                )}
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-10 rounded-full border border-ink-200 bg-white px-3 text-[12.5px] font-bold outline-none dark:border-ink-800 dark:bg-ink-900"
              >
                <option value="default">Sort: Default</option>
                <option value="price_asc">Price ↑</option>
                <option value="price_desc">Price ↓</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-ink-200 bg-white py-16 text-center dark:border-ink-800 dark:bg-ink-900">
              <Package size={40} className="mx-auto text-ink-300" />
              <p className="mt-3 text-[15px] font-black">No products</p>
              <p className="mt-1 text-[12.5px] text-ink-500">
                {products.length === 0
                  ? "This shop hasn't listed products yet."
                  : "Try a different search."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {filtered.map((p) => (
                <ProductMini key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: about + reviews */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          {(profile.description || trader.description) && (
            <div className="rounded-2xl border border-ink-200/70 bg-white p-5 dark:border-ink-800 dark:bg-ink-900">
              <h3 className="text-[14.5px] font-black">About this shop</h3>
              <p className="mt-3 whitespace-pre-wrap text-[13px] leading-relaxed text-ink-600 dark:text-ink-300">
                {profile.description || trader.description}
              </p>
            </div>
          )}

          <div className="rounded-2xl border border-ink-200/70 bg-white p-5 dark:border-ink-800 dark:bg-ink-900">
            <div className="flex items-center justify-between">
              <h3 className="text-[14.5px] font-black">
                Reviews ({reviews.length})
              </h3>
              {canReview && (
                <button
                  onClick={() => {
                    setShowReviewForm((v) => !v);
                    if (myReview) {
                      setReviewRating(myReview.rating || 0);
                      setReviewComment(myReview.comment || "");
                    }
                  }}
                  className="text-[12.5px] font-bold text-brand-600"
                >
                  {showReviewForm ? "Cancel" : myReview ? "Edit" : "Write"}
                </button>
              )}
            </div>

            {/* Rating breakdown */}
            {reviews.length > 0 && (
              <div className="mt-4 space-y-1.5">
                {[5, 4, 3, 2, 1].map((s) => {
                  const cnt = ratingCounts[s - 1];
                  const pct = (cnt / reviews.length) * 100;
                  return (
                    <div key={s} className="flex items-center gap-2">
                      <span className="w-4 text-[11px] font-bold text-ink-500">{s}</span>
                      <Star size={9} className="fill-amber-500 text-amber-500" />
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
                        <div
                          className="h-full rounded-full bg-brand-600"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-6 text-right text-[10.5px] text-ink-400">
                        {cnt}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Review form */}
            {showReviewForm && canReview && (
              <div className="mt-4 rounded-xl border border-ink-200 bg-ink-50 p-3 dark:border-ink-800 dark:bg-ink-800/50">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <button
                      key={i}
                      onClick={() => setReviewRating(i)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        size={24}
                        className={
                          i <= reviewRating
                            ? "fill-amber-500 text-amber-500"
                            : "text-ink-300"
                        }
                      />
                    </button>
                  ))}
                </div>
                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your experience (optional)"
                  maxLength={500}
                  className="mt-3 w-full resize-none rounded-lg border border-ink-200 bg-white px-3 py-2 text-[12.5px] outline-none focus:border-brand-600 dark:border-ink-700 dark:bg-ink-900"
                />
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={submitReview}
                    disabled={submitting}
                    className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full bg-brand-600 text-[12.5px] font-extrabold text-white hover:bg-brand-700 disabled:opacity-70"
                  >
                    {submitting ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : myReview ? (
                      "Update"
                    ) : (
                      "Submit"
                    )}
                  </button>
                  {myReview && (
                    <button
                      onClick={deleteReview}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-danger-500 text-danger-500 hover:bg-danger-500/10"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Review list */}
            <div className="mt-4 space-y-3">
              {reviews.length === 0 ? (
                <p className="py-4 text-center text-[12.5px] text-ink-400">
                  No reviews yet — be the first.
                </p>
              ) : (
                reviews.slice(0, 5).map((r) => (
                  <div
                    key={r.id}
                    className={
                      "rounded-xl border p-3 " +
                      (String(r.customer_id) === String(user?.id)
                        ? "border-brand-600/40 bg-brand-50 dark:bg-brand-600/10"
                        : "border-ink-200/70 dark:border-ink-800")
                    }
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-[12.5px] font-extrabold">
                        {r.customer?.full_name || "Anonymous"}
                      </p>
                      <div className="flex shrink-0">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            size={10}
                            className={
                              i <= r.rating
                                ? "fill-amber-500 text-amber-500"
                                : "text-ink-300"
                            }
                          />
                        ))}
                      </div>
                    </div>
                    {r.comment && (
                      <p className="mt-1.5 text-[11.5px] text-ink-500">
                        {r.comment}
                      </p>
                    )}
                    <p className="mt-1 text-[10px] text-ink-400">
                      {timeAgo(r.created_at)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function StatBox({ label, value }) {
  return (
    <div className="text-center">
      <p className="text-[19px] font-black text-ink-900 dark:text-ink-100">
        {value}
      </p>
      <p className="mt-0.5 text-[10.5px] font-extrabold uppercase tracking-widest text-ink-400">
        {label}
      </p>
    </div>
  );
}

function ProductMini({ product }) {
  const img = getFullImageUrl(extractFirstImage(product.images));
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