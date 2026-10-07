import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus, Pencil, Trash2, Package, AlertTriangle, CheckCircle2, XCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { productService } from "../../services/product";
import { getFullImageUrl, extractFirstImage } from "../../lib/image";

const fmtPrice = (n) => Number(n || 0).toLocaleString("en-US");

export default function Products() {
  const nav = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const res = await productService.getTraderProducts();
      setProducts(res || []);
    } catch {
      toast.error("Could not load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await productService.deleteProduct(id);
      toast.success("Product deleted");
      fetchProducts();
    } catch {
      toast.error("Could not delete product");
    }
  };

  const inStock = products.filter((p) => Number(p.stock_quantity ?? 0) > 0).length;
  const outOfStock = products.length - inStock;
  const lowStock = products.filter((p) => {
    const s = Number(p.stock_quantity ?? 0);
    return s > 0 && s <= 5;
  }).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight">My Products</h1>
          <p className="mt-1 text-[12.5px] text-ink-500">
            {products.length} product{products.length === 1 ? "" : "s"} listed
            {outOfStock > 0 ? ` · ${outOfStock} out of stock` : ""}
          </p>
        </div>
        <Link
          to="/dashboard/add-product"
          className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-5 py-2.5 text-[13px] font-extrabold text-white shadow-brand hover:bg-brand-700"
        >
          <Plus size={16} />
          Add product
        </Link>
      </div>

      {/* Stats strip */}
      {products.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Pill icon={CheckCircle2} color="emerald" label={`${inStock} in stock`} />
          {lowStock > 0 && <Pill icon={AlertTriangle} color="amber" label={`${lowStock} low stock`} />}
          {outOfStock > 0 && <Pill icon={XCircle} color="danger" label={`${outOfStock} out of stock`} />}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-ink-200 border-t-brand-600" />
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-200 bg-white py-20 text-center dark:border-ink-800 dark:bg-ink-900">
          <Package size={44} className="mx-auto text-ink-300" />
          <p className="mt-4 text-lg font-black">No products yet</p>
          <p className="mt-1 text-[13px] text-ink-500">
            Add your first product to start selling.
          </p>
          <Link
            to="/dashboard/add-product"
            className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-5 py-2.5 text-[13px] font-extrabold text-white shadow-brand hover:bg-brand-700"
          >
            <Plus size={15} />
            Add product
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((p) => {
            const img = getFullImageUrl(extractFirstImage(p.images));
            const stock = Number(p.stock_quantity ?? 0);
            const isOut = stock <= 0;
            const isLow = stock > 0 && stock <= 5;
            return (
              <div
                key={p.id}
                className="flex items-center gap-4 rounded-2xl border border-ink-200/70 bg-white p-3 dark:border-ink-800 dark:bg-ink-900"
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-ink-100 dark:bg-ink-800">
                  {img ? (
                    <img src={img} alt={p.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-ink-300">
                      <Package size={22} />
                    </div>
                  )}
                  {isOut && (
                    <span className="absolute bottom-1 left-1 rounded bg-danger-500 px-1 py-0.5 text-[8.5px] font-black uppercase tracking-wide text-white">
                      Out
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-[13.5px] font-bold leading-snug">
                    {p.name}
                  </p>
                  <p className="mt-1 text-[14.5px] font-black text-brand-600">
                    {fmtPrice(p.price)}{" "}
                    <span className="text-[10px] font-bold">RWF</span>
                  </p>
                  <div className="mt-1.5 flex items-center gap-2 text-[10.5px]">
                    <span
                      className={
                        "h-1.5 w-1.5 rounded-full " +
                        (isOut ? "bg-danger-500" : isLow ? "bg-amber-500" : "bg-emerald-500")
                      }
                    />
                    <span className="font-semibold text-ink-500">
                      {isOut
                        ? "Out of stock"
                        : isLow
                        ? `Low · ${stock} left`
                        : `${stock} in stock`}
                    </span>
                    {p.Category?.name && (
                      <>
                        <span className="text-ink-300">•</span>
                        <span className="text-ink-500">{p.Category.name}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => nav(`/dashboard/edit-product/${p.id}`)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-ink-200 bg-ink-50 text-brand-600 hover:border-brand-600 dark:border-ink-800 dark:bg-ink-800"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id, p.name)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-ink-200 bg-ink-50 text-danger-500 hover:border-danger-500 dark:border-ink-800 dark:bg-ink-800"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Pill({ icon: Icon, color, label }) {
  const palette = {
    emerald: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
    amber:   "bg-amber-500/15 text-amber-600 border-amber-500/30",
    danger:  "bg-danger-500/15 text-danger-500 border-danger-500/30",
  };
  return (
    <span
      className={
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11.5px] font-extrabold " +
        palette[color]
      }
    >
      <Icon size={12} />
      {label}
    </span>
  );
}