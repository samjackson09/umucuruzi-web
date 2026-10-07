import { useEffect, useState } from "react";
import { Plus, Trash2, Save, Tag, Scale, Coins, ListOrdered } from "lucide-react";
import { toast } from "sonner";
import { priceTableService } from "../../services/priceTable";

const fmtPrice = (n) => Number(n || 0).toLocaleString("en-US");

export default function PriceTable() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newItem, setNewItem] = useState({ product_name: "", unit: "", price: "" });

  const load = async () => {
    try {
      setItems((await priceTableService.getPriceTable()) || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!newItem.product_name || !newItem.price) {
      return toast.error("Product name and price are required");
    }
    setSaving(true);
    try {
      await priceTableService.addPriceTableItem({
        product_name: newItem.product_name,
        unit: newItem.unit,
        price: parseFloat(newItem.price),
      });
      setNewItem({ product_name: "", unit: "", price: "" });
      load();
      toast.success("Item added");
    } catch {
      toast.error("Could not add item");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this item?")) return;
    await priceTableService.deletePriceTableItem(id);
    load();
    toast.success("Deleted");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <h1 className="text-2xl font-black tracking-tight">Price Table</h1>
        <p className="mt-1 text-[12.5px] text-ink-500">
          {items.length} {items.length === 1 ? "item" : "items"} listed
        </p>
      </header>

      {/* Add form */}
      <div className="rounded-2xl border border-ink-200/70 bg-white p-5 dark:border-ink-800 dark:bg-ink-900">
        <h2 className="mb-4 flex items-center gap-2 text-[14px] font-black">
          <Plus size={16} className="text-brand-600" />
          Add new item
        </h2>

        <div className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr]">
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-[10.5px] font-extrabold uppercase tracking-wider text-ink-500">
              <Tag size={11} className="text-brand-600" />
              Product name *
            </label>
            <input
              value={newItem.product_name}
              onChange={(e) => setNewItem({ ...newItem, product_name: e.target.value })}
              placeholder="e.g. Maize flour"
              className={inputCls}
            />
          </div>
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-[10.5px] font-extrabold uppercase tracking-wider text-ink-500">
              <Scale size={11} className="text-brand-600" />
              Unit
            </label>
            <input
              value={newItem.unit}
              onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
              placeholder="kg, piece…"
              className={inputCls}
            />
          </div>
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-[10.5px] font-extrabold uppercase tracking-wider text-ink-500">
              <Coins size={11} className="text-brand-600" />
              Price *
            </label>
            <input
              value={newItem.price}
              onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
              placeholder="0"
              inputMode="numeric"
              className={inputCls}
            />
          </div>
        </div>

        <button
          onClick={add}
          disabled={saving}
          className="mt-4 inline-flex h-11 items-center gap-2 rounded-full bg-brand-600 px-5 text-[13px] font-extrabold text-white shadow-brand hover:bg-brand-700 disabled:opacity-70"
        >
          <Save size={15} />
          {saving ? "Adding…" : "Add to price table"}
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-ink-200/70 bg-white dark:border-ink-800 dark:bg-ink-900">
        <div className="grid grid-cols-[2fr_1fr_1.2fr_40px] gap-3 border-b border-ink-100 bg-ink-50 px-4 py-2.5 text-[10px] font-extrabold uppercase tracking-wider text-ink-500 dark:border-ink-800 dark:bg-ink-800/50">
          <span>Item</span>
          <span className="text-center">Unit</span>
          <span className="text-right">Price</span>
          <span />
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-7 w-7 animate-spin rounded-full border-4 border-ink-200 border-t-brand-600" />
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center">
            <ListOrdered size={40} className="mx-auto text-ink-300" />
            <p className="mt-3 text-[13.5px] font-bold">No items yet</p>
            <p className="mt-1 text-[12.5px] text-ink-500">
              Add your first item above.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-ink-100 dark:divide-ink-800">
            {items.map((it) => (
              <div
                key={it.id}
                className="grid grid-cols-[2fr_1fr_1.2fr_40px] items-center gap-3 px-4 py-3"
              >
                <p className="text-[13px] font-semibold">{it.product_name}</p>
                <p className="text-center text-[12px] text-ink-500">
                  {it.unit || "—"}
                </p>
                <p className="text-right text-[13px] font-black text-brand-600">
                  {fmtPrice(it.price)}{" "}
                  <span className="text-[10px] font-bold">RWF</span>
                </p>
                <button
                  onClick={() => remove(it.id)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-danger-500 hover:bg-danger-500/10"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-ink-200 bg-ink-50 px-3.5 py-2.5 text-[13.5px] font-medium outline-none focus:border-brand-600 focus:bg-white dark:border-ink-700 dark:bg-ink-900";