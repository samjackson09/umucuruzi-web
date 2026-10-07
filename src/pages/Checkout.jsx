import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronLeft, Receipt, MapPin, CreditCard, Tag, CheckCircle2, X,
  Loader2, ShoppingBag, Wallet, Store, Bike, Home as HomeIcon,
  Sparkles, ShieldCheck, AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "../store/cart.store";
import { useAuthStore } from "../store/auth";
import { orderService } from "../services/order";

const fmtMoney = (n) => Number(n || 0).toLocaleString("en-US");

const DELIVERY = [
  { key: "direct",   label: "Direct",   sub: "Pick up at shop",      icon: HomeIcon },
  { key: "pickup",   label: "Pickup",   sub: "Reserve for pickup",   icon: ShoppingBag },
  { key: "delivery", label: "Delivery", sub: "To your location",     icon: Bike },
];

const PAYMENT = [
  { key: "pay_on_delivery", label: "Pay on delivery",  sub: "Pay when order arrives",    icon: Wallet },
  { key: "pay_on_store",    label: "Pay on store",     sub: "Pay at the shop",           icon: Store },
  { key: "online",          label: "Pay online (MoMo)", sub: "Mobile Money",             icon: CreditCard },
];

export default function Checkout() {
  const nav = useNavigate();
  const { user } = useAuthStore();
  const { cart, fetchCart, clearCart } = useCartStore();

  const [deliveryType, setDeliveryType] = useState("direct");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("pay_on_delivery");
  const [promoCode, setPromoCode] = useState("");
  const [applied, setApplied] = useState(null);
  const [promoError, setPromoError] = useState(null);
  const [applying, setApplying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState({ show: false, count: 1 });

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  /* ── Totals ── */
  const totals = useMemo(() => {
    return (cart || []).map((g) => {
      let subtotal = 0;
      (g.items || []).forEach((it) => {
        subtotal += (Number(it.quantity) || 0) * (Number(it.Product?.price) || 0);
      });
      return { trader: g.trader, items: g.items, subtotal };
    });
  }, [cart]);

  const grandTotal = totals.reduce((s, t) => s + t.subtotal, 0);
  const discount = applied?.total_discount || 0;
  const finalTotal = Math.max(grandTotal - discount, 0);
  const itemCount = (cart || []).reduce((a, g) => a + (g.items?.length || 0), 0);

  /* Reset promo when cart total changes */
  useEffect(() => {
    setApplied(null);
    setPromoError(null);
  }, [grandTotal]);

  /* ── Actions ── */
  const applyPromo = async () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) return;
    if (grandTotal <= 0) return setPromoError("Add items before applying a code");
    setApplying(true);
    setPromoError(null);
    try {
      const data = await orderService.validatePromoCode(code);
      if (data.valid) {
        setApplied({
          code: data.code,
          total_discount: data.total_discount,
          per_trader: data.per_trader,
        });
        toast.success(`Promo applied — saving ${fmtMoney(data.total_discount)} RWF`);
      } else {
        const reason = data.per_trader.find((t) => !t.valid)?.reason || "Promo code is not valid";
        setApplied(null);
        setPromoError(reason);
      }
    } catch (e) {
      setApplied(null);
      setPromoError(e?.response?.data?.error || "Could not validate promo code");
    } finally {
      setApplying(false);
    }
  };

  const clearPromo = () => {
    setPromoCode("");
    setApplied(null);
    setPromoError(null);
  };

  const submit = async () => {
    if (!cart.length) return toast.error("Cart is empty");
    if (deliveryType === "delivery" && !deliveryAddress.trim())
      return toast.error("Please enter a delivery address");
    if (promoCode.trim() && !applied) {
      return toast.error("Apply the promo code or clear it before ordering");
    }

    setSubmitting(true);
    try {
      const res = await orderService.createOrder({
        delivery_type: deliveryType,
        delivery_address: deliveryType === "delivery" ? deliveryAddress : "",
        payment_method: paymentMethod,
        promo_code: applied?.code,
      });
      const count = Array.isArray(res) ? res.length : res?.orders?.length || 1;
      await clearCart();
      setSuccess({ show: true, count });
    } catch (e) {
      toast.error(e?.response?.data?.error || e?.message || "Could not place order");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Empty cart guard ── */
  if (!cart.length && !success.show) {
    return (
      <div className="container-app flex flex-col items-center py-24 text-center">
        <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-ink-100 dark:bg-ink-800">
          <ShoppingBag size={40} className="text-ink-300" />
        </div>
        <h1 className="text-xl font-black">Your cart is empty</h1>
        <p className="mt-2 max-w-sm text-[13px] text-ink-500">
          Add products from any shop to start checkout.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-[13.5px] font-extrabold text-white shadow-brand hover:bg-brand-700"
        >
          <Store size={15} />
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container-app py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => nav(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-ink-200 bg-white text-ink-600 hover:border-brand-600 dark:border-ink-800 dark:bg-ink-900"
        >
          <ChevronLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-black tracking-tight">Checkout</h1>
          <p className="mt-0.5 text-[12.5px] text-ink-500">
            {itemCount} {itemCount === 1 ? "item" : "items"} · {totals.length}{" "}
            {totals.length === 1 ? "shop" : "shops"}
          </p>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* ─── LEFT: forms ─── */}
        <div className="space-y-4">
          {/* Delivery options */}
          <Card icon={MapPin} title="Delivery options" tint="sky">
            <div className="grid grid-cols-3 gap-3">
              {DELIVERY.map((d) => {
                const active = deliveryType === d.key;
                const Icon = d.icon;
                return (
                  <button
                    key={d.key}
                    onClick={() => setDeliveryType(d.key)}
                    className={
                      "relative flex flex-col items-start gap-2 rounded-xl border-2 p-3 text-left transition-all " +
                      (active
                        ? "border-brand-600 bg-brand-50 dark:bg-brand-600/10"
                        : "border-ink-200 bg-ink-50 hover:border-brand-600 dark:border-ink-700 dark:bg-ink-800/50")
                    }
                  >
                    {active && (
                      <CheckCircle2
                        size={14}
                        className="absolute right-2 top-2 text-brand-600"
                      />
                    )}
                    <span
                      className={
                        "flex h-8 w-8 items-center justify-center rounded-lg " +
                        (active
                          ? "bg-brand-600 text-white"
                          : "bg-ink-200 text-ink-500 dark:bg-ink-700")
                      }
                    >
                      <Icon size={15} />
                    </span>
                    <div>
                      <p
                        className={
                          "text-[12.5px] font-extrabold " +
                          (active ? "text-brand-600" : "text-ink-900 dark:text-ink-100")
                        }
                      >
                        {d.label}
                      </p>
                      <p className="mt-0.5 text-[10.5px] text-ink-400">{d.sub}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {deliveryType === "delivery" && (
              <div className="mt-4">
                <label className="mb-1.5 block text-[10.5px] font-extrabold uppercase tracking-wider text-ink-500">
                  Delivery address *
                </label>
                <textarea
                  rows={3}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="e.g. Kigali, Kimisagara, near Maison des Jeunes"
                  className="w-full resize-none rounded-xl border border-ink-200 bg-ink-50 px-4 py-3 text-[14px] font-medium outline-none focus:border-brand-600 focus:bg-white dark:border-ink-700 dark:bg-ink-900"
                />
              </div>
            )}
          </Card>

          {/* Payment */}
          <Card icon={CreditCard} title="Payment method" tint="emerald">
            <div className="space-y-2">
              {PAYMENT.map((p) => {
                const active = paymentMethod === p.key;
                const Icon = p.icon;
                return (
                  <button
                    key={p.key}
                    onClick={() => setPaymentMethod(p.key)}
                    className={
                      "flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left transition-all " +
                      (active
                        ? "border-brand-600 bg-brand-50 dark:bg-brand-600/10"
                        : "border-ink-200 bg-ink-50 hover:border-brand-600 dark:border-ink-700 dark:bg-ink-800/50")
                    }
                  >
                    <span
                      className={
                        "flex h-9 w-9 items-center justify-center rounded-lg " +
                        (active
                          ? "bg-brand-600 text-white"
                          : "bg-ink-200 text-ink-500 dark:bg-ink-700")
                      }
                    >
                      <Icon size={16} />
                    </span>
                    <div className="flex-1">
                      <p
                        className={
                          "text-[13.5px] font-extrabold " +
                          (active ? "text-brand-600" : "text-ink-900 dark:text-ink-100")
                        }
                      >
                        {p.label}
                      </p>
                      <p className="mt-0.5 text-[11px] text-ink-400">{p.sub}</p>
                    </div>
                    <span
                      className={
                        "flex h-5 w-5 items-center justify-center rounded-full border-2 " +
                        (active
                          ? "border-brand-600"
                          : "border-ink-300 dark:border-ink-600")
                      }
                    >
                      {active && (
                        <span className="h-2.5 w-2.5 rounded-full bg-brand-600" />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Promo */}
          <Card icon={Tag} title="Promo code" tint="amber">
            {!applied ? (
              <>
                <div className="flex gap-2">
                  <input
                    value={promoCode}
                    onChange={(e) => {
                      setPromoCode(e.target.value.toUpperCase());
                      if (promoError) setPromoError(null);
                    }}
                    onKeyDown={(e) => e.key === "Enter" && applyPromo()}
                    placeholder="Enter promo code"
                    className="h-12 flex-1 rounded-xl border border-ink-200 bg-ink-50 px-4 font-mono text-[14px] font-bold tracking-wider outline-none focus:border-brand-600 focus:bg-white dark:border-ink-700 dark:bg-ink-900"
                  />
                  <button
                    onClick={applyPromo}
                    disabled={!promoCode.trim() || applying}
                    className="flex h-12 min-w-[100px] items-center justify-center gap-1.5 rounded-xl bg-brand-600 px-5 text-[13.5px] font-extrabold text-white hover:bg-brand-700 disabled:opacity-50"
                  >
                    {applying ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 size={14} />
                        Apply
                      </>
                    )}
                  </button>
                </div>

                {promoError ? (
                  <div className="mt-3 flex items-center gap-2 rounded-xl bg-danger-500/10 px-3 py-2.5 text-danger-500">
                    <AlertCircle size={14} />
                    <span className="text-[12px] font-semibold">{promoError}</span>
                  </div>
                ) : (
                  <p className="mt-2.5 pl-1 text-[11.5px] text-ink-400">
                    Enter a code from your favourite shop to unlock a discount
                  </p>
                )}
              </>
            ) : (
              <div className="flex items-center gap-3 rounded-xl border-2 border-emerald-500/40 bg-emerald-500/10 p-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white">
                  <CheckCircle2 size={18} />
                </span>
                <div className="flex-1">
                  <p className="font-mono text-[15px] font-black tracking-wider text-emerald-600">
                    {applied.code}
                  </p>
                  <p className="mt-0.5 text-[12px] font-semibold text-emerald-600">
                    You save {fmtMoney(discount)} RWF
                  </p>
                </div>
                <button
                  onClick={clearPromo}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 hover:bg-emerald-500/30"
                >
                  <X size={15} />
                </button>
              </div>
            )}
          </Card>
        </div>

        {/* ─── RIGHT: summary ─── */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="space-y-4">
            {/* Order summary */}
            <Card icon={Receipt} title="Order summary" tint="brand">
              {totals.map((t, idx) => {
                const shop =
                  t.trader?.TraderProfile?.shop_name ||
                  t.trader?.full_name ||
                  "Shop";
                const td = applied?.per_trader?.find(
                  (p) => p.trader_id === t.trader?.id
                );
                const traderDiscount = td?.valid ? td.discount || 0 : 0;

                return (
                  <div
                    key={idx}
                    className={
                      idx > 0
                        ? "mt-4 border-t border-ink-100 pt-4 dark:border-ink-800"
                        : ""
                    }
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
                      <p className="truncate text-[13px] font-extrabold">
                        {shop}
                      </p>
                    </div>

                    {t.items.map((it) => (
                      <div
                        key={it.id}
                        className="flex items-center justify-between gap-2 py-1"
                      >
                        <p className="truncate text-[12.5px] text-ink-500">
                          {it.Product?.name} × {it.quantity}
                        </p>
                        <p className="shrink-0 text-[12.5px] font-bold">
                          {fmtMoney(
                            Number(it.quantity) * Number(it.Product?.price || 0)
                          )}{" "}
                          RWF
                        </p>
                      </div>
                    ))}

                    <div className="mt-2 flex items-center justify-between border-t border-dashed border-ink-200 pt-2 dark:border-ink-800">
                      <span className="text-[12px] font-semibold text-ink-500">
                        Subtotal
                      </span>
                      <span className="text-[12.5px] font-bold">
                        {fmtMoney(t.subtotal)} RWF
                      </span>
                    </div>

                    {traderDiscount > 0 && (
                      <div className="mt-1 flex items-center justify-between text-emerald-600">
                        <span className="flex items-center gap-1 text-[11.5px] font-bold">
                          <Tag size={11} />
                          Promo
                        </span>
                        <span className="text-[12.5px] font-black">
                          −{fmtMoney(traderDiscount)} RWF
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </Card>

            {/* Payment breakdown */}
            <div className="rounded-2xl border border-ink-200/70 bg-white p-5 dark:border-ink-800 dark:bg-ink-900">
              <div className="space-y-2 text-[13px]">
                <div className="flex justify-between">
                  <span className="text-ink-500">Subtotal</span>
                  <span className="font-bold">{fmtMoney(grandTotal)} RWF</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span className="flex items-center gap-1 font-semibold">
                      <Tag size={12} />
                      Promo · {applied.code}
                    </span>
                    <span className="font-black">
                      −{fmtMoney(discount)} RWF
                    </span>
                  </div>
                )}

                <div className="flex justify-between border-t border-dashed border-ink-200 pt-3 dark:border-ink-800">
                  <span className="text-[15px] font-black">Total to pay</span>
                  <span className="text-[20px] font-black text-brand-600">
                    {fmtMoney(finalTotal)}{" "}
                    <span className="text-[12px] font-bold">RWF</span>
                  </span>
                </div>

                {discount > 0 && (
                  <p className="mt-1 flex items-center gap-1 text-[11.5px] font-bold text-emerald-600">
                    <Sparkles size={11} />
                    You're saving {fmtMoney(discount)} RWF
                  </p>
                )}
              </div>

              <button
                onClick={submit}
                disabled={submitting}
                className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-brand-600 text-[15px] font-extrabold text-white shadow-brand transition-all hover:bg-brand-700 disabled:opacity-70"
              >
                {submitting ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 size={17} />
                    Place order
                  </>
                )}
              </button>

              <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-ink-400">
                <ShieldCheck size={12} className="text-brand-600" />
                Safe & secure checkout
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* ═══ Success modal ═══ */}
      {success.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-2xl dark:bg-ink-900">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg">
              <CheckCircle2 size={44} strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-black">Order placed!</h3>
            <p className="mt-2 text-[13.5px] text-ink-500">
              {success.count > 1
                ? `${success.count} orders have been placed successfully.`
                : "Your order has been placed successfully."}
            </p>
            <p className="mt-1 text-[12px] text-ink-400">
              Track it anytime from the Orders page.
            </p>

            <button
              onClick={() => nav("/orders")}
              className="mt-6 flex h-13 w-full items-center justify-center gap-2 rounded-full bg-brand-600 py-3.5 text-[14.5px] font-extrabold text-white shadow-brand hover:bg-brand-700"
            >
              <Receipt size={16} />
              View my orders
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Card({ icon: Icon, title, tint = "brand", children }) {
  const tints = {
    brand: "bg-brand-50 text-brand-600 dark:bg-brand-600/10",
    sky: "bg-sky-500/15 text-sky-600",
    emerald: "bg-emerald-500/15 text-emerald-600",
    amber: "bg-amber-500/15 text-amber-600",
  };
  return (
    <div className="rounded-2xl border border-ink-200/70 bg-white p-5 dark:border-ink-800 dark:bg-ink-900">
      <div className="mb-4 flex items-center gap-2.5">
        <span className={"flex h-9 w-9 items-center justify-center rounded-xl " + tints[tint]}>
          <Icon size={16} />
        </span>
        <h2 className="text-[15px] font-black">{title}</h2>
      </div>
      {children}
    </div>
  );
}