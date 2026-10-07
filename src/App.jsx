import { useEffect } from "react";
import {
  BrowserRouter, Routes, Route, Navigate, Outlet,
} from "react-router-dom";
import { Toaster } from "sonner";

// Layout
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import WelcomeBar from "./components/layout/WelcomeBar";
import DashboardShell from "./components/layout/DashboardShell";

// Public pages
import Home from "./pages/Home";
import Search from "./pages/Search";
import Traders from "./pages/Traders";
import TraderProfile from "./pages/TraderProfile";
import Markets from "./pages/Markets";
import MarketDetail from "./pages/MarketDetail";
import About from "./pages/About";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";

// Auth
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";

// Onboarding
import Onboarding from "./pages/onboarding/Onboarding";

// Orders
import Orders from "./pages/orders/Orders";
import OrderGroup from "./pages/orders/OrderGroup";
import OrderDetail from "./pages/orders/OrderDetail";

// Trader dashboard
import Dashboard from "./pages/dashboard/Dashboard";
import Products from "./pages/dashboard/Products";
import AddProduct from "./pages/dashboard/AddProduct";
import PriceTable from "./pages/dashboard/PriceTable";
import PromoCodes from "./pages/dashboard/PromoCodes";
import QRCodeScreen from "./pages/dashboard/QRCode";

import { useAuthStore } from "./store/auth";

function Protected({ children }) {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/auth/login" replace />;
  return children;
}

function PublicShell() {
  return (
    <div className="flex min-h-screen flex-col bg-surface dark:bg-ink-950">
      <Header />
      <WelcomeBar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  const init = useAuthStore((s) => s.init);
  useEffect(() => { init(); }, [init]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Onboarding */}
        <Route path="/onboarding" element={<Navigate to="/onboarding/one" replace />} />
        <Route path="/onboarding/:step" element={<Onboarding />} />

        {/* Auth */}
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/signup" element={<Signup />} />
        <Route path="/auth/forgot-password" element={<ForgotPassword />} />

        {/* Public site */}
        <Route element={<PublicShell />}>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />

          {/* Traders */}
          <Route path="/traders" element={<Traders />} />
          <Route path="/traders/:id" element={<TraderProfile />} />

          {/* Markets — BOTH routes required */}
          <Route path="/markets" element={<Markets />} />
          <Route path="/markets/:id" element={<MarketDetail />} />

          {/* Products */}
          <Route path="/products/:id" element={<ProductDetail />} />

          <Route path="/about" element={<About />} />
          <Route path="/cart" element={<Cart />} />

          <Route path="/profile" element={<Protected><Profile /></Protected>} />
          <Route path="/orders" element={<Protected><Orders /></Protected>} />
          <Route path="/orders/group/:id" element={<Protected><OrderGroup /></Protected>} />
          <Route path="/orders/detail/:id" element={<Protected><OrderDetail /></Protected>} />
          <Route path="/checkout" element={<Protected><Checkout /></Protected>} />
        </Route>

        {/* Trader dashboard */}
        <Route element={<Protected><DashboardShell /></Protected>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/products" element={<Products />} />
          <Route path="/dashboard/add-product" element={<AddProduct />} />
          <Route path="/dashboard/pricetable" element={<PriceTable />} />
          <Route path="/dashboard/promocodes" element={<PromoCodes />} />
          <Route path="/dashboard/qr-code" element={<QRCodeScreen />} />
        </Route>

        {/* Catch-all — MUST be last */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Toaster richColors position="top-center" />
    </BrowserRouter>
  );
}