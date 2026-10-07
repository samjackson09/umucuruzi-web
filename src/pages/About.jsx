import { Store, ShieldCheck, Truck, Sparkles, Users, Heart } from "lucide-react";

export default function About() {
  return (
    <div className="container-app py-10">
      <div className="mx-auto max-w-3xl text-center">
        <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-brand">
          <Store size={28} />
        </span>
        <h1 className="text-3xl font-black tracking-tight">About umucuruzi</h1>
        <p className="mt-3 text-ink-500">
          The marketplace connecting Rwandan traders with customers everywhere.
        </p>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Feature icon={ShieldCheck} title="Verified traders" text="Every shop is verified." />
        <Feature icon={Truck} title="Fast delivery" text="Reliable agents." />
        <Feature icon={Sparkles} title="Loyalty rewards" text="Earn points." />
        <Feature icon={Heart} title="Local culture" text="Preserve negotiation." />
      </div>
    </div>
  );
}

function Feature({ icon: Icon, title, text }) {
  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-900">
      <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-600/10">
        <Icon size={18} />
      </span>
      <h3 className="font-extrabold">{title}</h3>
      <p className="mt-1 text-sm text-ink-500">{text}</p>
    </div>
  );
}