import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutGrid, Package, Plus, Tag, Ticket, QrCode, Users, Truck,
  ArrowLeft, Menu, X, LogOut, Store,
} from "lucide-react";
import { useAuthStore } from "../../store/auth";

const NAV = [
  { to: "/dashboard", label: "Overview", icon: LayoutGrid, end: true },
  { to: "/dashboard/products", label: "My Products", icon: Package },
  { to: "/dashboard/add-product", label: "Add Product", icon: Plus },
  { to: "/dashboard/pricetable", label: "Price Table", icon: Tag },
  { to: "/dashboard/promocodes", label: "Promo Codes", icon: Ticket },
  { to: "/dashboard/qr-code", label: "My QR Code", icon: QrCode },
  { to: "/profile/loyal-customers", label: "Loyal Customers", icon: Users },
  { to: "/profile/trader-delivery-agents", label: "Delivery Agents", icon: Truck },
];

export default function DashboardShell() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const nav = useNavigate();

  return (
    <div className="flex min-h-screen bg-surface dark:bg-ink-950">
      {/* Sidebar (desktop) */}
      <aside className="hidden w-64 shrink-0 border-r border-ink-200/70 bg-white lg:flex lg:flex-col dark:border-ink-800 dark:bg-ink-900">
        <SidebarContent user={user} logout={logout} nav={nav} />
      </aside>

      {/* Sidebar (mobile) */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <div className="relative flex h-full w-72 flex-col bg-white dark:bg-ink-900">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 rounded-full p-1.5 text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800"
            >
              <X size={20} />
            </button>
            <SidebarContent user={user} logout={logout} nav={nav} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <div className="flex h-14 items-center gap-3 border-b border-ink-200/70 bg-white px-4 lg:px-6 dark:border-ink-800 dark:bg-ink-900">
          <button
            onClick={() => setOpen(true)}
            className="rounded-lg p-1.5 text-ink-600 hover:bg-ink-100 lg:hidden dark:hover:bg-ink-800"
          >
            <Menu size={20} />
          </button>

          <Link
            to="/"
            className="flex items-center gap-1.5 text-[13px] font-bold text-ink-500 hover:text-brand-600"
          >
            <ArrowLeft size={14} />
            Back to store
          </Link>

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-[12.5px] font-bold text-ink-500 sm:block">
              {user?.full_name}
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-xs font-black text-white">
              {user?.full_name?.[0]?.toUpperCase() || "U"}
            </span>
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ user, logout, nav, onNavigate }) {
  return (
    <>
      <Link
        to="/"
        onClick={onNavigate}
        className="flex items-center gap-2 border-b border-ink-200/70 px-5 py-5 dark:border-ink-800"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
          <Store size={18} />
        </span>
        <div>
          <p className="text-sm font-black text-brand-600">umucuruzi</p>
          <p className="text-[10.5px] font-bold uppercase tracking-wider text-ink-400">
            Trader dashboard
          </p>
        </div>
      </Link>

      <nav className="flex-1 space-y-0.5 p-3">
        {NAV.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onNavigate}
              className={({ isActive }) =>
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-bold transition-colors " +
                (isActive
                  ? "bg-brand-50 text-brand-600 dark:bg-brand-600/10"
                  : "text-ink-600 hover:bg-ink-50 dark:text-ink-300 dark:hover:bg-ink-800")
              }
            >
              <Icon size={17} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-ink-200/70 p-3 dark:border-ink-800">
        <button
          onClick={() => {
            logout();
            nav("/");
          }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-bold text-danger-500 hover:bg-danger-500/10"
        >
          <LogOut size={17} />
          Sign out
        </button>
      </div>
    </>
  );
}