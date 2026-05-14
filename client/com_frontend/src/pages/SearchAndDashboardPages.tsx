// ─── SearchPage ───────────────────────────────────────────────────────────────
import { useState, type FormEvent, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { searchApi } from "../lib/api";
import type { SearchResultItem } from "../types/api";
import { SearchCard } from "../components/ItemCards";
import {
  Button,  EmptyState, ErrorMessage, PageLoader, Badge
} from "../components/ui";

const CATEGORIES = [
  "All",
  "Textbooks", "Electronics", "Clothing", "Furniture",
  "Stationery", "Sports", "Food",
  "Tutoring", "Design", "Programming", "Transport",
  "Writing", "Photography", "Music",
  "Other",
];

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [keyword, setKeyword] = useState(searchParams.get("keyword") ?? "");
  const [category, setCategory] = useState(searchParams.get("category") ?? "");
  const [type, setType] = useState<"" | "product" | "service">(
    (searchParams.get("type") as "" | "product" | "service") ?? ""
  );
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");

  const [results, setResults] = useState<SearchResultItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const doSearch = async (e?: FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    setHasSearched(true);

    const params = {
      keyword: keyword.trim() || undefined,
      category: category || undefined,
      type: type || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    };

    // Sync to URL
    const qs: Record<string, string> = {};
    if (params.keyword) qs.keyword = params.keyword;
    if (params.category) qs.category = params.category;
    if (params.type) qs.type = params.type;
    if (params.minPrice) qs.minPrice = String(params.minPrice);
    if (params.maxPrice) qs.maxPrice = String(params.maxPrice);
    setSearchParams(qs);

    try {
      const data = await searchApi.search(params);
      setResults(data);
    } catch (e: any) {
      setError(e.message ?? "Search failed");
    } finally {
      setLoading(false);
    }
  };

  // Auto-search if URL has params on mount
  useEffect(() => {
    if (searchParams.toString()) {
      doSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const productCount = results?.filter((r) => r._type === "product").length ?? 0;
  const serviceCount = results?.filter((r) => r._type === "service").length ?? 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-stone-900 dark:text-white">
        Search the marketplace
      </h1>

      {/* Search form */}
      <form
        onSubmit={doSearch}
        className="mb-8 rounded-2xl border border-stone-200 bg-white p-6 dark:border-stone-700 dark:bg-stone-900"
      >
        {/* Keyword */}
        <div className="mb-4">
          <input
            type="search"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search products and services..."
            className="w-full rounded-xl border border-stone-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Category */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
          >
            <option value="">All categories</option>
            {CATEGORIES.filter((c) => c !== "All").map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Type */}
          <select
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
          >
            <option value="">Products & services</option>
            <option value="product">Products only</option>
            <option value="service">Services only</option>
          </select>

          {/* Price range */}
          <input
            type="number"
            min="0"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Min price (TZS)"
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
          />
          <input
            type="number"
            min="0"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Max price (TZS)"
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
          />
        </div>

        {/* Note about mixed search price bug */}
        {!type && (minPrice || maxPrice) && (
          <p className="mt-3 text-xs text-amber-600 dark:text-amber-400">
            ℹ️ Price filters on mixed search are applied client-side for services (backend limitation).
          </p>
        )}

        <div className="mt-4 flex gap-2">
          <Button type="submit" loading={loading}>Search</Button>
          {hasSearched && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setKeyword(""); setCategory(""); setType(""); setMinPrice(""); setMaxPrice("");
                setResults(null); setHasSearched(false); setSearchParams({});
              }}
            >
              Clear
            </Button>
          )}
        </div>
      </form>

      {/* Results */}
      {error && <ErrorMessage message={error} onRetry={() => doSearch()} />}

      {loading && <PageLoader />}

      {!loading && !error && results !== null && (
        <>
          {/* Result summary */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-sm text-stone-500">
              {results.length} results
            </span>
            {results.length > 0 && (
              <>
                {productCount > 0 && (
                  <Badge label={`${productCount} products`} variant="default" />
                )}
                {serviceCount > 0 && (
                  <Badge label={`${serviceCount} services`} variant="teal" />
                )}
              </>
            )}
          </div>

          {results.length === 0 ? (
            <EmptyState
              title="No results found"
              description="Try different keywords or broader filters"
              icon="🔍"
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {results.map((item) => (
                <SearchCard key={`${item._type}-${item._id}`} item={item} />
              ))}
            </div>
          )}
        </>
      )}

      {!loading && !hasSearched && (
        <EmptyState
          title="Start your search"
          description="Find products and services from students on campus"
          icon="🎓"
        />
      )}
    </div>
  );
}

