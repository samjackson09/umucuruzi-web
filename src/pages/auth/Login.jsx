import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Lock, AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import AuthShell from "../../components/auth/AuthShell";
import Field from "../../components/ui/Field";
import { useAuthStore } from "../../store/auth";

/* Same detection logic as your RN app */
const DISABLED_PATTERNS = [
  "disabled",
  "deactivated",
  "inactive",
  "suspended",
  "account is not active",
  "account has been disabled",
  "account is disabled",
];

const isDisabledAccountError = (message) => {
  if (!message) return false;
  const m = message.toLowerCase();
  return DISABLED_PATTERNS.some((p) => m.includes(p));
};

export default function Login() {
  const nav = useNavigate();
  const login = useAuthStore((s) => s.login);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [usernameErr, setUsernameErr] = useState(null);
  const [passwordErr, setPasswordErr] = useState(null);
  const [formErr, setFormErr] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setFormErr(null);

    let ok = true;
    if (!username.trim()) {
      setUsernameErr("Please enter your username");
      ok = false;
    } else setUsernameErr(null);
    if (!password) {
      setPasswordErr("Please enter your password");
      ok = false;
    } else setPasswordErr(null);
    if (!ok) return;

    setLoading(true);
    try {
      await login(username.trim(), password);
      toast.success("Welcome back!");
      nav("/");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Could not sign you in. Please try again.";

      if (isDisabledAccountError(msg)) {
        toast.error("Your account is disabled. Contact support.");
        nav("/pricing");
        return;
      }
      setFormErr(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Sign in"
      subtitle="Welcome back to umucuruzi"
    >
      <form onSubmit={submit} noValidate>
        {/* Form error */}
        {formErr && (
          <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-danger-500/30 bg-danger-500/10 p-3">
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-danger-500" />
            <span className="text-[12.5px] font-semibold leading-snug text-danger-500">
              {formErr}
            </span>
          </div>
        )}

        <Field
          label="Username"
          icon={User}
          placeholder="Enter your username"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            if (usernameErr) setUsernameErr(null);
            if (formErr) setFormErr(null);
          }}
          error={usernameErr}
          autoComplete="username"
          autoFocus
        />

        <Field
          label="Password"
          icon={Lock}
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (passwordErr) setPasswordErr(null);
            if (formErr) setFormErr(null);
          }}
          error={passwordErr}
          autoComplete="current-password"
        />

        <div className="-mt-2 mb-6 flex items-center justify-end">
          <Link
            to="/auth/forgot-password"
            className="text-[12.5px] font-bold text-brand-600 hover:text-brand-700"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-brand-600 text-[15px] font-extrabold text-white shadow-brand transition-all hover:bg-brand-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <>
              Sign in
              <ArrowRight size={16} />
            </>
          )}
        </button>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-ink-200" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-ink-400">
            New here?
          </span>
          <div className="h-px flex-1 bg-ink-200" />
        </div>

        <Link
          to="/auth/signup"
          className="flex h-14 w-full items-center justify-center rounded-full border-2 border-brand-600 bg-white text-[15px] font-extrabold text-brand-600 transition-colors hover:bg-brand-50"
        >
          Create an account
        </Link>

        <p className="mt-8 text-center text-[11.5px] leading-relaxed text-ink-500">
          By continuing you agree to umucuruzi's{" "}
          <a
            href="https://umucuruziprivacypolicy.site.je"
            target="_blank"
            rel="noreferrer"
            className="font-bold text-brand-600 underline"
          >
            Privacy Policy
          </a>
          .
        </p>
      </form>
    </AuthShell>
  );
}