import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Search, Bell, ShoppingCart, User, ChevronDown, MapPin, Heart,
  LogOut, Package, LayoutGrid, Menu, X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/auth";
import { useCartStore } from "../../store/cart.store";

// 👇 Import your logo (place file at src/assets/homelogo.png)
import homelogo from "../../assets/homelogo.png";

const NAV = [
  { to: "/", label: "Home", end: true },
  { to: "/traders", label: "Traders" },
  { to: "/markets", label: "Markets" },
  { to: "/about", label: "About" },
];

export default function Header() {
  const nav = useNavigate();
  const { user, logout } = useAuthStore();
  const totalItems = useCartStore((s) => s.totalItems());
  const [q, setQ] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const close = () => setMenuOpen(false);
    if (menuOpen) window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [menuOpen]);

  const submit = (e) => {
    e.preventDefault();
    if (q.trim()) nav(`/search?q=${encodeURIComponent(q.trim())}`);
    else nav("/search");
  };

  const first = user?.full_name?.split(" ")[0];

  return (
    <header
      className={
        "sticky top-0 z-40 w-full border-b transition-all " +
        (scrolled
          ? "border-ink-200 bg-white/95 shadow-sm backdrop-blur-md dark:border-ink-800 dark:bg-ink-950/95"
          : "border-transparent bg-white dark:bg-ink-950")
      }
    >
      {/* ─── Top strip (desktop only) ─── */}
      <div className="hidden border-b border-ink-100 bg-ink-50 text-[11.5px] text-ink-500 lg:block dark:border-ink-800 dark:bg-ink-900 dark:text-ink-400">
        <div className="container-app flex h-9 items-center justify-between">
          <div className="flex items-center gap-1.5">
            <MapPin size={12} />
            <span>Deliver to</span>
            <span className="font-bold text-ink-700 dark:text-ink-200">
              Rwanda
            </span>
          </div>
          <div className="flex items-center gap-5">
            <Link to="/about" className="hover:text-brand-600">
              Become a seller
            </Link>
            <Link to="/about" className="hover:text-brand-600">
              Help
            </Link>
            <span>EN · RWF</span>
          </div>
        </div>
      </div>

      {/* ─── Main bar ─── */}
      <div className="container-app flex h-16 items-center gap-3">
        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-full text-ink-600 hover:bg-ink-100 md:hidden dark:text-ink-300 dark:hover:bg-ink-800"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* ─── Logo ─── */}
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <img
            src={homelogo}
            alt="umucuruzi"
            className="h-10 w-auto object-contain"
            onError={(e) => {
              // Fallback if logo missing: show text
              e.currentTarget.style.display = "none";
            }}
          />
          <span className="hidden text-lg font-black tracking-tight text-brand-600 sm:block">
            umucuruzi.com
          </span>
        </Link>

        {/* ─── Desktop nav ─── */}
        <nav className="ml-3 hidden items-center gap-0.5 md:flex">
          {NAV.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                "rounded-full px-3 py-2 text-[13.5px] font-bold transition-colors " +
                (isActive
                  ? "text-brand-600"
                  : "text-ink-600 hover:text-brand-600 dark:text-ink-300")
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* ─── Search (desktop) ─── */}
        <form
          onSubmit={submit}
          className="ml-auto hidden max-w-2xl flex-1 items-center md:flex"
        >
          <div className="flex h-11 w-full items-center overflow-hidden rounded-full border-2 border-brand-600 bg-white dark:bg-ink-900">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="What are you looking for?"
              className="h-full flex-1 bg-transparent px-5 text-sm font-medium outline-none placeholder:text-ink-400"
            />
            <button
              type="submit"
              className="flex h-full items-center gap-1.5 bg-brand-600 px-6 text-sm font-extrabold text-white hover:bg-brand-700"
            >
              <Search size={16} />
              <span className="hidden lg:block">Search</span>
            </button>
          </div>
        </form>

        {/* ─── Right actions ─── */}
        <div className="ml-auto flex items-center gap-1 md:ml-2">
          {/* Mobile search icon */}
          <button
            onClick={() => nav("/search")}
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink-600 hover:bg-ink-100 md:hidden dark:text-ink-300 dark:hover:bg-ink-800"
          >
            <Search size={19} />
          </button>

          {/* Wishlist */}
          <button
            onClick={() => nav("/wishlist")}
            className="hidden h-10 w-10 items-center justify-center rounded-full text-ink-600 hover:bg-ink-100 sm:flex dark:text-ink-300 dark:hover:bg-ink-800"
            aria-label="Wishlist"
          >
            <Heart size={19} />
          </button>

          {/* Notifications */}
          <button
            onClick={() => nav("/notifications")}
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800"
            aria-label="Notifications"
          >
            <Bell size={19} />
          </button>

          {/* Cart */}
          <button
            onClick={() => nav("/cart")}
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800"
            aria-label="Cart"
          >
            <ShoppingCart size={19} />
            {totalItems > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-danger-500 px-1 text-[10px] font-extrabold text-white">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </button>

          {/* User */}
          {user ? (
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-1.5 rounded-full border border-ink-200 py-1 pl-1 pr-2 hover:border-brand-600 dark:border-ink-800"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-xs font-extrabold text-white">
                  {user.full_name?.[0]?.toUpperCase() || "U"}
                </span>
                <span className="hidden max-w-[80px] truncate text-[12.5px] font-bold sm:block">
                  {first}
                </span>
                <ChevronDown size={13} />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-ink-200 bg-white py-1 shadow-lg dark:border-ink-800 dark:bg-ink-900">
                  <div className="border-b border-ink-100 px-4 py-3 dark:border-ink-800">
                    <p className="truncate text-[13.5px] font-extrabold">
                      {user.full_name}
                    </p>
                    <p className="truncate text-[11.5px] text-ink-500">
                      @{user.username}
                    </p>
                  </div>

                  <MenuItem to="/profile"          icon={User}        label="My profile" />
                  <MenuItem to="/orders"           icon={Package}     label="My orders" />
                  {user.role === "trader" && (
                    <MenuItem to="/dashboard"     icon={LayoutGrid}  label="Trader dashboard" />
                  )}
                  <MenuItem to="/notifications"    icon={Bell}        label="Notifications" />

                  <div className="my-1 h-px bg-ink-100 dark:bg-ink-800" />
                  <button
                    onClick={() => {
                      logout();
                      setMenuOpen(false);
                      nav("/");
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-[13px] font-bold text-danger-500 hover:bg-danger-500/10"
                  >
                    <LogOut size={14} />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/auth/login"
              className="ml-1 flex items-center gap-1.5 rounded-full bg-brand-600 px-4 py-2 text-[12.5px] font-extrabold text-white shadow-brand hover:bg-brand-700"
            >
              <User size={15} />
              <span className="hidden sm:block">Sign in</span>
            </Link>
          )}
        </div>
      </div>

      {/* ─── Mobile nav drawer ─── */}
      {mobileOpen && (
        <div className="border-t border-ink-200 bg-white md:hidden dark:border-ink-800 dark:bg-ink-950">
          <nav className="container-app flex flex-col py-2">
            {NAV.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  "rounded-lg px-3 py-2.5 text-[14px] font-bold transition-colors " +
                  (isActive
                    ? "bg-brand-50 text-brand-600 dark:bg-brand-600/10"
                    : "text-ink-700 hover:bg-ink-50 dark:text-ink-200 dark:hover:bg-ink-800")
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

function MenuItem({ to, icon: Icon, label }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-2.5 px-4 py-2 text-[13px] font-bold text-ink-700 hover:bg-ink-50 dark:text-ink-200 dark:hover:bg-ink-800"
    >
      <Icon size={14} />
      {label}
    </Link>
  );
}