import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ChevronRight, ShoppingCart, ChevronLeft, MapPin, Star, Store,
  Image as ImageIcon, ZoomIn, X, CheckCircle2, MessageCircle, Info,
  Loader2, Heart, Share2, Truck, ShieldCheck, Award, ChevronLeft as ChevLeft,
  ChevronRight as ChevRight,
} from "lucide-react";
import { toast } from "sonner";
import { productService } from "../services/product";
import { reviewService } from "../services/review";
import { advertisementService } from "../services/advertisement";
import { getFullImageUrl } from "../lib/image";
import { useAuthStore } from "../store/auth";
import { useCartStore } from "../store/cart.store";

/* ═══════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════ */
const extractImages = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(String).filter(Boolean);
  if (typeof raw === "string") {
    try {
      let parsed = JSON.parse(raw);
      if (typeof parsed === "string") parsed = JSON.parse(parsed);
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
      if (typeof parsed === "string") return [parsed];
    } catch {
      return [raw];
    }
  }
  return [];
};

const formatPhoneNumber = (phone) => {
  if (!phone) return null;
  let cleaned = phone.replace(/[^\d+]/g, "");
  if (cleaned.startsWith("00")) cleaned = "+" + cleaned.slice(2);
  if (!cleaned.startsWith("+")) cleaned = "+250" + cleaned;
  return cleaned.replace("+", "");
};

const fmtPrice = (n) => Number(n || 0).toLocaleString("en-US");

const timeAgo = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "";
  const s = (Date.now() - dt.getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return Math.floor(s / 60) + "m ago";
  if (s < 86400) return Math.floor(s / 3600) + "h ago";
  if (s < 604800) return Math.floor(s / 86400) + "d ago";
  return dt.toLocaleDateString();
};

/* ═══════════════════════════════════════════════════════
   Page
   ═══════════════════════════════════════════════════════ */
