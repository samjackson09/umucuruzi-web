import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ChevronLeft, Receipt, ChevronRight } from "lucide-react";
import { orderService } from "../../services/order";

const STATUS = {
  pending:    { label: "Pending",    color: "text-amber-600 bg-amber-500/15" },
  processing: { label: "Processing", color: "text-sky-600 bg-sky-500/15" },
  ready:      { label: "Ready",      color: "text-violet-600 bg-violet-500/15" },
  in_transit: { label: "In Transit", color: "text-sky-600 bg-sky-500/15" },
  delivered:  { label: "Delivered",  color: "text-emerald-600 bg-emerald-500/15" },
  cancelled:  { label: "Cancelled",  color: "text-danger-500 bg-danger-500/15" },
};

const fmtMoney = (n) => Number(n || 0).toLocaleString("en-US");

export default function OrderGroup() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const type = params.get("type") || "trader";

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const all = type === "customer"
          ? await orderService.getTraderOrders()
          : await orderService.getCustomerOrders();
        const filtered = (all || []).filter((o) =>
          type === "customer" ? o.customer_id === Number(id) : o.trader_id === Number(id)
        );
        setOrders(filtered);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, type]);

  const person = orders[0]
    ? type === "customer"
      ? orders[0].customer
      : orders[0].trader
    : null;

  const name =
    person?.TraderProfile?.shop_name || person?.full_name || "User";

  return (
    <div className="container-app py-8">
      <div className="mb-6 flex items-center gap-3">
        <Link
          to="/orders"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-ink-200 bg-white text-ink-600 hover:border-brand-600 dark:border-ink-800 dark:bg-ink-900"
        >
          <ChevronLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-black tracking-tight">{name}</h1>
          <p className="mt-0.5 text-[12.5px] text-ink-500">
            {orders.length} {orders.length === 1 ? "order" : "orders"}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-ink-200 border-t-brand-600" />
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => {
            const meta = STATUS[o.order_status] || STATUS.pending;
            return (
              <Link
                key={o.id}
                to={`/orders/detail/${o.id}`}
                className="flex items-center gap-4 rounded-2xl border border-ink-200/70 bg-white p-4 transition-all hover:border-brand-600 hover:shadow-md dark:border-ink-800 dark:bg-ink-900"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-ink-50 dark:bg-ink-800">
                  <Receipt size={20} className="text-brand-600" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14.5px] font-extrabold">Order #{o.id}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={"rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide " + meta.color}>
                      {meta.label}
                    </span>
                    <span className="text-[11px] text-ink-400">
                      {new Date(o.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[15px] font-black text-brand-600">
                    {fmtMoney(o.final_amount)}
                  </p>
                  <p className="text-[9.5px] font-bold text-ink-400">RWF</p>
                </div>
                <ChevronRight size={18} className="text-ink-300" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}