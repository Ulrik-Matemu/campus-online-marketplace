import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui";

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path: string) =>
    location.pathname === path ||
    (path !== "/" && location.pathname.startsWith(path));

  const linkClass = (path: string) =>
    `text-sm font-medium transition-colors ${
      isActive(path)
        ? "text-teal-600 dark:text-teal-400"
        : "text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/90 backdrop-blur dark:border-stone-800 dark:bg-stone-950/90">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-stone-900 dark:text-white">
            Campus<span className="text-teal-500">Market</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link to="/products" className={linkClass("/products")}>
            Products
          </Link>
          <Link to="/services" className={linkClass("/services")}>
            Services
          </Link>
          <Link to="/search" className={linkClass("/search")}>
            Search
          </Link>
        </nav>

        {/* Desktop auth */}
        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className="text-sm font-medium text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
              >
                {user?.name?.split(" ")[0]}
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Log out
              </Button>
              <Link to="/sell">
                <Button size="sm">+ List item</Button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="secondary" size="sm">Log in</Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Register</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="rounded-lg p-2 text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800 md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-stone-200 bg-white px-4 py-4 dark:border-stone-800 dark:bg-stone-950 md:hidden">
          <nav className="flex flex-col gap-3">
            <Link to="/products" className="text-sm font-medium text-stone-700 dark:text-stone-300" onClick={() => setMobileOpen(false)}>Products</Link>
            <Link to="/services" className="text-sm font-medium text-stone-700 dark:text-stone-300" onClick={() => setMobileOpen(false)}>Services</Link>
            <Link to="/search" className="text-sm font-medium text-stone-700 dark:text-stone-300" onClick={() => setMobileOpen(false)}>Search</Link>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-sm font-medium text-stone-700 dark:text-stone-300" onClick={() => setMobileOpen(false)}>Dashboard</Link>
                <Link to="/sell" className="text-sm font-medium text-teal-600" onClick={() => setMobileOpen(false)}>+ List item</Link>
                <button onClick={handleLogout} className="text-left text-sm font-medium text-red-600">Log out</button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-stone-700 dark:text-stone-300" onClick={() => setMobileOpen(false)}>Log in</Link>
                <Link to="/register" className="text-sm font-medium text-teal-600" onClick={() => setMobileOpen(false)}>Register</Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
