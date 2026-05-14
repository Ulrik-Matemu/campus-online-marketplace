// ─── ProductDetailPage ────────────────────────────────────────────────────────
import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { productsApi } from "../lib/api";
import { useQuery } from "../hooks/useQuery";
import { useAuth } from "../context/AuthContext";
import {
  PageLoader, ErrorMessage, Badge, Button, conditionVariant
} from "../components/ui";
import { formatPrice, timeAgo } from "../lib/format";

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [imgIdx, setImgIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  const { data: product, loading, error } = useQuery(
    () => productsApi.get(id!),
    [id]
  );

  const handleDelete = async () => {
    if (!product || !token) return;
    if (!confirm("Delete this product?")) return;
    setDeleting(true);
    try {
      await productsApi.delete(product._id, token);
      navigate("/products");
    } catch (e: any) {
      alert(e.message ?? "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <PageLoader />;
  if (error || !product)
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <ErrorMessage
          title="Product not found"
          message={error ?? "This product may have been removed."}
        />
      </div>
    );

  const isOwner = user?.id === (product.owner as any)?._id || user?.id === product.owner._id;
  const isAdmin = user?.role === "admin";
  const canModify = isOwner || isAdmin;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Image gallery */}
        <div>
          <div className="overflow-hidden rounded-xl bg-stone-100 dark:bg-stone-800">
            {product.images[imgIdx] ? (
              <img
                src={product.images[imgIdx].url}
                alt={product.title}
                className="aspect-square w-full object-cover"
              />
            ) : (
              <div className="flex aspect-square items-center justify-center text-6xl text-stone-300">
                📦
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img, i) => (
                <button
                  key={img.public_id}
                  onClick={() => setImgIdx(i)}
                  className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                    i === imgIdx
                      ? "border-teal-500"
                      : "border-transparent hover:border-stone-300"
                  }`}
                >
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="mb-2 flex flex-wrap gap-2">
            <Badge label={product.category} />
            <Badge label={product.condition} variant={conditionVariant(product.condition)} />
          </div>

          <h1 className="mb-2 text-2xl font-bold text-stone-900 dark:text-white">
            {product.title}
          </h1>

          <p className="mb-4 text-3xl font-bold text-teal-600 dark:text-teal-400">
            {formatPrice(product.price)}
          </p>

          <p className="mb-6 text-stone-600 dark:text-stone-400 leading-relaxed">
            {product.description}
          </p>

          {/* Seller */}
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-700 dark:bg-stone-800">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-stone-400">
              Seller
            </p>
            <p className="font-medium text-stone-900 dark:text-stone-100">
              {product.owner.name}
            </p>
            <p className="text-sm text-stone-500">{product.owner.campus}</p>
            {product.owner.phoneNumber && (
              <a
                href={`tel:${product.owner.phoneNumber}`}
                className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-teal-600 hover:underline dark:text-teal-400"
              >
                📞 {product.owner.phoneNumber}
              </a>
            )}
          </div>

          <p className="mt-3 text-xs text-stone-400">
            Listed {timeAgo(product.createdAt)}
          </p>

          {/* Owner actions */}
          {canModify && (
            <div className="mt-4 flex gap-2">
              <Link to={`/products/${product._id}/edit`}>
                <Button variant="secondary" size="sm">Edit</Button>
              </Link>
              <Button variant="danger" size="sm" loading={deleting} onClick={handleDelete}>
                Delete
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ServiceDetailPage ────────────────────────────────────────────────────────
import { servicesApi } from "../lib/api";

export function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);

  const { data: service, loading, error } = useQuery(
    () => servicesApi.get(id!),
    [id]
  );

  const handleDelete = async () => {
    if (!service || !token) return;
    if (!confirm("Delete this service?")) return;
    setDeleting(true);
    try {
      await servicesApi.delete(service._id, token);
      navigate("/services");
    } catch (e: any) {
      alert(e.message ?? "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <PageLoader />;
  if (error || !service)
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <ErrorMessage
          title="Service not found"
          message={error ?? "This service may have been removed."}
        />
      </div>
    );

  const isOwner = user?.id === service.provider._id;
  const isAdmin = user?.role === "admin";
  const canModify = isOwner || isAdmin;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Hero */}
      <div className="mb-8 rounded-2xl bg-gradient-to-br from-teal-50 to-teal-100/50 p-8 dark:from-teal-950/40 dark:to-teal-900/20">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-500 text-2xl text-white font-bold">
          {service.title.charAt(0).toUpperCase()}
        </div>
        <Badge label={service.category} variant="teal" />
        <h1 className="mt-2 text-2xl font-bold text-stone-900 dark:text-white">
          {service.title}
        </h1>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-3xl font-bold text-teal-600 dark:text-teal-400">
            {formatPrice(service.rate)}
          </span>
          <span className="text-stone-500">
            / {service.rateType === "hourly" ? "hour" : "fixed price"}
          </span>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="mb-2 font-semibold text-stone-900 dark:text-white">About this service</h2>
        <p className="text-stone-600 dark:text-stone-400 leading-relaxed">{service.description}</p>
      </div>

      {/* Provider */}
      <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-700 dark:bg-stone-800">
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-stone-400">
          Provider
        </p>
        <p className="font-medium text-stone-900 dark:text-stone-100">
          {service.provider.name}
        </p>
        <p className="text-sm text-stone-500">{service.provider.campus}</p>
        {service.provider.phoneNumber && (
          <a
            href={`tel:${service.provider.phoneNumber}`}
            className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-teal-600 hover:underline dark:text-teal-400"
          >
            📞 {service.provider.phoneNumber}
          </a>
        )}
      </div>

      <p className="mt-3 text-xs text-stone-400">Listed {timeAgo(service.createdAt)}</p>

      {canModify && (
        <div className="mt-4 flex gap-2">
          <Link to={`/services/${service._id}/edit`}>
            <Button variant="secondary" size="sm">Edit</Button>
          </Link>
          <Button variant="danger" size="sm" loading={deleting} onClick={handleDelete}>
            Delete
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── SellPage (Create Product or Service) ─────────────────────────────────────
import { type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { Input, Textarea, Select } from "../components/ui";
import { InlineAlert } from "../components/ui";
import type { ProductCondition, RateType } from "../types/api";

const PRODUCT_CATEGORIES_OPT = [
  "Textbooks", "Electronics", "Clothing", "Furniture",
  "Stationery", "Sports", "Food", "Other",
].map((v) => ({ value: v, label: v }));

const SERVICE_CATEGORIES_OPT = [
  "Tutoring", "Design", "Programming", "Transport",
  "Writing", "Photography", "Music", "Other",
].map((v) => ({ value: v, label: v }));

const CONDITION_OPTIONS: { value: ProductCondition; label: string }[] = [
  { value: "New", label: "New" },
  { value: "Used - Like New", label: "Used – Like New" },
  { value: "Used - Good", label: "Used – Good" },
  { value: "Used - Fair", label: "Used – Fair" },
];

export function SellPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [listingType, setListingType] = useState<"product" | "service">(
    (searchParams.get("type") as "product" | "service") ?? "product"
  );

  // Product fields
  const [pTitle, setPTitle] = useState("");
  const [pDesc, setPDesc] = useState("");
  const [pCat, setPCat] = useState("");
  const [pPrice, setPPrice] = useState("");
  const [pCondition, setPCondition] = useState<ProductCondition>("New");
  const [pImages, setPImages] = useState<File[]>([]);
  const [pImagePreviews, setPImagePreviews] = useState<string[]>([]);

  // Service fields
  const [sTitle, setSTitle] = useState("");
  const [sDesc, setSDesc] = useState("");
  const [sCat, setSCat] = useState("");
  const [sRate, setSRate] = useState("");
  const [sRateType, setSRateType] = useState<RateType>("hourly");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length > 5) {
      setError("Maximum 5 images allowed");
      return;
    }
    setPImages(files);
    setPImagePreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const validateProduct = () => {
    if (!pTitle.trim()) return "Title is required";
    if (!pDesc.trim()) return "Description is required";
    if (!pCat) return "Category is required";
    const price = Number(pPrice);
    if (!pPrice || isNaN(price) || price <= 0) return "Enter a valid price";
    if (pImages.length === 0) return "At least one image is required";
    return null;
  };

  const validateService = () => {
    if (!sTitle.trim()) return "Title is required";
    if (!sDesc.trim()) return "Description is required";
    if (!sCat) return "Category is required";
    const rate = Number(sRate);
    if (!sRate || isNaN(rate) || rate <= 0) return "Enter a valid rate";
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) {
      navigate("/login");
      return;
    }

    setError(null);

    if (listingType === "product") {
      const err = validateProduct();
      if (err) { setError(err); return; }
      setLoading(true);
      try {
        const product = await productsApi.create(
          { title: pTitle, description: pDesc, category: pCat, price: Number(pPrice), condition: pCondition, images: pImages },
          token
        );
        navigate(`/products/${product._id}`);
      } catch (e: any) {
        setError(e.message ?? "Failed to create listing");
      } finally {
        setLoading(false);
      }
    } else {
      const err = validateService();
      if (err) { setError(err); return; }
      setLoading(true);
      try {
        const service = await servicesApi.create(
          { title: sTitle, description: sDesc, category: sCat, rate: Number(sRate), rateType: sRateType },
          token
        );
        navigate(`/services/${service._id}`);
      } catch (e: any) {
        setError(e.message ?? "Failed to create service");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-stone-900 dark:text-white">
        New listing
      </h1>

      {/* Type toggle */}
      <div className="mb-6 flex rounded-xl border border-stone-200 bg-stone-50 p-1 dark:border-stone-700 dark:bg-stone-800">
        {(["product", "service"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setListingType(t)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
              listingType === t
                ? "bg-white text-teal-600 shadow-sm dark:bg-stone-700 dark:text-teal-400"
                : "text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"
            }`}
          >
            {t === "product" ? "📦 Product" : "🛠️ Service"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {error && <InlineAlert variant="error" message={error} />}

        {listingType === "product" ? (
          <>
            <Input label="Title" value={pTitle} onChange={(e) => setPTitle(e.target.value)} placeholder="e.g. Introduction to Algorithms 4th Ed." required />
            <Textarea label="Description" value={pDesc} onChange={(e) => setPDesc(e.target.value)} rows={4} placeholder="Describe the item's condition, any wear and tear..." required />
            <Select label="Category" value={pCat} onChange={(e) => setPCat(e.target.value)} options={PRODUCT_CATEGORIES_OPT} placeholder="Select category" required />
            <Select label="Condition" value={pCondition} onChange={(e) => setPCondition(e.target.value as ProductCondition)} options={CONDITION_OPTIONS} required />
            <Input label="Price (TZS)" type="number" min="0" value={pPrice} onChange={(e) => setPPrice(e.target.value)} placeholder="5000" required />

            {/* Image upload */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
                Images <span className="text-stone-400">(max 5)</span>
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="text-sm text-stone-600 file:mr-3 file:rounded-lg file:border-0 file:bg-teal-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-teal-600 hover:file:bg-teal-100 dark:text-stone-400"
              />
              {pImagePreviews.length > 0 && (
                <div className="mt-2 flex gap-2 flex-wrap">
                  {pImagePreviews.map((src, i) => (
                    <div key={i} className="relative h-20 w-20 overflow-hidden rounded-lg border border-stone-200">
                      <img src={src} alt="" className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Input label="Service title" value={sTitle} onChange={(e) => setSTitle(e.target.value)} placeholder="e.g. Mathematics tutoring" required />
            <Textarea label="Description" value={sDesc} onChange={(e) => setSDesc(e.target.value)} rows={4} placeholder="Describe what you offer, your experience, availability..." required />
            <Select label="Category" value={sCat} onChange={(e) => setSCat(e.target.value)} options={SERVICE_CATEGORIES_OPT} placeholder="Select category" required />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Rate (TZS)" type="number" min="0" value={sRate} onChange={(e) => setSRate(e.target.value)} placeholder="10000" required />
              <Select label="Rate type" value={sRateType} onChange={(e) => setSRateType(e.target.value as RateType)} options={[{ value: "hourly", label: "Hourly" }, { value: "fixed", label: "Fixed price" }]} required />
            </div>
          </>
        )}

        <Button type="submit" loading={loading} size="lg" className="mt-2 w-full">
          Publish listing
        </Button>
      </form>
    </div>
  );
}
