import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft, Receipt, CheckCircle2, Clock, Bike, Package, User, Phone,
  Mail, MapPin, CreditCard, Coins, Truck, X, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { orderService } from "../../services/order";
import { useAuthStore } from "../../store/auth";
import { getFullImageUrl, extractFirstImage } from "../../lib/image";

const STEPS = [
  { key: "pending",    label: "Placed",     icon: Receipt },
  { key: "processing", label: "Processing", icon: Clock },
  { key: "ready",      label: "Ready",      icon: Package },
  { key: "in_transit", label: "In Transit", icon: Bike },
  { key: "delivered",  label: "Delivered",  icon: CheckCircle2 },
];

const fmtMoney = (n) => Number(n || 0).toLocaleString("en-US");

export default function OrderDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuthStore();
  const isTrader = user?.role === "trader";

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const load = async () => {
    try {
      const data = await orderService.getOrderById(id);
      setOrder(data);
    } catch {
      toast.error("Could not load order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const updateStatus = async (status) => {
    setUpdating(true);
    try {
      await orderService.updateOrderStatus(id, status);
      toast.success("Order updated");
      load();
    } catch {
      toast.error("Failed to update order");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="container-app flex justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-ink-200 border-t-brand-600" />
      </div>
    );
  }
  if (!order) return <div className="container-app py-20 text-center">Order not found</div>;

  const currentIdx = STEPS.findIndex((s) => s.key === order.order_status);
  const isCancelled = order.order_status === "cancelled";

  return (
    <div className="container-app max-w-3xl py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => nav("/orders")}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-ink-200 bg-white text-ink-600 hover:border-brand-600 dark:border-ink-800 dark:bg-ink-900"
        >
          <ChevronLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-black">Order #{order.id}</h1>
          <p className="mt-0.5 text-[12.5px] text-ink-500">
            Placed on {new Date(order.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Tracker */}
      <div className="mb-4 rounded-2xl border border-ink-200/70 bg-white p-5 dark:border-ink-800 dark:bg-ink-900">
        {isCancelled ? (
          <div className="flex items-center gap-2.5 rounded-xl bg-danger-500/10 p-4 text-danger-500">
            <X size={18} />
            <span className="text-[13.5px] font-bold">
              This order was cancelled
            </span>
          </div>
        ) : (
          <>
            <div className="flex items-center">
              {STEPS.map((s, i) => {
                const Icon = s.icon;
                const done = i < currentIdx;
                const active = i === currentIdx;
                return (
                  <div key={s.key} className="flex flex-1 items-center last:flex-none">
                    <div
                      className={
                        "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors " +
                        (done || active
                          ? "border-brand-600 bg-brand-600 text-white"
                          : "border-ink-200 bg-white text-ink-400 dark:border-ink-700 dark:bg-ink-800")
                      }
                    >
                      <Icon size={14} />
                    </div>
                    {i < STEPS.length - 1 && (
                      <div
                        className={
                          "h-0.5 flex-1 " + (done ? "bg-brand-600" : "bg-ink-200 dark:bg-ink-800")
                        }
                      />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-2 flex">
              {STEPS.map((s, i) => (
                <span
                  key={s.key}
                  className={
                    "flex-1 text-center text-[10.5px] font-bold " +
                    (i <= currentIdx ? "text-brand-600" : "text-ink-400")
                  }
                >
                  {s.label}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Customer (trader view) */}
      {isTrader && order.customer && (
        <Section title="Customer">
          <Row icon={User}  text={order.customer.full_name} />
          <Row icon={Phone} text={order.customer.phone} />
          {order.customer.email && <Row icon={Mail} text={order.customer.email} />}
        </Section>
      )}

      {/* Items */}
      <Section title={`Items (${order.OrderItems?.length || 0})`}>
        <div className="divide-y divide-ink-100 dark:divide-ink-800">
          {order.OrderItems?.map((it) => {
            const img = getFullImageUrl(extractFirstImage(it.Product?.images));
            return (
              <div key={it.id} className="flex items-center gap-3 py-3">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-ink-100 dark:bg-ink-800">
                  {img ? (
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-ink-300">
                      <Package size={20} />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-[13.5px] font-bold">
                    {it.Product?.name || "Product"}
                  </p>
                  <p className="mt-0.5 text-[11.5px] text-ink-500">
                    Qty {it.quantity} · {fmtMoney(it.price_at_time)} RWF each
                  </p>
                </div>
                <p className="text-[13.5px] font-black text-brand-600">
                  {fmtMoney(it.subtotal)}
                </p>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Delivery */}
      <Section title="Delivery & Payment">
        <Row icon={Truck} text={order.delivery_type === "delivery" ? "Delivery" : "Pickup"} />
        {order.delivery_address && <Row icon={MapPin} text={order.delivery_address} />}
        <Row icon={CreditCard} text={(order.payment_method || "").replace(/_/g, " ").toUpperCase()} />
        <Row icon={Coins} text={`Payment: ${order.payment_status || "pending"}`} />
      </Section>

      {/* Totals */}
      <Section title="Order summary">
        <div className="space-y-2 text-[13px]">
          <div className="flex justify-between">
            <span className="text-ink-500">Subtotal</span>
            <span className="font-bold">{fmtMoney(order.total_amount)} RWF</span>
          </div>
          {order.discount_amount > 0 && (
            <div className="flex justify-between text-danger-500">
              <span>Discount</span>
              <span className="font-bold">-{fmtMoney(order.discount_amount)} RWF</span>
            </div>
          )}
          <div className="flex justify-between border-t border-dashed border-ink-200 pt-2 dark:border-ink-800">
            <span className="text-[15px] font-black">Total</span>
            <span className="text-[18px] font-black text-brand-600">
              {fmtMoney(order.final_amount)} RWF
            </span>
          </div>
        </div>
      </Section>

      {/* Trader actions */}
      {isTrader && !["delivered", "cancelled"].includes(order.order_status) && (
        <Section title="Manage order">
          <div className="space-y-2">
            {order.order_status === "pending" && (
              <PrimaryBtn onClick={() => updateStatus("processing")} loading={updating}>
                Accept order
              </PrimaryBtn>
            )}
            {order.order_status === "processing" && (
              <PrimaryBtn onClick={() => updateStatus("ready")} loading={updating}>
                Mark ready
              </PrimaryBtn>
            )}
            {order.order_status === "ready" && (
              <PrimaryBtn onClick={() => updateStatus("in_transit")} loading={updating}>
                Mark in transit
              </PrimaryBtn>
            )}
            {order.order_status === "in_transit" && (
              <PrimaryBtn onClick={() => updateStatus("delivered")} loading={updating} color="emerald">
                Mark delivered
              </PrimaryBtn>
            )}
            <button
              onClick={() => {
                if (confirm("Cancel this order?")) updateStatus("cancelled");
              }}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-full border-2 border-danger-500/40 text-[13px] font-extrabold text-danger-500 hover:bg-danger-500/10"
            >
              <X size={15} />
              Cancel order
            </button>
          </div>
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-4 rounded-2xl border border-ink-200/70 bg-white p-5 dark:border-ink-800 dark:bg-ink-900">
      <h2 className="mb-3 text-[15px] font-black">{title}</h2>
      {children}
    </div>
  );
}

function Row({ icon: Icon, text }) {
  return (
    <div className="mb-2 flex items-center gap-3 last:mb-0">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-brand-600 dark:bg-ink-800">
        <Icon size={14} />
      </span>
      <span className="text-[13.5px] text-ink-600 dark:text-ink-300">{text}</span>
    </div>
  );
}

function PrimaryBtn({ onClick, loading, children, color = "brand" }) {
  const cls =
    color === "emerald"
      ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/25"
      : "bg-brand-600 hover:bg-brand-700 shadow-brand";
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={
        "flex h-12 w-full items-center justify-center gap-2 rounded-full text-[14px] font-extrabold text-white shadow-md transition-all disabled:opacity-70 " +
        cls
      }
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : children}
    </button>
  );
}