// ─── DashboardPage ────────────────────────────────────────────────────────────
/**
 * Dashboard uses GET /products and GET /services (all items), then filters
 * client-side by owner ID. This is a workaround for the broken /user/:userId
 * endpoint. For large datasets, this is inefficient — backend fix is needed.
 */
import { productsApi, servicesApi } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useQuery } from "../hooks/useQuery";
import { ProductCard } from "../components/ItemCards";
import { ServiceCard } from "../components/ItemCards";
import { Link } from "react-router-dom";

export function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const { data: allProducts, loading: pLoading } = useQuery(() => productsApi.list(), []);
  const { data: allServices, loading: sLoading } = useQuery(() => servicesApi.list(), []);

  const myProducts = (allProducts ?? []).filter(
    (p) => (p.owner as any)?._id === user?.id || p.owner._id === user?.id
  );
  const myServices = (allServices ?? []).filter(
    (s) => (s.provider as any)?._id === user?.id || s.provider._id === user?.id
  );

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Profile header */}
      <div className="mb-8 flex flex-col gap-4 rounded-2xl bg-gradient-to-r from-teal-50 to-stone-50 p-6 dark:from-teal-950/30 dark:to-stone-900 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-500 text-xl font-bold text-white">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-stone-900 dark:text-white">
              {user?.name}
            </h1>
            <p className="text-sm text-stone-500">
              {user?.campus} · {user?.role}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to="/sell">
            <Button>+ New listing</Button>
          </Link>
          <Button variant="ghost" onClick={handleLogout}>Log out</Button>
        </div>
      </div>

      {/* Warning about /user/:userId bug */}
      <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400">
        ℹ️ Your listings are filtered client-side because the backend's user-specific
        listing endpoint has a known routing issue. Results may be incomplete until
        the backend is patched.
      </div>

      {/* My Products */}
      <section className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-stone-900 dark:text-white">
            My products{" "}
            {!pLoading && (
              <span className="text-sm font-normal text-stone-400">
                ({myProducts.length})
              </span>
            )}
          </h2>
          <Link to="/sell?type=product">
            <Button variant="secondary" size="sm">+ Add product</Button>
          </Link>
        </div>

        {pLoading && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-56 animate-pulse rounded-xl bg-stone-100 dark:bg-stone-800" />
            ))}
          </div>
        )}

        {!pLoading && myProducts.length === 0 && (
          <EmptyState
            title="No products yet"
            description="List something to sell on campus"
            icon="📦"
            action={
              <Link to="/sell?type=product">
                <Button size="sm">List a product</Button>
              </Link>
            }
          />
        )}

        {!pLoading && myProducts.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {myProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* My Services */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-stone-900 dark:text-white">
            My services{" "}
            {!sLoading && (
              <span className="text-sm font-normal text-stone-400">
                ({myServices.length})
              </span>
            )}
          </h2>
          <Link to="/sell?type=service">
            <Button variant="secondary" size="sm">+ Add service</Button>
          </Link>
        </div>

        {sLoading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-44 animate-pulse rounded-xl bg-stone-100 dark:bg-stone-800" />
            ))}
          </div>
        )}

        {!sLoading && myServices.length === 0 && (
          <EmptyState
            title="No services yet"
            description="Offer your skills to other students"
            icon="🛠️"
            action={
              <Link to="/sell?type=service">
                <Button size="sm">Offer a service</Button>
              </Link>
            }
          />
        )}

        {!sLoading && myServices.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {myServices.map((s) => (
              <ServiceCard key={s._id} service={s} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
