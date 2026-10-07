import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../components/ui/Button";

const SLIDES = [
  {
    step: "one",
    img: "/onboarding/screen1.jpg",
    title: "Find Products Nearby",
    description:
      "Discover local traders and markets around you. Shop from the best stores in your area.",
    cta: "Next",
    next: "/onboarding/second",
  },
  {
    step: "second",
    img: "/onboarding/screen2.jpg",
    title: "Negotiate & Communicate",
    description:
      "Chat directly with traders via WhatsApp. Preserve the Rwandan culture of negotiation, build relationships, and get the best deals.",
    cta: "Next",
    next: "/onboarding/third",
  },
  {
    step: "third",
    img: "/onboarding/screen3.jpg",
    title: "Scan & Share QR Codes",
    description:
      "Easily discover traders, markets, and products by scanning QR codes. Share your own shop QR code with customers to grow your business.",
    cta: "Next",
    next: "/onboarding/four",
  },
  {
    step: "four",
    img: "/onboarding/screen4.jpg",
    title: "Delivery & Loyalty",
    description:
      "Track your orders in real-time and earn loyalty points with every purchase. Enjoy fast, reliable delivery from trusted agents.",
    cta: "Get Started",
    next: "/auth/login",
  },
];

export default function Onboarding() {
  const nav = useNavigate();
  const { step } = useParams();

  const slide = SLIDES.find((s) => s.step === step) || SLIDES[0];
  const index = SLIDES.indexOf(slide);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <img
        src={slide.img}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-black/30" />

      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-6 pt-6">
        <span className="text-sm font-black text-white/90">umucuruzi</span>
        {index < SLIDES.length - 1 && (
          <button
            onClick={() => nav("/auth/login")}
            className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold text-white backdrop-blur hover:bg-white/25"
          >
            Skip
          </button>
        )}
      </div>

      <div
        className="absolute inset-x-0 bottom-0 z-10 rounded-t-[30px] bg-white px-6 pt-7 pb-8 shadow-[0_-10px_30px_rgba(0,0,0,0.15)] dark:bg-ink-900"
        style={{ minHeight: "28vh" }}
      >
        <h2 className="mb-2 text-center text-2xl font-extrabold text-brand-600">
          {slide.title}
        </h2>
        <p className="mb-5 text-center text-sm leading-relaxed text-ink-600 dark:text-ink-400">
          {slide.description}
        </p>

        <div className="mb-5 flex justify-center gap-2">
          {SLIDES.map((s, i) => (
            <span
              key={s.step}
              className={
                "h-1.5 rounded-full transition-all " +
                (i === index
                  ? "w-6 bg-brand-600"
                  : "w-1.5 bg-ink-300 dark:bg-ink-700")
              }
            />
          ))}
        </div>

        <Button size="lg" fullWidth onClick={() => nav(slide.next)}>
          {slide.cta}
        </Button>
      </div>
    </div>
  );
}