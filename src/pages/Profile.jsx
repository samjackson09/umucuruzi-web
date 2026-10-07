import { Link, useNavigate } from "react-router-dom";
import {
  Pencil, Mail, Phone, User, Gift, Bell, Settings, Tag, Store, Users,
  Truck, Bike, ChevronRight, LogOut, ShoppingBag, Package,
} from "lucide-react";
import { useAuthStore } from "../store/auth";
import { getFullImageUrl } from "../lib/image";

const initials = (name) =>
  name?.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "?";

export default function Profile() {
  const nav = useNavigate();
  const { user, logout } = useAuthStore();

  if (!user) {
    return (
      <div className="container-app flex flex-col items-center py-24 text-center">
        <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-600/10">
          <User size={40} className="text-brand-600" />
        </div>
        <h1 className="text-xl font-black">Not signed in</h1>
        <p className="mt-2 text-[13px] text-ink-500">
          Sign in to access your profile and orders
        </p>
        <Link
          to="/auth/login"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-[13.5px] font-extrabold text-white shadow-brand hover:bg-brand-700"
        >
          Go to login
          <ChevronRight size={15} />
        </Link>
      </div>
    );
  }

  const isTrader = user.role === "trader";
  const isAgent = user.role === "agent";

  const avatar = getFullImageUrl(user.profile_image);

  const roleMenu = [];
  if (user.role === "customer") {
    roleMenu.push(
      { icon: Users, label: "Trusted traders", to: "/profile/trusted-traders" },
      { icon: Bike,  label: "My delivery agents", to: "/profile/delivery-agents" }
    );
  } else if (isTrader) {
    roleMenu.push(
      { icon: Package, label: "Dashboard",         to: "/dashboard" },
      { icon: Users,   label: "Loyal customers",   to: "/profile/loyal-customers" },
      { icon: Truck,   label: "Delivery agents",   to: "/profile/trader-delivery-agents" }
    );
  } else if (isAgent) {
    roleMenu.push({ icon: Bike, label: "Delivery history", to: "/profile/delivery-history" });
  }

  const sections = [
    roleMenu.length > 0 && { title: "Activity", items: roleMenu },
    {
      title: "Account",
      items: [
        { icon: User, label: "Edit profile", to: "/profile/edit" },
        { icon: Gift, label: "Referrals",    to: "/referrals" },
        { icon: Bell, label: "Notifications", to: "/notifications" },
      ],
    },
    {
      title: "Support & settings",
      items: [
        { icon: Settings, label: "Settings", to: "/settings" },
        { icon: Tag,      label: "Pricing",  to: "/pricing" },
      ],
    },
  ].filter(Boolean);

  const handleLogout = () => {
    if (confirm("Sign out of umucuruzi?")) {
      logout();
      nav("/");
    }
  };

  return (
    <div className="container-app py-8">
      {/* Header card */}
      <div className="overflow-hidden rounded-3xl border border-ink-200/70 bg-white dark:border-ink-800 dark:bg-ink-900">
        {/* Gradient cover */}
        <div className="relative h-32 bg-gradient-to-br from-brand-600 via-brand-600 to-brand-700">
          <Link
            to="/profile/edit"
            className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/20 px-3 py-1.5 text-[12px] font-extrabold text-white backdrop-blur hover:bg-white/30"
          >
            <Pencil size={12} />
            Edit
          </Link>
        </div>

        <div className="-mt-12 flex flex-col items-center px-5 pb-5">
          <div className="relative">
            <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-brand-600 shadow-lg dark:border-ink-900">
              {avatar ? (
                <img src={avatar} alt={user.full_name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-2xl font-black text-white">
                  {initials(user.full_name)}
                </div>
              )}
            </div>
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-brand-50 px-2.5 py-1 text-[9.5px] font-black uppercase tracking-widest text-brand-600 shadow dark:bg-brand-600/20">
              {user.role}
            </span>
          </div>

          <h1 className="mt-4 text-xl font-black tracking-tight">
            {user.full_name}
          </h1>
          <p className="text-[13px] font-semibold text-ink-500">@{user.username}</p>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[12px] text-ink-400">
            {user.email && (
              <span className="flex items-center gap-1.5">
                <Mail size={11} />
                {user.email}
              </span>
            )}
            {user.phone && (
              <span className="flex items-center gap-1.5">
                <Phone size={11} />
                {user.phone}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Sections */}
      {sections.map((section, i) => (
        <div key={i} className="mt-6">
          <p className="mb-2 pl-2 text-[10.5px] font-extrabold uppercase tracking-widest text-ink-400">
            {section.title}
          </p>
          <div className="overflow-hidden rounded-2xl border border-ink-200/70 bg-white dark:border-ink-800 dark:bg-ink-900">
            {section.items.map((item, idx) => {
              const Icon = item.icon;
              const last = idx === section.items.length - 1;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={
                    "flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-ink-50 dark:hover:bg-ink-800/50 " +
                    (!last ? "border-b border-ink-100 dark:border-ink-800" : "")
                  }
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-600/10">
                    <Icon size={16} />
                  </span>
                  <span className="flex-1 text-[14px] font-bold">
                    {item.label}
                  </span>
                  <ChevronRight size={16} className="text-ink-300" />
                </Link>
              );
            })}
          </div>
        </div>
      ))}

      <button
        onClick={handleLogout}
        className="mt-8 flex h-14 w-full items-center justify-center gap-2 rounded-full border-2 border-danger-500/50 text-[14.5px] font-extrabold text-danger-500 transition-colors hover:bg-danger-500/10"
      >
        <LogOut size={16} />
        Log out
      </button>

      <p className="mt-6 text-center text-[11px] font-medium text-ink-400">
        umucuruzi · v1.0.0
      </p>
    </div>
  );
}