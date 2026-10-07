import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Trash2, Minus, Plus, ShoppingCart, Store, ArrowRight, Image as ImgIcon,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "../store/cart.store";
import { useAuthStore } from "../store/auth";
import { getFullImageUrl, extractFirstImage } from "../lib/image";

const formatQty = (q) => {
  const n = Number(q);
  return isNaN(n) || n === 0 ? "0" : String(parseFloat(n.toFixed(3)));
};

const sanitizeQty = (text) => {
  let s = text.replace(/[^0-9.]/g, "");
  const i = s.indexOf(".");
  if (i !== -1) s = s.slice(0, i + 1) + s.slice(i + 1).replace(/\./g, "");
  return s;
};

const fmtMoney = (n) =>
  parseFloat(String(n ?? "0")).toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });

export default function Cart() {
  const nav = useNavigate();
  const { user } = useAuthStore();
  const {
    cart, loading, fetchCart, updateQuantity, removeFromCart, clearCart,
    totalItems, totalAmount,
  } = useCartStore();

  const [localQty, setLocalQty] = useState({});
  const [updating, setUpdating] = useState({});
  const timers = useRef({});

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  useEffect(
    () => () => {
      Object.values(timers.current).forEach(clearTimeout);
    },
    []
  );

  const commit = async (itemId, qty, item) => {
    setUpdating((p) => ({ ...p, [itemId]: true }));
    try {
      await updateQuantity(itemId, qty);
    } catch (e) {
      toast.error(e?.response?.data?.error || "Could not update quantity");
      setLocalQty((p) => {
        const n = { ...p };
        delete n[itemId];
        return n;
      });
    } finally {
      setUpdating((p) => {
        const n = { ...p };
        delete n[itemId];
        return n;
      });
    }
  };

  const onChange = (itemId, text, item) => {
    const clean = sanitizeQty(text);
    setLocalQty((p) => ({ ...p, [itemId]: clean }));
    clearTimeout(timers.current[itemId]);
    timers.current[itemId] = setTimeout(() => {
      const num = parseFloat(clean);
      if (isNaN(num) || num <= 0) {
        setLocalQty((p) => {
          const n = { ...p };
          delete n[itemId];
          return n;
        });
        return;
      }
      commit(itemId, num, item);
    }, 700);
  };

  const onBlur = (itemId, item) => {
    clearTimeout(timers.current[itemId]);
    const raw =
      localQty[itemId] !== undefined ? localQty[itemId] : formatQty(item.quantity);
    const num = parseFloat(raw);
    setLocalQty((p) => {
      const n = { ...p };
      delete n[itemId];
      return n;
    });
    if (isNaN(num) || num <= 0) return;
    if (num === Number(item.quantity)) return;
    commit(itemId, num, item);
  };

  const step = async (item, dir) => {
    const current = Number(item.quantity) || 0;
    const next = current + dir;
    if (next <= 0) {
      if (confirm(`Remove ${item.Product?.name} from cart?`)) {
        await removeFromCart(item.id);
        fetchCart();
      }
      return;
    }
    setLocalQty((p) => ({ ...p, [item.id]: formatQty(next) }));
    await commit(item.id, next, item);
    setLocalQty((p) => {
      const n = { ...p };
      delete n[item.id];
      return n;
    });
  };

  const remove = async (item) => {
    if (!confirm("Remove this item?")) return;
    await removeFromCart(item.id);
    fetchCart();
  };

  const handleCheckout = () => {
    if (!user) {
      toast.error("Please sign in first");
      nav("/auth/login");
      return;
    }
    if (!cart.length) {
      toast.error("Cart is empty");
      return;
    }
    nav("/checkout");
  };

  const flatItems = [];
  (cart || []).forEach((g) => {
    (g.items || []).forEach((it) => flatItems.push({ group: g, item: it }));
  });

  const clear = async () => {
    if (!confirm("Clear all items from your cart?")) return;
    await clearCart();
  };

  if (loading) {
    return (
      <div className="container-app flex justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-ink-200 border-t-brand-600" />
      </div>
    );
  }

  return (
    <div className="container-app py-8">
      <div className="mb-6 flex items-baseline justify-between">
        <h1 className="text-2xl font-black tracking-tight">My Cart</h1>
        <p className="text-[12.5px] font-semibold text-ink-500">
          {flatItems.length} {flatItems.length === 1 ? "item" : "items"}
        </p>
      </div>

      {flatItems.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-ink-200 bg-white py-20 text-center dark:border-ink-800 dark:bg-ink-900">
          <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-ink-100 dark:bg-ink-800">
            <ShoppingCart size={40} className="text-ink-300" />
          </div>
          <p className="text-lg font-black">Your cart is empty</p>
          <p className="mt-1 text-[13px] text-ink-500">
            Add products from a shop to see them here.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-[13px] font-extrabold text-white shadow-brand hover:bg-brand-700"
          >
            <Store size={15} />
            Browse shops
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Items */}
          <div className="space-y-3">
            {flatItems.map(({ group, item }) => {
              const p = item.Product || {};
              const img = getFullImageUrl(extractFirstImage(p.images));
              const lineTotal =
                (Number(item.quantity) || 0) * (Number(p.price) || 0);
              const shownQty =
                localQty[item.id] !== undefined
                  ? localQty[item.id]
                  : formatQty(item.quantity);
              const isUpdating = !!updating[item.id];

              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-ink-200/70 bg-white p-4 dark:border-ink-800 dark:bg-ink-900"
                >
                  <div className="mb-3 flex items-center gap-1.5 text-[11.5px] font-bold text-ink-500">
                    <Store size={12} className="text-brand-600" />
                    {group.trader?.TraderProfile?.shop_name ||
                      group.trader?.full_name ||
                      "Trader"}
                  </div>

                  <div className="flex gap-4">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-ink-100 dark:bg-ink-800">
                      {img ? (
                        <img src={img} alt={p.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-ink-300">
                          <ImgIcon size={22} />
                        </div>
                      )}
                      {isUpdating && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <Loader2 size={18} className="animate-spin text-white" />
                        </div>
                      )}
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start gap-2">
                        <p className="line-clamp-2 flex-1 text-[14px] font-bold leading-snug">
                          {p.name || "Product"}
                        </p>
                        <button
                          onClick={() => remove(item)}
                          className="shrink-0 text-danger-500 hover:bg-danger-500/10 p-1 rounded-lg"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                      <p className="mt-1 text-[11.5px] text-ink-500">
                        {fmtMoney(p.price)} RWF each
                      </p>

                      <div className="mt-3 flex items-center gap-2">
                        <button
                          onClick={() => step(item, -1)}
                          disabled={isUpdating}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-100 text-brand-600 hover:bg-ink-200 disabled:opacity-50 dark:bg-ink-800"
                        >
                          {Number(item.quantity) > 1 ? <Minus size={14} /> : <Trash2 size={13} className="text-danger-500" />}
                        </button>
                        <input
                          value={shownQty}
                          onChange={(e) => onChange(item.id, e.target.value, item)}
                          onBlur={() => onBlur(item.id, item)}
                          inputMode="decimal"
                          className="h-8 w-16 rounded-lg border-2 border-ink-200 bg-white text-center text-[13px] font-black outline-none focus:border-brand-600 dark:border-ink-700 dark:bg-ink-900"
                        />
                        <button
                          onClick={() => step(item, 1)}
                          disabled={isUpdating}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600/15 text-brand-600 hover:bg-brand-600/25 disabled:opacity-50"
                        >
                          <Plus size={14} />
                        </button>
                        <span className="ml-auto text-[15px] font-black">
                          {fmtMoney(lineTotal)}{" "}
                          <span className="text-[10px] font-bold">RWF</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-ink-200/70 bg-white p-5 dark:border-ink-800 dark:bg-ink-900">
              <h2 className="text-[15px] font-black">Order summary</h2>

              <div className="mt-4 space-y-2 text-[13px]">
                <div className="flex justify-between">
                  <span className="text-ink-500">Items</span>
                  <span className="font-bold">{totalItems()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-500">Subtotal</span>
                  <span className="font-bold">{fmtMoney(totalAmount())} RWF</span>
                </div>
                <div className="flex justify-between border-t border-dashed border-ink-200 pt-3 dark:border-ink-800">
                  <span className="text-[15px] font-black">Total</span>
                  <span className="text-[19px] font-black text-brand-600">
                    {fmtMoney(totalAmount())} RWF
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-brand-600 text-[15px] font-extrabold text-white shadow-brand hover:bg-brand-700"
              >
                Proceed to checkout
                <ArrowRight size={16} />
              </button>

              <button
                onClick={clear}
                className="mt-3 flex w-full items-center justify-center gap-1.5 py-2 text-[12.5px] font-bold text-danger-500 hover:underline"
              >
                <Trash2 size={13} />
                Clear cart
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}