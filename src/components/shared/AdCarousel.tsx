import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { getFullImageUrl } from "../../lib/image";

export default function AdCarousel({ ads }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (ads.length < 2) return;
    const id = setInterval(() => setI((p) => (p + 1) % ads.length), 5000);
    return () => clearInterval(id);
  }, [ads.length]);

  if (!ads.length) return null;
  const ad = ads[i];
  const img = getFullImageUrl(ad.image_url);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-ink-900 text-white shadow-card">
      <div className="relative h-[220px] w-full sm:h-[280px]">
        {img ? (
          <img src={img} alt={ad.title} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-brand-600 to-navy-600" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      </div>

      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
        <span className="inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider backdrop-blur">
          Sponsored
        </span>
        <h3 className="mt-2 line-clamp-2 text-xl font-black sm:text-2xl">
          {ad.title}
        </h3>
        {ad.subtitle && (
          <p className="mt-1 line-clamp-1 text-sm text-white/80">{ad.subtitle}</p>
        )}
        <a
          href={ad.link_url || "#"}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-4 py-2 text-[12.5px] font-extrabold text-white hover:bg-brand-700"
        >
          Learn more <ArrowRight size={13} />
        </a>
      </div>

      {ads.length > 1 && (
        <div className="absolute right-4 top-4 flex gap-1.5">
          {ads.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setI(idx)}
              className={
                "h-1.5 rounded-full transition-all " +
                (idx === i ? "w-6 bg-white" : "w-1.5 bg-white/50")
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}