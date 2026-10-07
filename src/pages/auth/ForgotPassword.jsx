import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, AlertCircle, MailOpen, CheckCircle2 } from "lucide-react";
import AuthShell from "../../components/auth/AuthShell";
import Field from "../../components/ui/Field";
import { Button } from "../../components/ui/Button";
import api from "../../lib/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [emailErr, setEmailErr] = useState(null);
  const [formErr, setFormErr] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const validate = () => {
    const trimmed = email.trim();
    if (!trimmed) return setEmailErr("Please enter your email address"), false;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed))
      return setEmailErr("Enter a valid email address"), false;
    setEmailErr(null);
    return true;
  };

  const submit = async (e) => {
    e.preventDefault();
    setFormErr(null);
    if (!validate()) return;
    setLoading(true);
    try {
      // Silent — never reveal if the email exists
      await api.post("/users/forgot-password", { email: email.trim() }).catch(() => {});
      setSent(true);
    } catch (err) {
      setFormErr(
        err?.response?.data?.message ||
          err?.message ||
          "Could not send the reset link. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title={sent ? "Check your inbox" : "Forgot password?"}
      subtitle={
        sent
          ? "We just sent you a link — follow it to reset your password."
          : "Enter the email linked to your account and we'll send you a reset link."
      }
    >
      {sent ? (
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-600/10">
            <MailOpen size={36} className="text-brand-600" />
          </div>

          <p className="text-[14px] leading-relaxed text-ink-600 dark:text-ink-400">
            A reset link was sent to
          </p>
          <p className="mt-1 text-[15px] font-extrabold text-ink-900 dark:text-ink-100">
            {email.trim()}
          </p>

          <p className="mt-4 max-w-sm text-[12.5px] leading-relaxed text-ink-400">
            Didn't get it? Check your spam folder, or try again in a few minutes.
          </p>

          <div className="mt-8 flex w-full flex-col gap-3">
            <Link to="/auth/login">
              <Button size="lg" fullWidth>
                Back to sign in
              </Button>
            </Link>

            <button
              type="button"
              onClick={() => {
                setSent(false);
                setEmail("");
              }}
              className="flex h-14 w-full items-center justify-center rounded-full border-2 border-ink-200 text-[15px] font-extrabold text-brand-600 hover:border-brand-600 hover:bg-brand-50 dark:border-ink-700 dark:hover:bg-brand-600/10"
            >
              Use a different email
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} noValidate>
          {formErr && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-danger-500/30 bg-danger-500/10 p-3 text-danger-500">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span className="text-[12.5px] font-semibold">{formErr}</span>
            </div>
          )}

          <Field
            label="Email address"
            icon={Mail}
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailErr) setEmailErr(null);
              if (formErr) setFormErr(null);
            }}
            error={emailErr}
            autoComplete="email"
            autoFocus
          />

          <Button type="submit" size="lg" fullWidth loading={loading}>
            Send reset link
          </Button>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-ink-200 dark:bg-ink-800" />
            <span className="text-[11.5px] font-bold tracking-wide text-ink-400">
              REMEMBERED IT?
            </span>
            <div className="h-px flex-1 bg-ink-200 dark:bg-ink-800" />
          </div>

          <Link
            to="/auth/login"
            className="flex h-14 w-full items-center justify-center gap-2 rounded-full border-2 border-ink-200 text-[15px] font-extrabold text-brand-600 hover:border-brand-600 hover:bg-brand-50 dark:border-ink-700 dark:hover:bg-brand-600/10"
          >
            <ArrowLeft size={16} />
            Back to sign in
          </Link>
        </form>
      )}
    </AuthShell>
  );
}