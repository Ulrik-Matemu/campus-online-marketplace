// ─── LoginPage ────────────────────────────────────────────────────────────────
import { useState, type FormEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { authApi } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Button, Input, InlineAlert } from "../components/ui";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in both fields");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await authApi.login({ email: email.trim().toLowerCase(), password });
      login(res.token, res.user);
      navigate(from, { replace: true });
    } catch (err: any) {
      if (err.status === 403) {
        setError("Your email is not verified. Please check your inbox.");
      } else {
        setError(err.message ?? "Login failed. Check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Log in</h1>
          <p className="mt-1 text-stone-500">
            No account?{" "}
            <Link to="/register" className="text-teal-600 hover:underline dark:text-teal-400">
              Register
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          {error && <InlineAlert variant="error" message={error} />}

          <Input
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@university.ac.tz"
            required
          />

          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" loading={loading} size="lg" className="w-full mt-2">
            Log in
          </Button>
        </form>
      </div>
    </div>
  );
}

// ─── EmailVerifyPage ──────────────────────────────────────────────────────────
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { PageLoader } from "../components/ui";

export function EmailVerifyPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link.");
      return;
    }
    authApi.verify(token)
      .then((res) => {
        setStatus("success");
        setMessage(res.message ?? "Email verified! You can now log in.");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.message ?? "Verification failed. The link may have expired.");
      });
  }, [token]);

  if (status === "loading") return <PageLoader />;

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <div className="mb-4 text-5xl">
          {status === "success" ? "✅" : "❌"}
        </div>
        <h1 className="mb-2 text-xl font-bold text-stone-900 dark:text-white">
          {status === "success" ? "Email verified" : "Verification failed"}
        </h1>
        <p className="mb-6 text-stone-600 dark:text-stone-400">{message}</p>
        {status === "success" && (
          <Link to="/login">
            <Button>Go to login</Button>
          </Link>
        )}
        {status === "error" && (
          <Link to="/register">
            <Button variant="secondary">Back to register</Button>
          </Link>
        )}
      </div>
    </div>
  );
}

// ─── ProductsPage ─────────────────────────────────────────────────────────────
import { productsApi } from "../lib/api";
import { ProductCard } from "../components/ItemCards";
import { ErrorMessage, EmptyState } from "../components/ui";

const PRODUCT_CATEGORIES = [
  "All", "Textbooks", "Electronics", "Clothing", "Furniture",
  "Stationery", "Sports", "Food", "Other",
];

export function ProductsPage() {
  const navigate = useNavigate();
  const { data: products, loading, error, refetch } = useQuery(
    () => productsApi.list(),
    []
  );

  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = (products ?? []).filter((p) => {
    const matchCat = category === "All" || p.category === category;
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Products</h1>
          <p className="text-stone-500">
            {products ? `${filtered.length} items available` : "Loading..."}
          </p>
        </div>
        <Link to="/sell?type=product">
          <Button>+ Sell a product</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
        />
        <div className="flex gap-2 flex-wrap">
          {PRODUCT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                category === cat
                  ? "bg-teal-500 text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {error && <ErrorMessage message={error} onRetry={refetch} />}

      {loading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-xl bg-stone-100 dark:bg-stone-800" />
          ))}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <EmptyState
          title="No products found"
          description="Try adjusting your filters or search term"
          icon="📦"
          action={
            <Button variant="secondary" onClick={() => { setSearch(""); setCategory("All"); }}>
              Clear filters
            </Button>
          }
        />
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── ServicesPage ─────────────────────────────────────────────────────────────
import { servicesApi } from "../lib/api";
import { ServiceCard } from "../components/ItemCards";
import { useQuery } from "../hooks/useQuery";

const SERVICE_CATEGORIES = [
  "All", "Tutoring", "Design", "Programming", "Transport",
  "Writing", "Photography", "Music", "Other",
];

export function ServicesPage() {
  const { data: services, loading, error, refetch } = useQuery(
    () => servicesApi.list(),
    []
  );

  const [category, setCategory] = useState("All");
  const [rateType, setRateType] = useState<"all" | "hourly" | "fixed">("all");

  const filtered = (services ?? []).filter((s) => {
    const matchCat = category === "All" || s.category === category;
    const matchRate = rateType === "all" || s.rateType === rateType;
    return matchCat && matchRate;
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Services</h1>
          <p className="text-stone-500">
            {services ? `${filtered.length} services available` : "Loading..."}
          </p>
        </div>
        <Link to="/sell?type=service">
          <Button>+ Offer a service</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex gap-2 flex-wrap flex-1">
          {SERVICE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                category === cat
                  ? "bg-teal-500 text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <select
          value={rateType}
          onChange={(e) => setRateType(e.target.value as any)}
          className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
        >
          <option value="all">All rates</option>
          <option value="hourly">Hourly</option>
          <option value="fixed">Fixed price</option>
        </select>
      </div>

      {error && <ErrorMessage message={error} onRetry={refetch} />}

      {loading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-xl bg-stone-100 dark:bg-stone-800" />
          ))}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <EmptyState
          title="No services found"
          description="Try a different category or rate type"
          icon="🛠️"
        />
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((service) => (
            <ServiceCard key={service._id} service={service} />
          ))}
        </div>
      )}
    </div>
  );
}
