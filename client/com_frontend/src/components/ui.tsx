import type { ReactNode } from "react";

// ─── LoadingSpinner ───────────────────────────────────────────────────────────

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({ size = "md", className = "" }: SpinnerProps) {
  const sz = { sm: "h-4 w-4", md: "h-8 w-8", lg: "h-12 w-12" }[size];
  return (
    <div
      className={`animate-spin rounded-full border-2 border-stone-200 border-t-teal-500 ${sz} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}

export function PageLoader() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: string; // emoji
}

export function EmptyState({ title, description, action, icon = "🗂️" }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 text-5xl">{icon}</div>
      <h3 className="mb-2 text-lg font-medium text-stone-800 dark:text-stone-200">
        {title}
      </h3>
      {description && (
        <p className="mb-6 max-w-sm text-sm text-stone-500">{description}</p>
      )}
      {action}
    </div>
  );
}

// ─── ErrorMessage ─────────────────────────────────────────────────────────────

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({
  title = "Something went wrong",
  message,
  onRetry,
}: ErrorMessageProps) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-950/40">
      <p className="font-medium text-red-700 dark:text-red-400">{title}</p>
      <p className="mt-1 text-sm text-red-600 dark:text-red-500">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 text-sm font-medium text-red-700 underline hover:no-underline dark:text-red-400"
        >
          Try again
        </button>
      )}
    </div>
  );
}

// ─── InlineAlert ──────────────────────────────────────────────────────────────

type AlertVariant = "error" | "success" | "warning" | "info";

interface AlertProps {
  variant: AlertVariant;
  message: string;
}

const ALERT_STYLES: Record<AlertVariant, string> = {
  error: "bg-red-50 border-red-200 text-red-700 dark:bg-red-950/40 dark:border-red-800 dark:text-red-400",
  success: "bg-teal-50 border-teal-200 text-teal-700 dark:bg-teal-950/40 dark:border-teal-800 dark:text-teal-400",
  warning: "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-400",
  info: "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-400",
};

export function InlineAlert({ variant, message }: AlertProps) {
  return (
    <div
      className={`rounded-lg border px-4 py-3 text-sm font-medium ${ALERT_STYLES[variant]}`}
      role="alert"
    >
      {message}
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────

interface BadgeProps {
  label: string;
  variant?: "default" | "teal" | "amber" | "red" | "stone";
}

const BADGE_STYLES: Record<string, string> = {
  default: "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300",
  teal: "bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300",
  amber: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  red: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
  stone: "bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400",
};

export function Badge({ label, variant = "default" }: BadgeProps) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${BADGE_STYLES[variant]}`}
    >
      {label}
    </span>
  );
}

// ─── Button ───────────────────────────────────────────────────────────────────

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: ReactNode;
}

const BTN_BASE =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed";

const BTN_VARIANTS = {
  primary: "bg-teal-500 text-white hover:bg-teal-600 active:bg-teal-700",
  secondary:
    "border border-stone-300 bg-white text-stone-700 hover:bg-stone-50 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700",
  ghost: "text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800",
  danger: "bg-red-500 text-white hover:bg-red-600 active:bg-red-700",
};

const BTN_SIZES = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`${BTN_BASE} ${BTN_VARIANTS[variant]} ${BTN_SIZES[size]} ${props.className ?? ""}`}
    >
      {loading && <LoadingSpinner size="sm" />}
      {children}
    </button>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-stone-700 dark:text-stone-300"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        {...props}
        className={`rounded-lg border px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 transition-colors
          focus:outline-none focus:ring-2 focus:ring-teal-500
          dark:bg-stone-800 dark:text-stone-100 dark:placeholder:text-stone-500
          ${
            error
              ? "border-red-400 focus:ring-red-500"
              : "border-stone-300 dark:border-stone-600"
          }
          ${props.className ?? ""}`}
      />
      {hint && !error && (
        <p className="text-xs text-stone-500">{hint}</p>
      )}
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

// ─── Select ───────────────────────────────────────────────────────────────────

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function Select({ label, error, options, placeholder, id, ...props }: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={selectId}
          className="text-sm font-medium text-stone-700 dark:text-stone-300"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        {...props}
        className={`rounded-lg border px-3 py-2 text-sm text-stone-900 transition-colors
          focus:outline-none focus:ring-2 focus:ring-teal-500
          dark:bg-stone-800 dark:text-stone-100
          ${
            error
              ? "border-red-400 focus:ring-red-500"
              : "border-stone-300 dark:border-stone-600"
          }
          ${props.className ?? ""}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

// ─── Textarea ─────────────────────────────────────────────────────────────────

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, id, ...props }: TextareaProps) {
  const taId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={taId}
          className="text-sm font-medium text-stone-700 dark:text-stone-300"
        >
          {label}
        </label>
      )}
      <textarea
        id={taId}
        {...props}
        className={`rounded-lg border px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 resize-y transition-colors
          focus:outline-none focus:ring-2 focus:ring-teal-500
          dark:bg-stone-800 dark:text-stone-100 dark:placeholder:text-stone-500
          ${
            error
              ? "border-red-400 focus:ring-red-500"
              : "border-stone-300 dark:border-stone-600"
          }
          ${props.className ?? ""}`}
      />
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export function Card({ children, className = "", onClick, hoverable = false }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900
        ${hoverable ? "cursor-pointer transition-shadow hover:shadow-md" : ""}
        ${className}`}
    >
      {children}
    </div>
  );
}

// ─── Condition Badge helper ───────────────────────────────────────────────────

export function conditionVariant(
  condition: string
): "teal" | "amber" | "red" | "default" {
  if (condition === "New") return "teal";
  if (condition === "Used - Like New") return "teal";
  if (condition === "Used - Good") return "amber";
  if (condition === "Used - Fair") return "red";
  return "default";
}