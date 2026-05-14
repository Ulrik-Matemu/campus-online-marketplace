import { useState, useEffect, type FormEvent } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { servicesApi } from "../lib/api";
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
import type { RateType, UpdateServicePayload } from "../types/api";

const SERVICE_CATEGORIES_OPT = [
  "Tutoring", "Design", "Programming", "Transport",
  "Writing", "Photography", "Music", "Other",
].map((v) => ({ value: v, label: v }));

const RATE_TYPE_OPTIONS: { value: RateType; label: string }[] = [
  { value: "hourly", label: "Hourly" },
  { value: "fixed", label: "Fixed price" },
];

export function EditServicePage() {
  const { id } = useParams<{ id: string }>();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const { data: service, loading, error } = useQuery(
    () => servicesApi.get(id!),
    [id]
  );

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [rate, setRate] = useState("");
  const [rateType, setRateType] = useState<RateType>("hourly");

  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (service) {
      setTitle(service.title);
      setDescription(service.description);
      setCategory(service.category);
      setRate(String(service.rate));
      setRateType(service.rateType);
    }
  }, [service]);

  if (!loading && service) {
    const isOwner =
      user?.id === (service.provider as any)?._id ||
      user?.id === service.provider._id;
    if (!isOwner && user?.role !== "admin") {
      return (
        <div className="mx-auto max-w-3xl px-4 py-12">
          <ErrorMessage title="Access denied" message="You can only edit your own services." />
        </div>
      );
    }
  }

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!title.trim()) errors.title = "Title is required";
    if (!description.trim()) errors.description = "Description is required";
    if (!category) errors.category = "Category is required";
    const r = Number(rate);
    if (!rate || isNaN(r) || r <= 0) errors.rate = "Enter a valid rate greater than 0";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate() || !token || !service) return;

    const payload: UpdateServicePayload = {};
    if (title.trim() !== service.title) payload.title = title.trim();
    if (description.trim() !== service.description) payload.description = description.trim();
    if (category !== service.category) payload.category = category;
    if (Number(rate) !== service.rate) payload.rate = Number(rate);
    if (rateType !== service.rateType) payload.rateType = rateType;

    if (Object.keys(payload).length === 0) {
      navigate(`/services/${service._id}`);
      return;
    }

    setSubmitting(true);
    setApiError(null);
    try {
      await servicesApi.update(service._id, payload, token);
      navigate(`/services/${service._id}`);
    } catch (err: any) {
      setApiError(err.message ?? "Failed to save changes. Please try again.");
    } finally {
      setSubmitting(false);
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

  const hasChanges =
    title.trim() !== service.title ||
    description.trim() !== service.description ||
    category !== service.category ||
    Number(rate) !== service.rate ||
    rateType !== service.rateType;

  const clearError = (field: string) =>
    setFieldErrors((prev) => ({ ...prev, [field]: "" }));

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <div className="mb-6 flex items-center gap-3">
        <Link
          to={`/services/${service._id}`}
          className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800"
          aria-label="Back to service"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Edit service</h1>
          <p className="max-w-xs truncate text-sm text-stone-500">{service.title}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {apiError && <InlineAlert variant="error" message={apiError} />}

        <Input
          label="Service title"
          type="text"
          value={title}
          onChange={(e) => { setTitle(e.target.value); clearError("title"); }}
          error={fieldErrors.title}
          placeholder="e.g. Mathematics tutoring"
          required
        />

        <Textarea
          label="Description"
          value={description}
          onChange={(e) => { setDescription(e.target.value); clearError("description"); }}
          error={fieldErrors.description}
          rows={5}
          placeholder="Describe what you offer, your experience, availability..."
          required
        />

        <Select
          label="Category"
          value={category}
          onChange={(e) => { setCategory(e.target.value); clearError("category"); }}
          error={fieldErrors.category}
          options={SERVICE_CATEGORIES_OPT}
          placeholder="Select category"
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Rate (TZS)"
            type="number"
            min="1"
            value={rate}
            onChange={(e) => { setRate(e.target.value); clearError("rate"); }}
            error={fieldErrors.rate}
            placeholder="10000"
            required
          />
          <Select
            label="Rate type"
            value={rateType}
            onChange={(e) => setRateType(e.target.value as RateType)}
            options={RATE_TYPE_OPTIONS}
            required
          />
        </div>

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
          <Link to={`/services/${service._id}`}>
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