import { Link } from "react-router-dom";
import { Package, Heart, Gift, Wallet, ArrowRight } from "lucide-react";
import { useAuthStore } from "../../store/auth";

export default function WelcomeBar() {
  const { user } = useAuthStore();
  if (!user) return null;

  const first = user.full_name?.split(" ")[0] || "there";

  return (
    <div className="container-app py-4">
      <div className="flex flex-col gap-4 rounded-2xl border border-ink-200/70 bg-gradient-to-r from-brand-50 via-white to-white p-4 sm:flex-row sm:items-center sm:justify-between dark:border-ink-800 dark:from-brand-600/10 dark:via-ink-900 dark:to-ink-900">
        {/* Left: greeting */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-600 text-lg font-black text-white shadow-brand">
            {first[0].toUpperCase()}
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-brand-600">
              Welcome back
            </p>
            <h2 className="text-lg font-black tracking-tight">
              Hi {first} 👋
            </h2>
            <p className="text-[12.5px] text-ink-500 dark:text-ink-400">
              What would you like to buy today?
            </p>
          </div>
        </div>

        {/* Right: quick tiles */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          <QuickTile to="/orders" icon={Package} label="Orders" />
          <QuickTile to="/wishlist" icon={Heart} label="Wishlist" />
          <QuickTile to="/referrals" icon={Gift} label="Referrals" />
          <QuickTile to="/wallet" icon={Wallet} label="Wallet" />
        </div>
      </div>
    </div>
  );
}

function QuickTile({ to, icon: Icon, label }) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center justify-center gap-1 rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-center transition-colors hover:border-brand-600 hover:bg-brand-50 dark:border-ink-800 dark:bg-ink-900 dark:hover:bg-brand-600/10"
    >
      <Icon size={16} className="text-brand-600" />
      <span className="text-[10.5px] font-extrabold text-ink-700 dark:text-ink-200">
        {label}
      </span>
    </Link>
  );
}