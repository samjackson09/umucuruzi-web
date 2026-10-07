import { Link } from "react-router-dom";
import {
  Mail, Phone, MapPin, Send, ArrowUpRight,
  Globe, MessageCircle, Share2, Users,
} from "lucide-react";

import homelogo from "../../assets/homelogo.png";

/* ═══════════════════════════════════════════════════════
   CONTACT
   ═══════════════════════════════════════════════════════ */
const CONTACT = {
  email: "hello@umucuruzi.rw",
  phone: "+250 782 369 067",        // display
  phoneRaw: "+250782369067",        // tel: link
  whatsapp: "250782369067",         // wa.me (no + / spaces / leading 0)
  address: "KG 11 Ave, Kigali, Rwanda",
};

const TAGLINE = "Buy & sell with trust — across Rwanda.";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-ink-200/70 bg-white dark:border-ink-800 dark:bg-ink-950">
      {/* ═══ CTA strip ═══ */}
      <div className="border-b border-ink-100 dark:border-ink-800">
        <div className="container-app flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-[17px] font-black tracking-tight text-ink-900 dark:text-ink-100">
              Start selling on umucuruzi today
            </h3>
            <p className="mt-1 text-[13px] text-ink-500 dark:text-ink-400">
              Reach thousands of customers in Rwanda — free to list.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/auth/signup"
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-5 py-2.5 text-[13px] font-extrabold text-white shadow-brand hover:bg-brand-700"
            >
              Create account
              <ArrowUpRight size={14} />
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink-200 px-5 py-2.5 text-[13px] font-extrabold text-ink-700 hover:border-brand-600 hover:text-brand-600 dark:border-ink-800 dark:text-ink-200"
            >
              Learn more
            </Link>
          </div>
        </div>
      </div>

      {/* ═══ Main grid ═══ */}
      <div className="container-app grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-12">
        {/* ── Brand column ── */}
        <div className="lg:col-span-4">
          <Link to="/" className="flex items-center gap-2">
            <img
              src={homelogo}
              alt="umucuruzi"
              className="h-11 w-auto object-contain"
            />
            <span className="text-xl font-black tracking-tight text-brand-600">
              umucuruzi
            </span>
          </Link>

          <p className="mt-4 max-w-sm text-[13.5px] font-medium leading-relaxed text-ink-500 dark:text-ink-400">
            {TAGLINE} Discover local traders, negotiate directly, and enjoy
            fast, reliable delivery — all in one place.
          </p>

          {/* Socials */}
          <div className="mt-6 flex gap-2">
            <Social
              icon={Globe}
              href="https://umucuruzi.rw"
              label="Website"
            />
            <Social
              icon={MessageCircle}
              href={`https://wa.me/${CONTACT.whatsapp}`}
              label="WhatsApp"
            />
            <Social
              icon={Share2}
              href="https://twitter.com"
              label="Share"
            />
            <Social
              icon={Users}
              href="https://facebook.com"
              label="Community"
            />
          </div>
        </div>

        {/* ── Marketplace ── */}
        <FooterCol title="Marketplace" className="lg:col-span-2">
          <FooterLink to="/">Home</FooterLink>
          <FooterLink to="/search">Browse products</FooterLink>
          <FooterLink to="/traders">All traders</FooterLink>
          <FooterLink to="/markets">Markets</FooterLink>
        </FooterCol>

        {/* ── For sellers ── */}
        <FooterCol title="For sellers" className="lg:col-span-2">
          <FooterLink to="/auth/signup">Become a trader</FooterLink>
          <FooterLink to="/dashboard">Trader dashboard</FooterLink>
          <FooterLink to="/about">How it works</FooterLink>
          <FooterLink to="/about">Pricing</FooterLink>
        </FooterCol>

        {/* ── Support ── */}
        <FooterCol title="Support" className="lg:col-span-2">
          <FooterLink to="/about">Help center</FooterLink>
          <FooterLink to="/profile">My account</FooterLink>
          <FooterLink to="/orders">Track an order</FooterLink>
          <FooterLink to="/about">Return policy</FooterLink>
        </FooterCol>

        {/* ── Contact ── */}
        <div className="lg:col-span-2">
          <h4 className="mb-4 text-[11px] font-extrabold uppercase tracking-widest text-ink-500 dark:text-ink-400">
            Contact us
          </h4>

          <ul className="space-y-3">
            <ContactRow icon={Mail} label="Email">
              <a
                href={`mailto:${CONTACT.email}`}
                className="text-[12.5px] font-semibold text-ink-700 hover:text-brand-600 dark:text-ink-200"
              >
                {CONTACT.email}
              </a>
            </ContactRow>

            <ContactRow icon={Phone} label="Phone">
              <a
                href={`tel:${CONTACT.phoneRaw}`}
                className="text-[12.5px] font-semibold text-ink-700 hover:text-brand-600 dark:text-ink-200"
              >
                {CONTACT.phone}
              </a>
            </ContactRow>

            <ContactRow icon={Send} label="WhatsApp">
              <a
                href={`https://wa.me/${CONTACT.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="text-[12.5px] font-semibold text-ink-700 hover:text-brand-600 dark:text-ink-200"
              >
                Chat with us
              </a>
            </ContactRow>

            <ContactRow icon={MapPin} label="Location">
              <span className="text-[12.5px] font-semibold text-ink-700 dark:text-ink-200">
                {CONTACT.address}
              </span>
            </ContactRow>
          </ul>
        </div>
      </div>

      {/* ═══ Bottom strip ═══ */}
      <div className="border-t border-ink-100 dark:border-ink-800">
        <div className="container-app flex flex-col items-center gap-3 py-5 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="text-[11.5px] font-medium text-ink-400">
            © {year} umucuruzi. All rights reserved. Made in Rwanda 🇷🇼
          </p>

          <div className="flex flex-wrap items-center justify-center gap-5">
            <Link
              to="/privacy"
              className="text-[11.5px] font-bold text-ink-500 hover:text-brand-600 dark:text-ink-400"
            >
              Privacy
            </Link>
            <Link
              to="/terms"
              className="text-[11.5px] font-bold text-ink-500 hover:text-brand-600 dark:text-ink-400"
            >
              Terms
            </Link>
            <a
              href="https://umucuruziprivacypolicy.site.je"
              target="_blank"
              rel="noreferrer"
              className="text-[11.5px] font-bold text-ink-500 hover:text-brand-600 dark:text-ink-400"
            >
              Privacy policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════
   Small helper components
   ═══════════════════════════════════════════════════════ */

function FooterCol({ title, children, className = "" }) {
  return (
    <div className={className}>
      <h4 className="mb-4 text-[11px] font-extrabold uppercase tracking-widest text-ink-500 dark:text-ink-400">
        {title}
      </h4>
      <ul className="space-y-2.5">{children}</ul>
    </div>
  );
}

function FooterLink({ to, children }) {
  return (
    <li>
      <Link
        to={to}
        className="text-[12.5px] font-medium text-ink-600 transition-colors hover:text-brand-600 dark:text-ink-300"
      >
        {children}
      </Link>
    </li>
  );
}

function ContactRow({ icon: Icon, label, children }) {
  return (
    <li className="flex items-start gap-2.5">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-600/10">
        <Icon size={13} />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-ink-400">
          {label}
        </p>
        <div className="mt-0.5">{children}</div>
      </div>
    </li>
  );
}

function Social({ icon: Icon, href, label }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-100 text-ink-600 transition-colors hover:bg-brand-600 hover:text-white dark:bg-ink-900 dark:text-ink-300 dark:hover:bg-brand-600"
    >
      <Icon size={15} />
    </a>
  );
}