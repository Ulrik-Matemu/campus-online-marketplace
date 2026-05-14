import { useState, useEffect, type FormEvent } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { productsApi } from "../lib/api";
import { useQuery } from "../hooks/useQuery";
import { useAuth } from "../context/AuthContext";
import {
  PageLoader,
  ErrorMessage,
  Button,
  Input,
  Select,
  Textarea,
  InlineAlert,
} from "../components/ui";
import type { ProductCondition, UpdateProductPayload } from "../types/api";

const PRODUCT_CATEGORIES_OPT = [
  "Textbooks", "Electronics", "Clothing", "Furniture",
  "Stationery", "Sports", "Food", "Other",
].map((v) => ({ value: v, label: v }));

const CONDITION_OPTIONS: { value: ProductCondition; label: string }[] = [
  { value: "New", label: "New" },
  { value: "Used - Like New", label: "Used – Like New" },
  { value: "Used - Good", label: "Used – Good" },
  { value: "Used - Fair", label: "Used – Fair" },
];

export function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  // Load the existing product
  const { data: product, loading, error } = useQuery(
    () => productsApi.get(id!),
    [id]
  );

  // Form state — populated once product loads
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState<ProductCondition>("New");

  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Seed form once data arrives
  useEffect(() => {
    if (product) {
      setTitle(product.title);
      setDescription(product.description);
      setCategory(product.category);
      setPrice(String(product.price));
      setCondition(product.condition);
    }
  }, [product]);

  // Auth / ownership guard
  if (!loading && product) {
    const isOwner =
      user?.id === (product.owner as any)?._id ||
      user?.id === product.owner._id;
    const isAdmin = user?.role === "admin";
    if (!isOwner && !isAdmin) {
      return (
        <div className="mx-auto max-w-3xl px-4 py-12">
          <ErrorMessage
            title="Access denied"
            message="You can only edit your own listings."
          />
        </div>
      );
    }
  }

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!title.trim()) errors.title = "Title is required";
    if (!description.trim()) errors.description = "Description is required";
    if (!category) errors.category = "Category is required";
    const p = Number(price);
    if (!price || isNaN(p) || p <= 0) errors.price = "Enter a valid price greater than 0";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate() || !token || !product) return;

    // Only send fields that actually changed
    const payload: UpdateProductPayload = {};
    if (title.trim() !== product.title) payload.title = title.trim();
    if (description.trim() !== product.description) payload.description = description.trim();
    if (category !== product.category) payload.category = category;
    if (Number(price) !== product.price) payload.price = Number(price);
    if (condition !== product.condition) payload.condition = condition;

    if (Object.keys(payload).length === 0) {
      // Nothing changed — just go back
      navigate(`/products/${product._id}`);
      return;
    }

    setSubmitting(true);
    setApiError(null);
    try {
      await productsApi.update(product._id, payload, token);
      navigate(`/products/${product._id}`);
    } catch (err: any) {
      setApiError(err.message ?? "Failed to save changes. Please try again.");
    } finally {
      setSubmitting(false);
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

  const hasChanges =
    title.trim() !== product.title ||
    description.trim() !== product.description ||
    category !== product.category ||
    Number(price) !== product.price ||
    condition !== product.condition;

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Link
          to={`/products/${product._id}`}
          className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800"
          aria-label="Back to product"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Edit product</h1>
          <p className="text-sm text-stone-500 truncate max-w-xs">{product.title}</p>
        </div>
      </div>

      {/* Existing images (read-only — backend PUT doesn't support re-uploading) */}
      {product.images.length > 0 && (
        <div className="mb-6 rounded-xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-700 dark:bg-stone-800/50">
          <p className="mb-2 text-xs font-medium text-stone-500 uppercase tracking-wide">
            Current images
          </p>
          <div className="flex gap-2 flex-wrap">
            {product.images.map((img) => (
              <div
                key={img.public_id}
                className="h-20 w-20 overflow-hidden rounded-lg border border-stone-200 dark:border-stone-700"
              >
                <img src={img.url} alt="" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-stone-400">
            Image management is not supported by the current backend. To change images, delete and re-list this product.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {apiError && <InlineAlert variant="error" message={apiError} />}

        <Input
          label="Title"
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setFieldErrors((prev) => ({ ...prev, title: "" }));
          }}
          error={fieldErrors.title}
          placeholder="e.g. Introduction to Algorithms 4th Ed."
          required
        />

        <Textarea
          label="Description"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            setFieldErrors((prev) => ({ ...prev, description: "" }));
          }}
          error={fieldErrors.description}
          rows={5}
          placeholder="Describe the item's condition, any wear and tear..."
          required
        />

        <Select
          label="Category"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setFieldErrors((prev) => ({ ...prev, category: "" }));
          }}
          error={fieldErrors.category}
          options={PRODUCT_CATEGORIES_OPT}
          placeholder="Select category"
          required
        />

        <Select
          label="Condition"
          value={condition}
          onChange={(e) => setCondition(e.target.value as ProductCondition)}
          options={CONDITION_OPTIONS}
          required
        />

        <Input
          label="Price (TZS)"
          type="number"
          min="1"
          value={price}
          onChange={(e) => {
            setPrice(e.target.value);
            setFieldErrors((prev) => ({ ...prev, price: "" }));
          }}
          error={fieldErrors.price}
          placeholder="5000"
          required
        />

        <div className="mt-2 flex gap-3">
          <Button
            type="submit"
            loading={submitting}
            disabled={!hasChanges}
            className="flex-1"
            size="lg"
          >
            Save changes
          </Button>
          <Link to={`/products/${product._id}`}>
            <Button type="button" variant="secondary" size="lg">
              Cancel
            </Button>
          </Link>
        </div>

        {!hasChanges && (
          <p className="text-center text-xs text-stone-400">No changes to save</p>
        )}
      </form>
    </div>
  );
}
