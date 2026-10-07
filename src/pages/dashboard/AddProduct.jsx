import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft, Image as ImageIcon, Tag, FileText, Coins, Layers,
  Grid, X, Camera, CheckCircle2, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { categoryService } from "../../services/category";
import { productService } from "../../services/product";

export default function AddProduct() {
  const nav = useNavigate();
  const fileRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]); // [{ file, url }]
  const [form, setForm] = useState({
    name: "", description: "", price: "", category_id: "", stock_quantity: "",
  });

  useEffect(() => {
    categoryService.getCategories().then(setCategories).catch(() => {});
  }, []);

  const selectedCat = categories.find((c) => String(c.id) === String(form.category_id))?.name;

  const pickImages = (e) => {
    const files = Array.from(e.target.files || []);
    const next = files
      .slice(0, 5 - images.length)
      .map((file) => ({ file, url: URL.createObjectURL(file) }));
    setImages((prev) => [...prev, ...next]);
    e.target.value = "";
  };

  const removeImage = (i) => {
    setImages((prev) => prev.filter((_, idx) => idx !== i));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) return toast.error("Name and price are required");
    if (images.length === 0) return toast.error("Add at least one image");

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("description", form.description || "");
      fd.append("price", form.price);
      fd.append("category_id", form.category_id || "");
      fd.append("stock_quantity", form.stock_quantity || "0");
      images.forEach((i) => fd.append("images", i.file));

      await productService.createProduct(fd);
      toast.success("Product added");
      nav("/dashboard/products");
    } catch (err) {
      toast.error(err?.response?.data?.error || err?.message || "Could not add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => nav("/dashboard/products")}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-ink-200 bg-white text-ink-600 hover:border-brand-600 dark:border-ink-800 dark:bg-ink-900"
        >
          <ChevronLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-black tracking-tight">Add New Product</h1>
          <p className="mt-0.5 text-[12.5px] text-ink-500">
            Fill in the details to list your product
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <Field label="Product name" icon={Tag} required>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Fresh Tomatoes 1kg"
            className={inputCls}
          />
        </Field>

        <Field label="Description" icon={FileText}>
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Describe quality, size, origin…"
            className={inputCls + " min-h-[110px] resize-none py-3"}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Price" icon={Coins} required>
            <div className="relative">
              <input
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="0"
                inputMode="numeric"
                className={inputCls + " pr-16"}
              />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[11.5px] font-bold text-ink-400">
                RWF
              </span>
            </div>
          </Field>

          <Field label="Stock quantity" icon={Layers}>
            <input
              value={form.stock_quantity}
              onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })}
              placeholder="0"
              inputMode="numeric"
              className={inputCls}
            />
          </Field>
        </div>

        <Field label="Category" icon={Grid}>
          <select
            value={form.category_id}
            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
            className={inputCls + " cursor-pointer"}
          >
            <option value="">Choose a category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label={`Product images (${images.length}/5)`} icon={ImageIcon}>
          <div className="flex flex-wrap gap-3">
            {images.map((img, i) => (
              <div key={i} className="relative">
                <img
                  src={img.url}
                  alt=""
                  className="h-24 w-24 rounded-xl border border-ink-200 object-cover dark:border-ink-800"
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-danger-500 text-white shadow dark:border-ink-900"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            {images.length < 5 && (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex h-24 w-24 flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-ink-300 bg-ink-50 text-ink-400 hover:border-brand-600 hover:text-brand-600 dark:border-ink-700 dark:bg-ink-900"
              >
                <Camera size={20} />
                <span className="text-[10.5px] font-bold">Add photo</span>
              </button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={pickImages}
          />
          <p className="mt-2 flex items-center gap-1 text-[11px] text-ink-400">
            First image is the cover. Max 5 photos, JPG or PNG.
          </p>
        </Field>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex h-14 flex-1 items-center justify-center gap-2 rounded-full bg-brand-600 text-[15px] font-extrabold text-white shadow-brand transition-all hover:bg-brand-700 disabled:opacity-70"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <CheckCircle2 size={17} />
                Publish product
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => nav("/dashboard/products")}
            className="h-14 rounded-full border-2 border-ink-200 px-6 text-[14px] font-extrabold text-ink-700 hover:border-brand-600 dark:border-ink-800 dark:text-ink-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-ink-200 bg-ink-50 px-4 py-3 text-[14.5px] font-medium text-ink-900 outline-none transition-colors focus:border-brand-600 focus:bg-white dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100";

function Field({ label, icon: Icon, required, children }) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-ink-500">
        <Icon size={13} className="text-brand-600" />
        {label}
        {required && <span className="text-danger-500">*</span>}
      </label>
      {children}
    </div>
  );
}