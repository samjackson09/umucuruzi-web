import { Header } from "./Header";
import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";

export function AppShell() {
  return (
    <div className="min-h-screen bg-surface dark:bg-ink-950">
      <Header />
      <main className="pb-16">
        <Outlet />
      </main>
      <Toaster richColors position="top-center" />
    </div>
  );
}