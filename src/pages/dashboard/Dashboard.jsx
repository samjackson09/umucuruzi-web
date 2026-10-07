import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  TrendingUp, ShoppingCart, Users, Package, Receipt, CheckCircle2,
  Clock, RefreshCw, ArrowRight, Trophy, Plus, Tag, Ticket, QrCode,
  BarChart3,
} from "lucide-react";
import { traderService } from "../../services/trader";
import { useAuthStore } from "../../store/auth";
import { StatCard } from "../../components/ui/StatCard";

const fmtNum = (n) => {
  if (!n) return "0";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
};

const fmtMoney = (n) => {
  const num = Number(n) || 0;
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return String(Math.round(num));
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

const STATUS = {
  pending:    { label: "Pending",    color: "text-amber-600",   bg: "bg-amber-500/15",   icon: Clock },
  processing: { label: "Processing", color: "text-sky-600",     bg: "bg-sky-500/15",     icon: RefreshCw },
  ready:      { label: "Ready",      color: "text-violet-600",  bg: "bg-violet-500/15",  icon: CheckCircle2 },
  in_transit: { label: "In Transit", color: "text-sky-600",     bg: "bg-sky-500/15",     icon: TrendingUp },
  delivered:  { label: "Delivered",  color: "text-emerald-600", bg: "bg-emerald-500/15", icon: CheckCircle2 },
  cancelled:  { label: "Cancelled",  color: "text-danger-500",  bg: "bg-danger-500/15",  icon: XCircle },
};

// Small helper component for cancelled icon (missing in imports above)
import { XCircle } from "lucide-react";

const QUICK_ACTIONS = [
  { title: "My Products", sub: "Manage catalog",   icon: Package,  color: "bg-brand-50 text-brand-600 dark:bg-brand-600/10", to: "/dashboard/products" },
  { title: "Add Product", sub: "List something new", icon: Plus,  color: "bg-emerald-500/15 text-emerald-600",             to: "/dashboard/add-product" },
  { title: "Price Table", sub: "Update prices",    icon: Tag,      color: "bg-sky-500/15 text-sky-600",                     to: "/dashboard/pricetable" },
  { title: "Promo Codes", sub: "Run a campaign",   icon: Ticket,   color: "bg-amber-500/15 text-amber-600",                 to: "/dashboard/promocodes" },
  { title: "My QR Code",  sub: "Share your shop",  icon: QrCode,   color: "bg-violet-500/15 text-violet-600",               to: "/dashboard/qr-code" },
];

export default function Dashboard() {
  const { user } = useAuthStore();
  const nav = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const data = await traderService.getDashboardStats();
      setStats(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const derived = useMemo(() => {
    const totalOrders = Number(stats?.totalOrders) || 0;
    const delivered = Number(stats?.deliveredOrders) || 0;
    const totalProducts = Number(stats?.totalProducts) || 0;
    const customers = Number(stats?.totalCustomers) || 0;
    const revenue = Number(stats?.revenue) || 0;
    const pending = Math.max(0, totalOrders - delivered);

    const rate = totalOrders ? (delivered / totalOrders) * 100 : 0;
    const avg = delivered ? revenue / delivered : 0;

    const recent = stats?.recentOrders || [];
    const statusCounts = {};
    recent.forEach((o) => {
      const s = o.order_status || "pending";
      statusCounts[s] = (statusCounts[s] || 0) + 1;
    });

    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      days.push({ label: "SMTWTFS"[d.getDay()], count: 0, revenue: 0, date: d });
    }
    recent.forEach((o) => {
      if (!o.created_at) return;
      const od = new Date(o.created_at);
      od.setHours(0, 0, 0, 0);
      const idx = days.findIndex((d) => d.date.getTime() === od.getTime());
      if (idx >= 0) {
        days[idx].count++;
        days[idx].revenue += Number(o.final_amount) || 0;
      }
    });
    const maxCount = Math.max(1, ...days.map((d) => d.count));

    return {
      totalOrders, delivered, totalProducts, customers, revenue,
      pending, rate, avg, recent, statusCounts, days, maxCount,
    };
  }, [stats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-ink-200 border-t-brand-600" />
      </div>
    );
  }

  const first = user?.full_name?.split(" ")[0] || "there";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-ink-400">
            Dashboard
          </p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-ink-900 dark:text-ink-100">
            Welcome back, {first}
          </h1>
          <p className="mt-1 text-[13px] text-ink-500">
            Here's how your shop is performing today
          </p>
        </div>
        <button
          onClick={fetchStats}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-ink-200 bg-white text-ink-500 hover:border-brand-600 hover:text-brand-600 dark:border-ink-800 dark:bg-ink-900"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Revenue hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-600 to-brand-700 p-6 text-white shadow-brand sm:p-8">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10.5px] font-extrabold uppercase tracking-widest text-white/70">
              Total revenue
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-black tracking-tighter sm:text-5xl">
                {fmtMoney(derived.revenue)}
              </span>
              <span className="text-base font-black text-white/80">RWF</span>
            </div>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
            <BarChart3 size={22} />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 border-t border-b border-white/20 py-4">
          <div>
            <div className="flex items-center gap-1.5 text-lg font-black">
              <TrendingUp size={13} />
              {derived.rate.toFixed(0)}%
            </div>
            <p className="text-[10.5px] font-semibold text-white/70">
              Delivery rate
            </p>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-lg font-black">
              <CheckCircle2 size={13} />
              {derived.delivered}
            </div>
            <p className="text-[10.5px] font-semibold text-white/70">
              Completed
            </p>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-lg font-black">
              <Clock size={13} />
              {derived.pending}
            </div>
            <p className="text-[10.5px] font-semibold text-white/70">
              In progress
            </p>
          </div>
        </div>

        {/* Sparkline */}
        <div className="mt-4 flex h-12 items-end gap-1.5">
          {derived.days.map((d, i) => {
            const h = Math.max(6, (d.count / derived.maxCount) * 40);
            return (
              <div
                key={i}
                className="flex-1 rounded-sm"
                style={{
                  height: h,
                  backgroundColor:
                    d.count > 0 ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.25)",
                }}
              />
            );
          })}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard icon={Receipt}      label="Orders"    value={fmtNum(derived.totalOrders)}  color="sky" />
        <StatCard icon={CheckCircle2} label="Delivered" value={fmtNum(derived.delivered)}    color="emerald" />
        <StatCard icon={Clock}        label="Pending"   value={fmtNum(derived.pending)}      color="amber" />
        <StatCard icon={Package}      label="Products"  value={fmtNum(derived.totalProducts)} color="violet" />
        <StatCard icon={Users}        label="Customers" value={fmtNum(derived.customers)}    color="sky" />
        <StatCard icon={TrendingUp}   label="Avg order" value={fmtMoney(derived.avg)}  suffix="RWF" color="pink" />
      </div>

      {/* Chart */}
      <div className="rounded-2xl border border-ink-200/70 bg-white p-5 dark:border-ink-800 dark:bg-ink-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[15px] font-black text-ink-900 dark:text-ink-100">
            Last 7 days
          </h2>
          <div className="flex items-center gap-1.5 text-[11.5px] font-semibold text-ink-400">
            <span className="h-2 w-2 rounded-full bg-brand-600" />
            Orders
          </div>
        </div>

        <div className="flex h-[170px] items-end justify-between gap-1.5 px-1">
          {derived.days.map((d, i) => {
            const h = Math.max(8, (d.count / derived.maxCount) * 120);
            const isToday = i === derived.days.length - 1;
            return (
              <div key={i} className="flex flex-1 flex-col items-center">
                <span className="mb-1 min-h-[12px] text-[10px] font-extrabold text-ink-400">
                  {d.count || ""}
                </span>
                <div
                  className={
                    "w-[70%] max-w-[32px] rounded-md " +
                    (isToday ? "bg-brand-600" : "bg-brand-600/60")
                  }
                  style={{ height: h }}
                />
                <span
                  className={
                    "mt-2 text-[11px] font-bold " +
                    (isToday ? "text-brand-600" : "text-ink-400")
                  }
                >
                  {d.label}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex items-center gap-4 border-t border-ink-100 pt-4 dark:border-ink-800">
          <div className="flex-1">
            <p className="text-[10.5px] font-bold uppercase tracking-wider text-ink-400">
              This week
            </p>
            <p className="mt-1 text-[15px] font-black text-ink-900 dark:text-ink-100">
              {derived.days.reduce((s, d) => s + d.count, 0)} orders
            </p>
          </div>
          <div className="h-8 w-px bg-ink-100 dark:bg-ink-800" />
          <div className="flex-1">
            <p className="text-[10.5px] font-bold uppercase tracking-wider text-ink-400">
              Revenue
            </p>
            <p className="mt-1 text-[15px] font-black text-brand-600">
              {fmtMoney(derived.days.reduce((s, d) => s + d.revenue, 0))} RWF
            </p>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="mb-3 text-[15px] font-black text-ink-900 dark:text-ink-100">
          Quick actions
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_ACTIONS.map((a) => {
            const Icon = a.icon;
            return (
              <Link
                key={a.to}
                to={a.to}
                className="flex items-center gap-3 rounded-2xl border border-ink-200/70 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-brand-600 hover:shadow-md dark:border-ink-800 dark:bg-ink-900"
              >
                <span className={"flex h-11 w-11 items-center justify-center rounded-xl " + a.color}>
                  <Icon size={19} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-extrabold">{a.title}</p>
                  <p className="truncate text-[12px] text-ink-400">{a.sub}</p>
                </div>
                <ArrowRight size={16} className="text-ink-300" />
              </Link>
            );
          })}
        </div>
      </div>

      {/* Status breakdown */}
      {Object.keys(derived.statusCounts).length > 0 && (
        <div className="rounded-2xl border border-ink-200/70 bg-white dark:border-ink-800 dark:bg-ink-900">
          <h2 className="border-b border-ink-100 p-5 text-[15px] font-black dark:border-ink-800">
            Recent order status
          </h2>
          <div className="divide-y divide-ink-100 dark:divide-ink-800">
            {Object.entries(derived.statusCounts).map(([status, count]) => {
              const meta = STATUS[status] || STATUS.pending;
              const Icon = meta.icon;
              const pct = (count / derived.recent.length) * 100;
              return (
                <div key={status} className="flex items-center gap-3 p-4">
                  <span
                    className={
                      "flex h-9 w-9 items-center justify-center rounded-xl " + meta.bg
                    }
                  >
                    <Icon size={15} className={meta.color} />
                  </span>
                  <div className="flex-1">
                    <div className="mb-1.5 flex items-center justify-between">
                      <p className="text-[13.5px] font-bold">{meta.label}</p>
                      <p className="text-[11.5px] font-semibold text-ink-400">
                        {count} ({pct.toFixed(0)}%)
                      </p>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
                      <div
                        className="h-full rounded-full bg-brand-600"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent orders */}
      {derived.recent.length > 0 && (
        <div className="rounded-2xl border border-ink-200/70 bg-white dark:border-ink-800 dark:bg-ink-900">
          <div className="flex items-center justify-between border-b border-ink-100 p-5 dark:border-ink-800">
            <h2 className="text-[15px] font-black">Recent orders</h2>
            <Link to="/orders" className="text-[12.5px] font-bold text-brand-600 hover:text-brand-700">
              See all
            </Link>
          </div>
          <div className="divide-y divide-ink-100 dark:divide-ink-800">
            {derived.recent.slice(0, 5).map((o) => {
              const meta = STATUS[o.order_status] || STATUS.pending;
              return (
                <Link
                  key={o.id}
                  to={`/orders/detail/${o.id}`}
                  className="flex items-center gap-3 p-4 hover:bg-ink-50 dark:hover:bg-ink-800/50"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ink-100 text-center dark:bg-ink-800">
                    <div>
                      <p className="text-[9px] font-extrabold text-ink-400">#</p>
                      <p className="text-[13px] font-black">{o.id}</p>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-bold">
                      {o.customer?.full_name || "Customer"}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className={"inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-extrabold uppercase " + meta.bg + " " + meta.color}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {meta.label}
                      </span>
                      <span className="text-[10.5px] text-ink-400">
                        {timeAgo(o.created_at)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[14.5px] font-black text-brand-600">
                      {fmtMoney(o.final_amount)}
                    </p>
                    <p className="text-[9.5px] font-bold text-ink-400">RWF</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}