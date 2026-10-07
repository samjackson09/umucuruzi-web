import { useEffect, useMemo, useState } from "react";
import {
  Plus, Ticket, Pause, Play, Trash2, Send, X, Calendar, Percent,
  Coins, Loader2, CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { promoService } from "../../services/promo";

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

const daysBetween = (a, b) =>
  Math.max(0, Math.ceil((new Date(b) - new Date(a)) / 86400000));

const getStatus = (p) => {
  const now = Date.now();
  const start = new Date(p.start_date).getTime();
  const end = new Date(p.end_date).getTime();
  if (!p.is_active) return { label: "DISABLED", color: "text-ink-400", bg: "bg-ink-400/15" };
  if (now < start) return { label: "SCHEDULED", color: "text-sky-600", bg: "bg-sky-500/15" };
  if (now > end) return { label: "EXPIRED", color: "text-danger-500", bg: "bg-danger-500/15" };
  if (p.usage_limit && p.used_count >= p.usage_limit)
    return { label: "USED UP", color: "text-amber-600", bg: "bg-amber-500/15" };
  return { label: "ACTIVE", color: "text-emerald-600", bg: "bg-emerald-500/15" };
};

export default function PromoCodes() {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [sending, setSending] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    code: "",
    discount_type: "percentage",
    discount_value: "",
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date(Date.now() + 7 * 864e5).toISOString().split("T")[0],
    usage_limit: "",
    description: "",
  });

  const load = async () => {
    try {
      setCodes((await promoService.getMyPromoCodes()) || []);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const summary = useMemo(() => {
    const active = codes.filter((c) => getStatus(c).label === "ACTIVE").length;
    const uses = codes.reduce((s, c) => s + (c.used_count || 0), 0);
    return { total: codes.length, active, uses };
  }, [codes]);

  const create = async () => {
    if (!form.code || !form.discount_value) {
      return toast.error("Code and discount value are required");
    }
    setSubmitting(true);
    try {
      await promoService.createPromoCode({
        ...form,
        discount_value: parseFloat(form.discount_value),
        usage_limit: form.usage_limit ? parseInt(form.usage_limit) : null,
      });
      toast.success("Promo code created");
      setModal(false);
      setForm({ ...form, code: "", discount_value: "", usage_limit: "", description: "" });
      load();
    } catch (e) {
      toast.error(e?.response?.data?.error || "Could not create code");
    } finally {
      setSubmitting(false);
    }
  };

  const toggle = async (id) => {
    await promoService.togglePromoCode(id);
    load();
  };

  const remove = async (id) => {
    if (!confirm("Delete this promo code?")) return;
    await promoService.deletePromoCode(id);
    load();
    toast.success("Deleted");
  };

  const sendLoyal = async (id) => {
    setSending(id);
    try {
      const res = await promoService.sendToLoyalCustomers(id);
      toast.success(res.message || `Sent to ${res.sentTo || 0} customers`);
    } catch (e) {
      toast.error(e?.response?.data?.error || "Could not send");
    } finally {
      setSending(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Promo Codes</h1>
          <p className="mt-1 text-[12.5px] text-ink-500">
            {summary.total} code{summary.total === 1 ? "" : "s"} · {summary.active} active
          </p>
        </div>
        <button
          onClick={() => setModal(true)}
          className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-5 py-2.5 text-[13px] font-extrabold text-white shadow-brand hover:bg-brand-700"
        >
          <Plus size={16} />
          New code
        </button>
      </div>

      {/* Summary */}
      {codes.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <Summary label="Total"  value={summary.total}  icon={Ticket}   color="text-sky-600 bg-sky-500/15" />
          <Summary label="Active" value={summary.active} icon={CheckCircle2} color="text-emerald-600 bg-emerald-500/15" />
          <Summary label="Uses"   value={summary.uses}   icon={Send}     color="text-amber-600 bg-amber-500/15" />
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-ink-200 border-t-brand-600" />
        </div>
      ) : codes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-200 bg-white py-20 text-center dark:border-ink-800 dark:bg-ink-900">
          <Ticket size={44} className="mx-auto text-ink-300" />
          <p className="mt-4 text-lg font-black">No promo codes yet</p>
          <p className="mt-1 text-[13px] text-ink-500">
            Create your first promo code to reward customers.
          </p>
          <button
            onClick={() => setModal(true)}
            className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-5 py-2.5 text-[13px] font-extrabold text-white shadow-brand hover:bg-brand-700"
          >
            <Plus size={15} />
            Create promo code
          </button>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {codes.map((p) => {
            const st = getStatus(p);
            const daysLeft = daysBetween(new Date(), p.end_date);
            const usagePct =
              p.usage_limit > 0 ? Math.min(100, (p.used_count / p.usage_limit) * 100) : 0;

            return (
              <div
                key={p.id}
                className="rounded-2xl border border-ink-200/70 bg-white p-5 dark:border-ink-800 dark:bg-ink-900"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-600/10">
                      <Ticket size={18} />
                    </span>
                    <div>
                      <p className="text-[16px] font-black tracking-wider">{p.code}</p>
                      <p className="text-[10px] font-extrabold uppercase tracking-widest text-ink-400">
                        Promo code
                      </p>
                    </div>
                  </div>
                  <span className={"rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider " + st.bg + " " + st.color}>
                    {st.label}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-ink-50 p-3 dark:bg-ink-800/50">
                  <div>
                    <p className="text-[9.5px] font-extrabold uppercase tracking-wider text-ink-400">Discount</p>
                    <p className="mt-1 text-[15px] font-black text-brand-600">
                      {p.discount_type === "percentage"
                        ? `${p.discount_value}%`
                        : `${Number(p.discount_value).toLocaleString()} RWF`}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9.5px] font-extrabold uppercase tracking-wider text-ink-400">Used</p>
                    <p className="mt-1 text-[15px] font-black">
                      {p.used_count || 0}
                      <span className="text-[11px] text-ink-400">/{p.usage_limit || "∞"}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-[9.5px] font-extrabold uppercase tracking-wider text-ink-400">
                      {daysLeft > 0 ? "Ends in" : "Ended"}
                    </p>
                    <p className={"mt-1 text-[15px] font-black " + (daysLeft <= 2 && daysLeft > 0 ? "text-amber-600" : "")}>
                      {daysLeft} <span className="text-[11px] text-ink-400">days</span>
                    </p>
                  </div>
                </div>

                {p.usage_limit ? (
                  <div className="mt-3 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
                      <div
                        className={"h-full rounded-full " + (usagePct >= 100 ? "bg-danger-500" : "bg-brand-600")}
                        style={{ width: `${usagePct}%` }}
                      />
                    </div>
                    <span className="text-[10.5px] font-bold text-ink-400">
                      {Math.round(usagePct)}% used
                    </span>
                  </div>
                ) : null}

                <div className="mt-3 flex items-center gap-1.5 text-[11.5px] text-ink-500">
                  <Calendar size={12} />
                  {fmtDate(p.start_date)} → {fmtDate(p.end_date)}
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => sendLoyal(p.id)}
                    disabled={sending === p.id}
                    className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-brand-600 text-[12.5px] font-extrabold text-white shadow-brand hover:bg-brand-700 disabled:opacity-70"
                  >
                    {sending === p.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <>
                        <Send size={13} />
                        Send to loyal
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => toggle(p.id)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-ink-200 text-ink-500 hover:border-brand-600 hover:text-brand-600 dark:border-ink-800"
                  >
                    {p.is_active ? <Pause size={15} /> : <Play size={15} />}
                  </button>
                  <button
                    onClick={() => remove(p.id)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-ink-200 text-danger-500 hover:border-danger-500 dark:border-ink-800"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-6">
          <div
            onClick={(e) => e.target === e.currentTarget && setModal(false)}
            className="absolute inset-0"
          />
          <div className="relative z-10 w-full max-w-lg rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl dark:bg-ink-900">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-black">New promo code</h2>
                <p className="mt-1 text-[12.5px] text-ink-500">
                  Set up a discount for your customers
                </p>
              </div>
              <button
                onClick={() => setModal(false)}
                className="rounded-full p-2 text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={labelCls}>Code *</label>
                <input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. SUMMER20"
                  className={inputCls + " font-mono tracking-wider"}
                />
              </div>

              <div>
                <label className={labelCls}>Discount type *</label>
                <div className="grid grid-cols-2 gap-2">
                  <TypeBtn
                    active={form.discount_type === "percentage"}
                    onClick={() => setForm({ ...form, discount_type: "percentage" })}
                    icon={Percent}
                    label="Percentage"
                  />
                  <TypeBtn
                    active={form.discount_type === "fixed"}
                    onClick={() => setForm({ ...form, discount_type: "fixed" })}
                    icon={Coins}
                    label="Fixed (RWF)"
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Discount value *</label>
                <input
                  value={form.discount_value}
                  onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
                  placeholder={form.discount_type === "percentage" ? "15" : "2000"}
                  inputMode="numeric"
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Start date *</label>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>End date *</label>
                  <input
                    type="date"
                    value={form.end_date}
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Usage limit</label>
                <input
                  value={form.usage_limit}
                  onChange={(e) => setForm({ ...form, usage_limit: e.target.value })}
                  placeholder="Leave empty for unlimited"
                  inputMode="numeric"
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Optional note about this promo"
                  className={inputCls + " resize-none"}
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3 border-t border-ink-100 pt-5 dark:border-ink-800">
              <button
                onClick={() => setModal(false)}
                className="h-12 flex-1 rounded-full border-2 border-ink-200 text-[14px] font-extrabold text-ink-700 hover:border-brand-600 dark:border-ink-800 dark:text-ink-200"
              >
                Cancel
              </button>
              <button
                onClick={create}
                disabled={submitting}
                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-brand-600 text-[14px] font-extrabold text-white shadow-brand hover:bg-brand-700 disabled:opacity-70"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : "Create code"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const labelCls =
  "mb-1.5 block text-[10.5px] font-extrabold uppercase tracking-wider text-ink-500";
const inputCls =
  "w-full rounded-xl border border-ink-200 bg-ink-50 px-4 py-3 text-[14px] font-medium outline-none focus:border-brand-600 focus:bg-white dark:border-ink-700 dark:bg-ink-900";

function Summary({ label, value, icon: Icon, color }) {
  return (
    <div className="rounded-2xl border border-ink-200/70 bg-white p-4 dark:border-ink-800 dark:bg-ink-900">
      <span className={"mb-2 flex h-8 w-8 items-center justify-center rounded-lg " + color}>
        <Icon size={15} />
      </span>
      <p className="text-xl font-black">{value}</p>
      <p className="text-[10.5px] font-bold uppercase tracking-wider text-ink-400">
        {label}
      </p>
    </div>
  );
}

function TypeBtn({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={
        "flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-[12.5px] font-extrabold transition-colors " +
        (active
          ? "border-brand-600 bg-brand-600 text-white"
          : "border-ink-200 bg-ink-50 text-ink-700 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-200")
      }
    >
      <Icon size={14} />
      {label}
    </button>
  );
}