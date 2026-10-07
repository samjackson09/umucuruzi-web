import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Store } from "lucide-react";
import { marketService } from "../services/market";
import { getFullImageUrl } from "../lib/image";

export default function Markets() {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await marketService.getMarkets().catch(() => []);
      setMarkets(res || []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="container-app py-8">
      <h1 className="mb-6 text-2xl font-black">Markets</h1>
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-ink-200 border-t-brand-600" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {markets.map((m) => {
            const img = getFullImageUrl(m.logo_image);
            return (
              <Link
                key={m.id}
                to={`/markets/${m.id}`}
                className="group flex flex-col items-center rounded-xl border border-ink-200 bg-white p-4 hover:border-brand-600 hover:shadow-md dark:border-ink-800 dark:bg-ink-900"
              >
                <div className="mb-3 h-20 w-20 overflow-hidden rounded-full border-2 border-ink-200 bg-ink-50 dark:border-ink-800 dark:bg-ink-800">
                  {img ? (
                    <img src={img} alt={m.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-ink-400">
                      <Store size={28} />
                    </div>
                  )}
                </div>
                <p className="line-clamp-1 text-center font-extrabold">{m.name}</p>
                {m.district && (
                  <p className="mt-1 flex items-center gap-1 text-[11.5px] text-ink-500">
                    <MapPin size={10} />
                    {m.district}
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}