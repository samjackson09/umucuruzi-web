import { LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  title: string;
  message?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, message, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-600/10">
        <Icon size={28} className="text-brand-600" />
      </div>
      <h3 className="text-lg font-extrabold text-ink-900 dark:text-ink-100">{title}</h3>
      {message && (
        <p className="mt-2 max-w-md text-sm text-ink-500 dark:text-ink-400">{message}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}