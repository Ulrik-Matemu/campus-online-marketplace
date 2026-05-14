import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../lib/api";
import { Button, Input, Select, InlineAlert } from "../components/ui";

const CAMPUS_OPTIONS = [
  { value: "Main Campus", label: "Main Campus" },
  { value: "Science Campus", label: "Science Campus" },
  { value: "Medical Campus", label: "Medical Campus" },
  { value: "Distance Learning", label: "Distance Learning" },
];

interface FormState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  registrationNumber: string;
  phoneNumber: string;
  campus: string;
}

interface FormErrors extends Partial<FormState> {}

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!form.name.trim()) errors.name = "Name is required";
  if (!form.email.includes("@")) errors.email = "Enter a valid email";
  if (form.password.length < 8)
    errors.password = "Password must be at least 8 characters";
  if (form.password !== form.confirmPassword)
    errors.confirmPassword = "Passwords do not match";
  if (!form.registrationNumber.trim())
    errors.registrationNumber = "Registration number is required";
  if (!/^\+?[\d\s\-]{7,15}$/.test(form.phoneNumber))
    errors.phoneNumber = "Enter a valid phone number";
  if (!form.campus) errors.campus = "Please select your campus";
  return errors;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    registrationNumber: "",
    phoneNumber: "",
    campus: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    setApiError(null);
    try {
      await authApi.register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        registrationNumber: form.registrationNumber.trim(),
        phoneNumber: form.phoneNumber.trim(),
        campus: form.campus,
      });
      setSuccess(true);
    } catch (err: any) {
      setApiError(err.message ?? "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="mb-4 text-5xl">✉️</div>
          <h1 className="mb-2 text-2xl font-bold text-stone-900 dark:text-white">
            Check your email
          </h1>
          <p className="mb-6 text-stone-600 dark:text-stone-400">
            We've sent a verification link to{" "}
            <strong>{form.email}</strong>. Click the link to activate
            your account before logging in.
          </p>
          <p className="text-sm text-stone-500">
            Already verified?{" "}
            <Link to="/login" className="text-teal-600 hover:underline dark:text-teal-400">
              Log in
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Create account</h1>
        <p className="mt-1 text-stone-500">
          Already have an account?{" "}
          <Link to="/login" className="text-teal-600 hover:underline dark:text-teal-400">
            Log in
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {apiError && <InlineAlert variant="error" message={apiError} />}

        <Input
          label="Full name"
          type="text"
          autoComplete="name"
          value={form.name}
          onChange={set("name")}
          error={errors.name}
          placeholder="Jane Doe"
          required
        />

        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={set("email")}
          error={errors.email}
          placeholder="jane@university.ac.tz"
          required
        />

        <Input
          label="Registration number"
          type="text"
          value={form.registrationNumber}
          onChange={set("registrationNumber")}
          error={errors.registrationNumber}
          placeholder="e.g. ODCS-01-0001-2024"
          required
        />

        <Input
          label="Phone number"
          type="tel"
          autoComplete="tel"
          value={form.phoneNumber}
          onChange={set("phoneNumber")}
          error={errors.phoneNumber}
          placeholder="+255 7XX XXX XXX"
          required
        />

        <Select
          label="Campus"
          value={form.campus}
          onChange={set("campus")}
          error={errors.campus}
          options={CAMPUS_OPTIONS}
          placeholder="Select your campus"
          required
        />

        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          value={form.password}
          onChange={set("password")}
          error={errors.password}
          hint="At least 8 characters"
          required
        />

        <Input
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          value={form.confirmPassword}
          onChange={set("confirmPassword")}
          error={errors.confirmPassword}
          required
        />

        <Button type="submit" loading={loading} size="lg" className="mt-2 w-full">
          Create account
        </Button>
      </form>
    </div>
  );
}