export default function ProductDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuthStore();
  const { addToCart } = useCartStore();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [adding, setAdding] = useState(false);
  const [showAddedModal, setShowAddedModal] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [showRoleGuard, setShowRoleGuard] = useState(false);

  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [activeTab, setActiveTab] = useState("description");

  const isCustomer = user?.role === "customer";
  const isTrader = user?.role === "trader";
  const isAgent = user?.role === "agent";

  /* ═══ Fetch ═══ */
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [p, r, a] = await Promise.all([
          productService.getProductById(id),
          productService.getProducts({ limit: 8 }).catch(() => ({ products: [] })),
          advertisementService.getActiveAds().catch(() => []),
        ]);
        setProduct(p);
        setRelated((r.products || []).filter((x) => x.id !== p.id).slice(0, 8));
        setAds(a || []);
      } catch {
        toast.error("Could not load product");
        nav("/");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, nav]);

  /* ═══ Derived ═══ */
  const images = useMemo(
    () => extractImages(product?.images).map(getFullImageUrl).filter(Boolean),
    [product?.images]
  );

  const reviews = product?.Reviews || [];
  const totalReviews = reviews.length;
  const avgRating = Number(product?.avgRating) || 0;

  const trader = product?.trader;
  const profile = trader?.TraderProfile;
  const shopName = profile?.shop_name || trader?.full_name || "Shop";

  const ratingCounts = useMemo(() => {
    const c = [0, 0, 0, 0, 0];
    reviews.forEach((r) => {
      if (r.rating >= 1 && r.rating <= 5) c[r.rating - 1]++;
    });
    return c;
  }, [reviews]);

  const inStock = Number(product?.stock_quantity ?? 1) > 0;

  /* ═══ Actions ═══ */
  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Please sign in to add to cart");
      nav("/auth/login");
      return;
    }
    if (!isCustomer) {
      setShowRoleGuard(true);
      return;
    }
    setAdding(true);
    try {
      await addToCart(product.id, quantity);
      setShowAddedModal(true);
    } catch (e) {
      toast.error(e?.response?.data?.error || "Could not add to cart");
    } finally {
      setAdding(false);
    }
  };

  const handleWhatsApp = () => {
    const phone = trader?.phone;
    if (!phone) return toast.error("This trader has no phone number on file");
    const cleaned = formatPhoneNumber(phone);
    const msg = `Hello, I'm interested in ${product.name} (${fmtPrice(
      product.price
    )} RWF). Can we discuss the price?`;
    window.open(`https://wa.me/${cleaned}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handleSubmitReview = async () => {
    if (!user) return toast.error("Please log in to review");
    if (reviewRating === 0) return toast.error("Please choose a rating");
    setSubmittingReview(true);
    try {
      await reviewService.createReview({
        target_type: "product",
        target_id: id,
        rating: reviewRating,
        comment: reviewComment.trim() || "No comment",
      });
      toast.success("Thanks for your review!");
      setReviewRating(0);
      setReviewComment("");
      setShowReviewForm(false);
      const updated = await productService.getProductById(id);
      setProduct(updated);
    } catch (e) {
      toast.error(e?.response?.data?.error || "Could not submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="container-app flex justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-ink-200 border-t-brand-600" />
      </div>
    );
  }
  if (!product) return null;

  return (
    <div className="bg-surface dark:bg-ink-950">
      {/* Breadcrumb */}
      <div className="border-b border-ink-200/70 bg-white dark:border-ink-800 dark:bg-ink-900">
        <div className="container-app flex items-center gap-1.5 py-3 text-[12px] text-ink-500">
          <Link to="/" className="hover:text-brand-600">Home</Link>
          <ChevronRight size={12} />
          <Link to="/search" className="hover:text-brand-600">All products</Link>
          {product.Category?.name && (
            <>
              <ChevronRight size={12} />
              <Link
                to={`/search?q=${encodeURIComponent(product.Category.name)}`}
                className="hover:text-brand-600"
              >
                {product.Category.name}
              </Link>
            </>
          )}
          <ChevronRight size={12} />
          <span className="line-clamp-1 font-bold text-ink-700 dark:text-ink-200">
            {product.name}
          </span>
        </div>
      </div>

      <div className="container-app py-6">
        <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
          {/* ═══════════════ LEFT ═══════════════ */}
          <div className="min-w-0">
            <div className="grid gap-6 md:grid-cols-[420px_1fr] lg:grid-cols-1 xl:grid-cols-[420px_1fr]">
              {/* Gallery */}
              <div className="flex gap-3 md:flex-col md:order-2 lg:flex-row lg:order-none xl:flex-row">
                {images.length > 1 && (
                  <div className="order-2 flex shrink-0 gap-2 overflow-x-auto md:order-1 md:max-h-[420px] md:flex-col md:overflow-y-auto md:overflow-x-hidden lg:order-2 lg:max-h-none lg:flex-row lg:overflow-x-auto xl:order-1 xl:max-h-[420px] xl:flex-col">
                    {images.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImage(i)}
                        onMouseEnter={() => setActiveImage(i)}
                        className={
                          "h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition-all " +
                          (i === activeImage
                            ? "border-brand-600"
                            : "border-transparent hover:border-ink-300")
                        }
                      >
                        <img src={img} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                <div className="relative order-1 aspect-square w-full flex-1 overflow-hidden rounded-2xl border border-ink-200/70 bg-white md:order-2 lg:order-1 lg:max-h-[420px] lg:max-w-[420px] xl:order-2">
                  {images.length > 0 ? (
                    <>
                      <img
                        src={images[activeImage]}
                        alt={product.name}
                        onClick={() => setShowLightbox(true)}
                        className="h-full w-full cursor-zoom-in object-cover transition-transform duration-300 hover:scale-105"
                      />
                      <button
                        onClick={() => setShowLightbox(true)}
                        className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-[11px] font-bold text-white backdrop-blur hover:bg-black/80"
                      >
                        <ZoomIn size={12} />
                        Zoom
                      </button>
                    </>
                  ) : (
                    <div className="flex h-full items-center justify-center text-ink-300">
                      <ImageIcon size={56} />
                    </div>
                  )}

                  <div className="absolute left-3 top-3 flex flex-col gap-1.5">
                    {inStock ? (
                      <span className="flex items-center gap-1 rounded-md bg-emerald-500 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white shadow">
                        <CheckCircle2 size={10} />
                        In stock
                      </span>
                    ) : (
                      <span className="rounded-md bg-danger-500 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white shadow">
                        Out of stock
                      </span>
                    )}
                    {avgRating >= 4.5 && (
                      <span className="rounded-md bg-amber-500 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white shadow">
                        Top rated
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="min-w-0 md:order-1 lg:order-2 xl:order-1">
                <h1 className="text-2xl font-black tracking-tight text-ink-900 dark:text-ink-100 lg:text-3xl">
                  {product.name}
                </h1>

                <div className="mt-3 flex items-baseline gap-2 border-y border-ink-200/70 py-4 dark:border-ink-800">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-ink-400">
                    Price
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black tracking-tight text-brand-600 tabular-nums lg:text-4xl">
                      {fmtPrice(product.price)}
                    </span>
                    <span className="text-sm font-extrabold text-brand-600/80">
                      RWF
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px]">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={14}
                          className={
                            s <= Math.round(avgRating)
                              ? "fill-amber-500 text-amber-500"
                              : "text-ink-300"
                          }
                        />
                      ))}
                    </div>
                    <span className="font-bold text-ink-700 dark:text-ink-200">
                      {avgRating.toFixed(1)}
                    </span>
                    <span className="text-ink-500 dark:text-ink-400">
                      ({totalReviews} reviews)
                    </span>
                  </div>

                  {product.Category?.name && (
                    <span className="text-ink-500 dark:text-ink-400">
                      Category:{" "}
                      <span className="font-bold text-ink-700 dark:text-ink-200">
                        {product.Category.name}
                      </span>
                    </span>
                  )}
                </div>

                {trader && (
                  <Link
                    to={`/traders/${trader.id}`}
                    className="mt-5 flex items-center gap-3 rounded-2xl border border-ink-200/70 bg-ink-50 p-3 transition-all hover:border-brand-600 hover:bg-white dark:border-ink-800 dark:bg-ink-800/50 dark:hover:bg-ink-800"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-600 text-lg font-black text-white">
                      {trader.profile_image ? (
                        <img
                          src={getFullImageUrl(trader.profile_image)}
                          alt={shopName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        shopName.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1 text-[10.5px] font-extrabold uppercase tracking-wider text-ink-400">
                        <Store size={10} />
                        Supplied by
                      </p>
                      <p className="truncate text-[14px] font-black text-ink-900 dark:text-ink-100">
                        {shopName}
                      </p>
                      {profile?.district && (
                        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-ink-500">
                          <MapPin size={9} />
                          {profile.district}
                          {profile.sector ? `, ${profile.sector}` : ""}
                        </p>
                      )}
                    </div>
                    <ChevronRight size={16} className="text-ink-400" />
                  </Link>
                )}

                <div className="mt-5 grid grid-cols-3 gap-2 text-[11px]">
                  <TrustChip icon={ShieldCheck} label="Verified" sub="trader" />
                  <TrustChip icon={Truck} label="Fast" sub="delivery" />
                  <TrustChip icon={Award} label="Top" sub="quality" />
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="mt-10 overflow-hidden rounded-2xl border border-ink-200/70 bg-white dark:border-ink-800 dark:bg-ink-900">
              <div className="flex border-b border-ink-200 dark:border-ink-800">
                <TabBtn
                  active={activeTab === "description"}
                  onClick={() => setActiveTab("description")}
                >
                  Product details
                </TabBtn>
                <TabBtn
                  active={activeTab === "reviews"}
                  onClick={() => setActiveTab("reviews")}
                >
                  Reviews ({totalReviews})
                </TabBtn>
              </div>

              <div className="p-5 lg:p-7">
                {activeTab === "description" ? (
                  <>
                    {product.description ? (
                      <p className="whitespace-pre-wrap text-[14.5px] leading-relaxed text-ink-700 dark:text-ink-300">
                        {product.description}
                      </p>
                    ) : (
                      <p className="text-[14px] italic text-ink-400">
                        No description provided.
                      </p>
                    )}

                    <div className="mt-6 grid gap-2 sm:grid-cols-2">
                      <SpecRow label="Category" value={product.Category?.name || "—"} />
                      <SpecRow
                        label="Stock"
                        value={
                          product.stock_quantity != null
                            ? `${product.stock_quantity} units`
                            : "—"
                        }
                      />
                      <SpecRow label="Unit" value={product.unit || "piece"} />
                      <SpecRow
                        label="Min order"
                        value={`${product.min_order || 1} ${product.unit || "piece"}`}
                      />
                      {profile?.district && (
                        <SpecRow
                          label="Location"
                          value={`${profile.district}${
                            profile.sector ? `, ${profile.sector}` : ""
                          }`}
                        />
                      )}
                      <SpecRow label="Trader" value={shopName} />
                    </div>
                  </>
                ) : (
                  <>
                    {totalReviews > 0 && (
                      <div className="mb-6 grid gap-5 sm:grid-cols-[200px_1fr]">
                        <div className="flex flex-col items-center justify-center rounded-xl bg-ink-50 p-4 dark:bg-ink-800">
                          <p className="text-4xl font-black text-ink-900 dark:text-ink-100">
                            {avgRating.toFixed(1)}
                          </p>
                          <div className="mt-1.5 flex">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                size={13}
                                className={
                                  s <= Math.round(avgRating)
                                    ? "fill-amber-500 text-amber-500"
                                    : "text-ink-300"
                                }
                              />
                            ))}
                          </div>
                          <p className="mt-1 text-[11.5px] font-semibold text-ink-500">
                            {totalReviews} reviews
                          </p>
                        </div>

                        <div className="space-y-1.5">
                          {[5, 4, 3, 2, 1].map((star) => {
                            const count = ratingCounts[star - 1];
                            const pct = totalReviews
                              ? (count / totalReviews) * 100
                              : 0;
                            return (
                              <div
                                key={star}
                                className="flex items-center gap-2"
                              >
                                <span className="flex w-8 items-center gap-1 text-[11.5px] font-bold text-ink-500">
                                  {star}
                                  <Star
                                    size={9}
                                    className="fill-amber-500 text-amber-500"
                                  />
                                </span>
                                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
                                  <div
                                    className="h-full rounded-full bg-brand-600"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                                <span className="w-9 text-right text-[11px] text-ink-400">
                                  {count}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {user && isCustomer && (
                      <div className="mb-6">
                        {!showReviewForm ? (
                          <button
                            onClick={() => setShowReviewForm(true)}
                            className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-[13px] font-extrabold text-white shadow-brand hover:bg-brand-700"
                          >
                            <Star size={14} />
                            Write a review
                          </button>
                        ) : (
                          <div className="rounded-xl border border-ink-200 bg-ink-50 p-4 dark:border-ink-800 dark:bg-ink-800/50">
                            <div className="mb-3 flex items-center justify-between">
                              <p className="text-[13px] font-extrabold">
                                Your review
                              </p>
                              <button
                                onClick={() => setShowReviewForm(false)}
                                className="text-ink-400 hover:text-ink-600"
                              >
                                <X size={15} />
                              </button>
                            </div>
                            <div className="mb-3 flex gap-1.5">
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
                              className="w-full resize-none rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-[13.5px] outline-none focus:border-brand-600 dark:border-ink-700 dark:bg-ink-900"
                            />
                            <button
                              onClick={handleSubmitReview}
                              disabled={submittingReview}
                              className="mt-3 flex h-11 items-center justify-center gap-2 rounded-full bg-brand-600 px-6 text-[13.5px] font-extrabold text-white shadow-brand hover:bg-brand-700 disabled:opacity-70"
                            >
                              {submittingReview ? (
                                <Loader2 size={15} className="animate-spin" />
                              ) : (
                                "Submit review"
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {reviews.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-ink-200 py-14 text-center dark:border-ink-800">
                        <Star size={36} className="mx-auto text-ink-300" />
                        <p className="mt-3 text-[14px] font-black">
                          No reviews yet
                        </p>
                        <p className="mt-1 text-[12.5px] text-ink-500">
                          Be the first to share your experience.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {reviews.map((r) => (
                          <ReviewCard
                            key={r.id}
                            review={r}
                            currentUserId={user?.id}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {related.length > 0 && (
              <div className="mt-10">
                <div className="mb-4 flex items-end justify-between">
                  <h2 className="text-[17px] font-black tracking-tight">
                    You may also like
                  </h2>
                  <Link
                    to="/search"
                    className="text-[12.5px] font-bold text-brand-600 hover:text-brand-700"
                  >
                    See all →
                  </Link>
                </div>
                <div className="scrollbar-none -mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
                  {related.map((p) => (
                    <RelatedCard key={p.id} product={p} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ═══════════════ RIGHT — sticky buy panel ═══════════════ */}
          <aside className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-6rem)] lg:self-start lg:overflow-y-auto">
            <div className="space-y-4">
              <div className="rounded-2xl border border-ink-200/70 bg-white p-5 dark:border-ink-800 dark:bg-ink-900">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black tracking-tight text-brand-600 tabular-nums">
                    {fmtPrice(product.price)}
                  </span>
                  <span className="text-sm font-extrabold text-brand-600/80">
                    RWF
                  </span>
                </div>

                {product.stock_quantity != null && (
                  <p className="mt-1.5 text-[12px] font-semibold">
                    {inStock ? (
                      <span className="text-emerald-600">
                        ✓ {product.stock_quantity} available
                      </span>
                    ) : (
                      <span className="text-danger-500">✕ Out of stock</span>
                    )}
                  </p>
                )}

                <div className="my-4 h-px bg-ink-100 dark:bg-ink-800" />

                {isCustomer ? (
                  <>
                    <div className="mb-4">
                      <label className="text-[11px] font-extrabold uppercase tracking-wider text-ink-500">
                        Quantity
                      </label>
                      <div className="mt-2 flex items-center gap-3">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="flex h-10 w-10 items-center justify-center rounded-xl border border-ink-200 bg-ink-50 text-[18px] font-black hover:border-brand-600 dark:border-ink-700 dark:bg-ink-800"
                        >
                          −
                        </button>
                        <input
                          value={quantity}
                          onChange={(e) =>
                            setQuantity(
                              Math.max(1, parseInt(e.target.value) || 1)
                            )
                          }
                          inputMode="numeric"
                          className="h-10 w-16 rounded-xl border border-ink-200 bg-white text-center text-[15px] font-black outline-none focus:border-brand-600 dark:border-ink-700 dark:bg-ink-900"
                        />
                        <button
                          onClick={() => setQuantity(quantity + 1)}
                          className="flex h-10 w-10 items-center justify-center rounded-xl border border-ink-200 bg-ink-50 text-[18px] font-black hover:border-brand-600 dark:border-ink-700 dark:bg-ink-800"
                        >
                          +
                        </button>
                        <p className="ml-auto text-[12.5px] font-semibold text-ink-500">
                          Total:{" "}
                          <span className="font-black tabular-nums text-ink-900 dark:text-ink-100">
                            {fmtPrice(quantity * Number(product.price || 0))} RWF
                          </span>
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleAddToCart}
                      disabled={adding || !inStock}
                      className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-brand-600 text-[15px] font-extrabold text-white shadow-brand transition-all hover:bg-brand-700 disabled:opacity-60"
                    >
                      {adding ? (
                        <Loader2 size={17} className="animate-spin" />
                      ) : (
                        <>
                          <ShoppingCart size={17} />
                          Add to cart
                        </>
                      )}
                    </button>

                    {trader?.phone && (
                      <button
                        onClick={handleWhatsApp}
                        className="mt-3 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#25D366] text-[15px] font-extrabold text-white transition-all hover:bg-[#1fb355]"
                      >
                        <MessageCircle size={17} />
                        Negotiate on WhatsApp
                      </button>
                    )}

                    <div className="mt-3 flex gap-2">
                      <button className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border border-ink-200 text-[12.5px] font-bold text-ink-600 hover:border-brand-600 hover:text-brand-600 dark:border-ink-700 dark:text-ink-300">
                        <Heart size={14} />
                        Wishlist
                      </button>
                      <button
                        onClick={() =>
                          navigator.share?.({ title: product.name, url: window.location.href }) ||
                          navigator.clipboard.writeText(window.location.href) &&
                          toast.success("Link copied")
                        }
                        className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border border-ink-200 text-[12.5px] font-bold text-ink-600 hover:border-brand-600 hover:text-brand-600 dark:border-ink-700 dark:text-ink-300"
                      >
                        <Share2 size={14} />
                        Share
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="rounded-xl border border-brand-600/30 bg-brand-50 p-4 dark:bg-brand-600/10">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600/15 text-brand-600">
                        <Info size={18} />
                      </div>
                      <div>
                        <p className="text-[13.5px] font-extrabold text-ink-900 dark:text-ink-100">
                          {isTrader
                            ? "You're on a trader account"
                            : "Agent account"}
                        </p>
                        <p className="mt-1 text-[12.5px] text-ink-500">
                          Only customer accounts can place orders.
                        </p>
                        <button
                          onClick={() => setShowRoleGuard(true)}
                          className="mt-3 rounded-full bg-brand-600 px-4 py-1.5 text-[11.5px] font-extrabold text-white"
                        >
                          Learn why
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-5 space-y-2.5 border-t border-ink-100 pt-4 dark:border-ink-800">
                  <TrustRow icon={ShieldCheck} text="Verified trader" />
                  <TrustRow icon={Truck} text="Local pickup available" />
                  <TrustRow icon={MessageCircle} text="Direct WhatsApp chat" />
                </div>
              </div>

              {trader && (
                <div className="rounded-2xl border border-ink-200/70 bg-white p-5 dark:border-ink-800 dark:bg-ink-900">
                  <p className="text-[10.5px] font-extrabold uppercase tracking-wider text-ink-400">
                    Supplier
                  </p>
                  <Link
                    to={`/traders/${trader.id}`}
                    className="mt-3 flex items-center gap-3"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-600 text-base font-black text-white">
                      {trader.profile_image ? (
                        <img
                          src={getFullImageUrl(trader.profile_image)}
                          alt={shopName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        shopName.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-black text-ink-900 dark:text-ink-100">
                        {shopName}
                      </p>
                      {profile?.business_category && (
                        <p className="truncate text-[11.5px] text-ink-500 dark:text-ink-400">
                          {profile.business_category}
                        </p>
                      )}
                    </div>
                    <ChevronRight size={15} className="text-ink-400" />
                  </Link>

                  {profile?.district && (
                    <p className="mt-3 flex items-center gap-1.5 text-[11.5px] text-ink-500 dark:text-ink-400">
                      <MapPin size={10} />
                      {profile.district}
                      {profile.sector ? `, ${profile.sector}` : ""}
                    </p>
                  )}

                  <Link
                    to={`/traders/${trader.id}`}
                    className="mt-4 flex h-11 w-full items-center justify-center gap-1.5 rounded-full border-2 border-brand-600 text-[13px] font-extrabold text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-600/10"
                  >
                    View shop
                    <ChevronRight size={14} />
                  </Link>
                </div>
              )}

              {ads[0] && (
                <a
                  href={ads[0].link_url || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="group relative block h-32 overflow-hidden rounded-2xl bg-ink-900 text-white shadow-lg"
                >
                  {ads[0].image_url ? (
                    <img
                      src={getFullImageUrl(ads[0].image_url)}
                      alt={ads[0].title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-brand-600 to-navy-600" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 to-transparent" />
                  <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white backdrop-blur">
                    Sponsored
                  </span>
                  <div className="absolute inset-x-0 bottom-0 p-3">
                    <p className="line-clamp-2 text-[13px] font-black">
                      {ads[0].title}
                    </p>
                  </div>
                </a>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* ═══════════════ Lightbox (image viewer) ═══════════════ */}
      {showLightbox && (
        <Lightbox
          images={images}
          index={activeImage}
          onIndexChange={setActiveImage}
          onClose={() => setShowLightbox(false)}
        />
      )}

      {/* ═══════════════ Added-to-cart modal ═══════════════ */}
      {showAddedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-2xl dark:bg-ink-900">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg">
              <CheckCircle2 size={44} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-black">Added to cart</h3>
            <p className="mt-1.5 text-[13.5px] text-ink-500">
              {product.name} · Qty {quantity}
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowAddedModal(false)}
                className="h-12 flex-1 rounded-full border-2 border-brand-600 text-[14px] font-extrabold text-brand-600 hover:bg-brand-50"
              >
                Continue
              </button>
              <button
                onClick={() => {
                  setShowAddedModal(false);
                  nav("/cart");
                }}
                className="h-12 flex-1 rounded-full bg-brand-600 text-[14px] font-extrabold text-white shadow-brand hover:bg-brand-700"
              >
                View cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ Role guard modal ═══════════════ */}
      {showRoleGuard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl dark:bg-ink-900">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-brand-600/15 text-brand-600">
              <Store size={30} />
            </div>
            <h3 className="text-xl font-black">
              {isTrader
                ? "Traders can't place orders"
                : "Agents can't place orders"}
            </h3>
            <p className="mt-3 text-[13.5px] leading-relaxed text-ink-500">
              {isTrader
                ? "Your account is set up as a trader, which means you sell products rather than buy them. To place an order, please log in with a customer account."
                : "Your account is set up as a delivery agent, which means you deliver orders rather than buy them. To place an order, please log in with a customer account."}
            </p>
            <button
              onClick={() => setShowRoleGuard(false)}
              className="mt-6 h-12 w-full rounded-full bg-brand-600 text-[14px] font-extrabold text-white shadow-brand hover:bg-brand-700"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Lightbox — overlay viewer
   ═══════════════════════════════════════════════════════ */
function Lightbox({ images, index, onIndexChange, onClose }) {
  /* Lock body scroll while open */
  useEffect(() => {
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = orig;
    };
  }, []);

  /* Keyboard: Esc closes, arrows navigate */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") {
        onIndexChange((index + 1) % images.length);
      }
      if (e.key === "ArrowLeft") {
        onIndexChange((index - 1 + images.length) % images.length);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, images.length, onIndexChange, onClose]);

  if (images.length === 0) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
    >
      {/* Top bar */}
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between p-4">
        <span className="rounded-full bg-white/15 px-3 py-1.5 text-[12.5px] font-extrabold text-white backdrop-blur">
          {index + 1} / {images.length}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          aria-label="Close"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/25"
        >
          <X size={22} />
        </button>
      </div>

      {/* Prev / Next — only if multiple images */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onIndexChange((index - 1 + images.length) % images.length);
            }}
            aria-label="Previous image"
            className="absolute left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/25"
          >
            <ChevLeft size={22} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onIndexChange((index + 1) % images.length);
            }}
            aria-label="Next image"
            className="absolute right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/25"
          >
            <ChevRight size={22} />
          </button>
        </>
      )}

      {/* Image — stopPropagation so clicking the image doesn't close */}
      <img
        src={images[index]}
        alt=""
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
      />

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute inset-x-0 bottom-4 z-10 flex justify-center"
        >
          <div className="scrollbar-none flex max-w-[90vw] gap-2 overflow-x-auto rounded-2xl bg-black/40 p-2 backdrop-blur">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => onIndexChange(i)}
                className={
                  "h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition-all " +
                  (i === index
                    ? "border-white opacity-100"
                    : "border-transparent opacity-60 hover:opacity-100")
                }
              >
                <img src={img} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════════════════ */

function TabBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={
        "relative px-5 py-4 text-[13.5px] font-extrabold transition-colors lg:px-7 " +
        (active
          ? "text-brand-600"
          : "text-ink-500 hover:text-ink-800 dark:text-ink-400 dark:hover:text-ink-100")
      }
    >
      {children}
      {active && (
        <span className="absolute inset-x-4 -bottom-px h-0.5 bg-brand-600" />
      )}
    </button>
  );
}

function SpecRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-ink-50 px-3.5 py-2.5 dark:bg-ink-800/50">
      <span className="text-[12px] font-bold text-ink-500 dark:text-ink-400">
        {label}
      </span>
      <span className="truncate text-[12.5px] font-extrabold text-ink-900 dark:text-ink-100">
        {value}
      </span>
    </div>
  );
}

function TrustChip({ icon: Icon, label, sub }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-ink-200/70 bg-ink-50 px-3 py-2 dark:border-ink-800 dark:bg-ink-800/50">
      <Icon size={14} className="shrink-0 text-brand-600" />
      <div className="min-w-0">
        <p className="truncate text-[11px] font-extrabold text-ink-900 dark:text-ink-100">
          {label}
        </p>
        <p className="truncate text-[10px] text-ink-500 dark:text-ink-400">
          {sub}
        </p>
      </div>
    </div>
  );
}

function TrustRow({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-2.5 text-[12.5px] text-ink-600 dark:text-ink-400">
      <Icon size={14} className="text-brand-600" />
      {text}
    </div>
  );
}

function RelatedCard({ product }) {
  const img = getFullImageUrl(extractImages(product.images)[0]);
  return (
    <Link
      to={`/products/${product.id}`}
      className="group flex w-[180px] shrink-0 flex-col overflow-hidden rounded-2xl border border-ink-200/70 bg-white transition-all hover:-translate-y-0.5 hover:border-brand-600 hover:shadow-md dark:border-ink-800 dark:bg-ink-900"
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
            <Store size={28} />
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="line-clamp-2 min-h-[32px] text-[12.5px] font-bold leading-tight">
          {product.name}
        </p>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-[14px] font-black text-brand-600 tabular-nums">
            {fmtPrice(product.price)}
          </span>
          <span className="text-[9.5px] font-bold text-brand-600/80">RWF</span>
        </div>
      </div>
    </Link>
  );
}

function ReviewCard({ review, currentUserId }) {
  const isMine =
    currentUserId && String(review.customer_id) === String(currentUserId);
  const name = review.customer?.full_name || "Anonymous";
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={
        "rounded-xl border p-4 " +
        (isMine
          ? "border-brand-600/40 bg-brand-50 dark:bg-brand-600/10"
          : "border-ink-200/70 bg-white dark:border-ink-800 dark:bg-ink-900")
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={
              "flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-black text-white " +
              (isMine ? "bg-brand-600" : "bg-ink-400")
            }
          >
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[13.5px] font-extrabold">{name}</p>
              {isMine && (
                <span className="rounded-md bg-brand-600/15 px-1.5 py-0.5 text-[9.5px] font-black uppercase tracking-wider text-brand-600">
                  You
                </span>
              )}
            </div>
            <p className="mt-0.5 text-[10.5px] text-ink-400">
              {timeAgo(review.created_at)}
            </p>
          </div>
        </div>

        <div className="flex shrink-0">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              size={12}
              className={
                i <= review.rating
                  ? "fill-amber-500 text-amber-500"
                  : "text-ink-300"
              }
            />
          ))}
        </div>
      </div>

      {review.comment && (
        <p className="mt-3 text-[13px] leading-relaxed text-ink-600 dark:text-ink-300">
          {review.comment}
        </p>
      )}
    </div>
  );
}