import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingBag, Store, ChevronRight, Search, Filter,
} from "lucide-react";
import { orderService } from "../../services/order";
import { useAuthStore } from "../../store/auth";
import { getFullImageUrl } from "../../lib/image";

const STATUS_COLORS = {
  pending:    "bg-amber-500",
  processing: "bg-sky-500",
  ready:      "bg-violet-500",
  in_transit: "bg-sky-500",
  delivered:  "bg-emerald-500",
  cancelled:  "bg-danger-500",
};

const STATUS_FILTERS = [
  { key: "all",        label: "All" },
  { key: "pending",    label: "Pending" },
  { key: "processing", label: "Processing" },
  { key: "ready",      label: "Ready" },
  { key: "in_transit", label: "In transit" },
  { key: "delivered",  label: "Delivered" },
  { key: "cancelled",  label: "Cancelled" },
];

const initials = (name) =>
  name?.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "?";

const fmtMoney = (n) => Number(n || 0).toLocaleString("en-US");

export default function Orders() {
  const { user } = useAuthStore();
  const isTrader = user?.role === "trader";

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = isTrader
          ? await orderService.getTraderOrders()
          : await orderService.getCustomerOrders();
        setOrders(res || []);
      } finally {
        setLoading(false);
      }
    })();
  }, [isTrader]);

  /* Group by counterparty */
  const grouped = useMemo(() => {
    const map = orders.reduce((acc, o) => {
      const key = isTrader ? o.customer_id : o.trader_id;
      if (!acc[key]) {
        acc[key] = {
          id: key,
          orders: [],
          user: isTrader ? o.customer : o.trader,
        };
      }
      acc[key].orders.push(o);
      return acc;
    }, {});

    return Object.values(map)
      .map((g) => ({
        ...g,
        orders: g.orders.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        ),
      }))
      .sort(
        (a, b) =>
          new Date(b.orders[0]?.created_at) -
          new Date(a.orders[0]?.created_at)
      );
  }, [orders, isTrader]);

  /* Apply tab + search filter */
  const filtered = useMemo(() => {
    let list = grouped;
    if (tab !== "all") {
      list = list
        .map((g) => ({
          ...g,
          orders: g.orders.filter((o) => o.order_status === tab),
        }))
        .filter((g) => g.orders.length > 0);
    }
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      list = list.filter((g) => {
        const name = isTrader
          ? g.user?.TraderProfile?.shop_name || g.user?.full_name || ""
          : g.user?.TraderProfile?.shop_name || g.user?.full_name || "";
        return name.toLowerCase().includes(needle);
      });
    }
    return list;
  }, [grouped, tab, q, isTrader]);

  const counts = useMemo(() => {
    const c = { all: grouped.length };
    grouped.forEach((g) => {
      const st = g.orders[0]?.order_status;
      c[st] = (c[st] || 0) + 1;
    });
    return c;
  }, [grouped]);

  if (loading) {
    return (
      <div className="container-app flex justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-ink-200 border-t-brand-600" />
      </div>
    );
  }

  return (
    <div className="container-app py-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight">
            {isTrader ? "Shop orders" : "My orders"}
          </h1>
          <p className="mt-1 text-[12.5px] text-ink-500">
            {isTrader
              ? "Orders from your customers, grouped by buyer"
              : "Your orders, grouped by trader"}
          </p>
        </div>

        {!isTrader && (
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-5 py-2.5 text-[13px] font-extrabold text-white shadow-brand hover:bg-brand-700"
          >
            <Store size={15} />
            Continue shopping
          </Link>
        )}
      </div>

      {/* Search + tabs */}
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex h-11 flex-1 items-center gap-2 rounded-full border border-ink-200 bg-white px-4 dark:border-ink-800 dark:bg-ink-900">
          <Search size={15} className="text-ink-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={isTrader ? "Search customers…" : "Search traders…"}
            className="h-full flex-1 bg-transparent text-[13.5px] font-medium outline-none placeholder:text-ink-400"
          />
        </div>

        <div className="scrollbar-none flex gap-1.5 overflow-x-auto">
          {STATUS_FILTERS.map((f) => {
            const count = counts[f.key] ?? 0;
            const active = tab === f.key;
            if (f.key !== "all" && count === 0) return null;
            return (
              <button
                key={f.key}
                onClick={() => setTab(f.key)}
                className={
                  "flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-[12.5px] font-bold transition-colors " +
                  (active
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-ink-200 bg-white text-ink-600 hover:border-brand-600 dark:border-ink-800 dark:bg-ink-900 dark:text-ink-300")
                }
              >
                {f.label}
                {count > 0 && (
                  <span
                    className={
                      "rounded-md px-1.5 py-0.5 text-[10px] font-black " +
                      (active ? "bg-white/25" : "bg-ink-100 dark:bg-ink-800")
                    }
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-ink-200 bg-white py-20 text-center dark:border-ink-800 dark:bg-ink-900">
          <ShoppingBag size={44} className="mx-auto text-ink-300" />
          <p className="mt-4 text-lg font-black">
            {tab === "all"
              ? isTrader
                ? "No orders yet"
                : "No orders placed yet"
              : `No ${tab.replace("_", " ")} orders`}
          </p>
          <p className="mt-1 text-[13px] text-ink-500">
            {tab === "all"
              ? isTrader
                ? "Orders will appear here once a customer buys."
                : "Start shopping to see your orders here."
              : "Try a different filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((g) => {
            const avatar = getFullImageUrl(g.user?.profile_image);
            const name = isTrader
              ? g.user?.TraderProfile?.shop_name || g.user?.full_name || "Customer"
              : g.user?.TraderProfile?.shop_name || g.user?.full_name || "Trader";
            const latest = g.orders[0];
            const statusColor = STATUS_COLORS[latest.order_status] || "bg-ink-400";
            const totalAmount = g.orders.reduce(
              (s, o) => s + Number(o.final_amount || 0),
              0
            );

            return (
              <Link
                key={g.id}
                to={`/orders/group/${g.id}?type=${isTrader ? "customer" : "trader"}`}
                className="group flex items-center gap-4 rounded-2xl border border-ink-200/70 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-brand-600 hover:shadow-md dark:border-ink-800 dark:bg-ink-900"
              >
                <div className="relative">
                  <div className="h-14 w-14 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt={name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-brand-600 text-lg font-black text-white">
                        {initials(name)}
                      </div>
                    )}
                  </div>
                  <span
                    className={
                      "absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-white dark:border-ink-900 " +
                      statusColor
                    }
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14.5px] font-extrabold">{name}</p>
                  <p className="mt-0.5 text-[12px] text-ink-500">
                    {g.orders.length}{" "}
                    {g.orders.length === 1 ? "order" : "orders"} · Latest:{" "}
                    {latest.order_status.replace("_", " ")}
                  </p>
                  <p className="mt-1 text-[11px] font-semibold text-brand-600">
                    {fmtMoney(totalAmount)} RWF total
                  </p>
                </div>

                <span className="flex h-7 min-w-[28px] items-center justify-center rounded-full bg-brand-600 px-2 text-[11.5px] font-black text-white">
                  {g.orders.length}
                </span>
                <ChevronRight
                  size={18}
                  className="text-ink-300 transition-colors group-hover:text-brand-600"
                />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}