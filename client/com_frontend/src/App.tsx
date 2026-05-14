import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { ProtectedRoute } from "./components/ProtectedRoute";

import RegisterPage from "./pages/RegisterPage";
import { LoginPage, EmailVerifyPage, ProductsPage, ServicesPage } from "./pages/AuthAndListPages";
import { ProductDetailPage, ServiceDetailPage, SellPage } from "./pages/DetailAndSellPages";
import { SearchPage, DashboardPage } from "./pages/SearchAndDashboardPages";
import { EditProductPage } from "./pages/EditProductPage";
import { EditServicePage } from "./pages/EditServicePage";

function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 text-center">
      <h1 className="mb-4 text-4xl font-bold tracking-tight text-stone-900 dark:text-white">
        Campus<span className="text-teal-500">Market</span>
      </h1>
      <p className="mb-8 text-lg text-stone-500">
        Buy, sell, and find services — all within your campus community.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <a href="/products" className="rounded-xl bg-teal-500 px-6 py-3 font-medium text-white hover:bg-teal-600 transition-colors">
          Browse products
        </a>
        <a href="/services" className="rounded-xl border border-stone-300 px-6 py-3 font-medium text-stone-700 hover:bg-stone-50 transition-colors dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-800">
          Browse services
        </a>
      </div>
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
          <Navbar />
          <main>
            <Routes>
              {/* Public */}
              <Route path="/" element={<HomePage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/verify/:token" element={<EmailVerifyPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/services/:id" element={<ServiceDetailPage />} />
              <Route path="/search" element={<SearchPage />} />

              {/* Protected */}
              <Route path="/sell" element={
                <ProtectedRoute><SellPage /></ProtectedRoute>
              } />
              <Route path="/products/:id/edit" element={
                <ProtectedRoute><EditProductPage /></ProtectedRoute>
              } />
              <Route path="/services/:id/edit" element={
                <ProtectedRoute><EditServicePage /></ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute><DashboardPage /></ProtectedRoute>
              } />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}