import {
  QrCode, Info, MessageCircle, Phone, Mail, Clock, User, ArrowRight,
} from "lucide-react";
import { useAuthStore } from "../../store/auth";

const SUPPORT_PHONE_DISPLAY = "+250 796 310 037";
const SUPPORT_PHONE_RAW = "+250796310037";
const SUPPORT_WHATSAPP = "250796310037";
const SUPPORT_EMAIL = "tjimmyfrank@gmail.com";

export default function QRCodeScreen() {
  const { user } = useAuthStore();

  const whatsapp = () => {
    const msg = `Hello Umucuruzi support! 👋\n\nI would like to request my shop QR code.\n\nMy details:\n• Name: ${user?.full_name || ""}`;
    window.open(`https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(msg)}`, "_blank");
  };
  const call = () => (window.location.href = `tel:${SUPPORT_PHONE_RAW}`);
  const email = () => {
    const sub = `QR Code Request — ${user?.full_name || "Trader"}`;
    const body =
      `Hello Umucuruzi team,\n\nI would like to request my shop QR code.\n\n` +
      `Name: ${user?.full_name || ""}\nUsername: @${user?.username || ""}\n` +
      `Phone: ${user?.phone || ""}\nEmail: ${user?.email || ""}`;
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(sub)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Hero */}
      <div className="flex flex-col items-center py-4 text-center">
        <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-600 to-brand-700 text-white shadow-brand">
          <QrCode size={56} />
        </div>
        <h1 className="mt-6 text-2xl font-black tracking-tight">
          Get your shop QR code
        </h1>
        <p className="mt-2 max-w-md text-[13.5px] leading-relaxed text-ink-500">
          We generate your personal QR code so you can share it with customers.
          Contact support to receive it right away.
        </p>
      </div>

      {/* How it works */}
      <div className="rounded-2xl border border-ink-200/70 bg-white p-5 dark:border-ink-800 dark:bg-ink-900">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-600/10">
            <Info size={15} />
          </span>
          <h2 className="text-[14px] font-black">How it works</h2>
        </div>

        {[
          "Contact Umucuruzi support using one of the options below.",
          "We generate your unique QR code within a few minutes.",
          "You receive it via WhatsApp or email — share it with customers.",
        ].map((text, i) => (
          <div key={i} className="mb-3 flex items-start gap-3 last:mb-0">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-[11px] font-black text-brand-600 dark:bg-brand-600/10">
              {i + 1}
            </span>
            <p className="text-[13px] leading-relaxed text-ink-600 dark:text-ink-400">
              {text}
            </p>
          </div>
        ))}
      </div>

      {/* Contact */}
      <div>
        <p className="mb-3 pl-1 text-[10px] font-extrabold uppercase tracking-widest text-ink-400">
          Contact support
        </p>

        <button
          onClick={whatsapp}
          className="flex w-full items-center gap-4 rounded-2xl bg-gradient-to-r from-[#25D366] to-[#128C7E] p-5 text-left text-white shadow-lg transition-transform hover:-translate-y-0.5"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/25 backdrop-blur">
            <MessageCircle size={22} />
          </span>
          <div className="flex-1">
            <p className="text-[15px] font-black">Chat on WhatsApp</p>
            <p className="text-[12.5px] font-semibold text-white/85">
              {SUPPORT_PHONE_DISPLAY}
            </p>
          </div>
          <ArrowRight size={20} />
        </button>

        <div className="mt-3 space-y-2">
          <ContactRow icon={Phone} color="text-sky-600 bg-sky-500/15" title="Call support"  sub={SUPPORT_PHONE_DISPLAY} onClick={call} />
          <ContactRow icon={Mail}  color="text-violet-600 bg-violet-500/15" title="Send an email" sub={SUPPORT_EMAIL} onClick={email} />
        </div>
      </div>

      {/* Your details */}
      {user && (
        <div className="rounded-2xl border border-ink-200/70 bg-white p-5 dark:border-ink-800 dark:bg-ink-900">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600">
              <User size={15} />
            </span>
            <h2 className="text-[14px] font-black">Your trader details</h2>
          </div>
          <p className="mb-4 text-[11.5px] italic text-ink-400">
            Mention these when contacting us so we can find you faster:
          </p>
          <Detail label="Name"     value={user.full_name || "—"} />
          <Detail label="Username" value={`@${user.username || "—"}`} />
          <Detail label="Phone"    value={user.phone || "—"} last />
        </div>
      )}

      <p className="flex items-start gap-2 pl-1 text-[11.5px] leading-relaxed text-ink-400">
        <Clock size={13} className="mt-0.5 shrink-0" />
        Support hours: Mon–Sat, 8:00 AM – 8:00 PM (CAT). We typically respond
        within 30 minutes.
      </p>
    </div>
  );
}

function ContactRow({ icon: Icon, color, title, sub, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl border border-ink-200/70 bg-white p-4 text-left transition-all hover:border-brand-600 dark:border-ink-800 dark:bg-ink-900"
    >
      <span className={"flex h-11 w-11 items-center justify-center rounded-xl " + color}>
        <Icon size={19} />
      </span>
      <div className="flex-1">
        <p className="text-[14px] font-extrabold">{title}</p>
        <p className="truncate text-[12.5px] text-ink-500">{sub}</p>
      </div>
      <ArrowRight size={16} className="text-ink-300" />
    </button>
  );
}

function Detail({ label, value, last }) {
  return (
    <div className={"flex items-center justify-between py-2.5 " + (!last ? "border-b border-ink-100 dark:border-ink-800" : "")}>
      <span className="text-[10px] font-extrabold uppercase tracking-widest text-ink-400">
        {label}
      </span>
      <span className="text-[13.5px] font-bold text-ink-900 dark:text-ink-100">
        {value}
      </span>
    </div>
  );
}