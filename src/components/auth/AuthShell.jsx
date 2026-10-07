import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import screen2 from "../../assets/screen2.jpg";

export default function AuthShell({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen bg-white dark:bg-white">
      {/* ═══════════════ LEFT: image only ═══════════════ */}
      <aside className="relative hidden w-1/2 overflow-hidden lg:block">
        <img
          src={screen2}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      </aside>

      {/* ═══════════════ RIGHT: form ═══════════════ */}
      <main className="flex w-full flex-col lg:w-1/2">
        {/* Back to home */}
        <div className="flex items-center px-6 pt-6 sm:px-10 sm:pt-8">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-[13px] font-bold text-brand-600 hover:text-brand-700"
          >
            <ArrowLeft size={15} />
            Back to home
          </Link>
        </div>

        {/* Form */}
        <div className="flex flex-1 items-center justify-center px-6 pb-12 pt-6 sm:px-10">
          <div className="w-full max-w-sm">
            <header className="mb-8">
              <h1 className="text-3xl font-black tracking-tight text-ink-900">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-2 text-[13.5px] font-medium text-ink-500">
                  {subtitle}
                </p>
              )}
            </header>

            {children}
          </div>
        </div>
      </main>
    </div>
  );
}