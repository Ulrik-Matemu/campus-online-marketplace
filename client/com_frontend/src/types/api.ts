// ─── Auth ────────────────────────────────────────────────────────────────────

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  registrationNumber: string;
  phoneNumber: string;
  campus: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  role: "student" | "admin";
  campus: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
  message: string;
}

export interface MessageResponse {
  message: string;
}

// ─── Owner / Provider ────────────────────────────────────────────────────────

/** Populated in list views (no phoneNumber) */
export interface OwnerSummary {
  _id: string;
  name: string;
  campus: string;
}

/** Populated in detail views (includes phoneNumber) */
export interface OwnerDetail extends OwnerSummary {
  phoneNumber: string;
}

// ─── Product ─────────────────────────────────────────────────────────────────

export type ProductCondition =
  | "New"
  | "Used - Like New"
  | "Used - Good"
  | "Used - Fair";

export interface ProductImage {
  url: string;
  public_id: string;
}

/** Shape returned from GET /products (owner is OwnerSummary) */
export interface ProductSummary {
  _id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  condition: ProductCondition;
  images: ProductImage[];
  owner: OwnerSummary;
  createdAt: string;
  updatedAt: string;
}

/** Shape returned from GET /products/:id (owner is OwnerDetail) */
export interface ProductDetail extends Omit<ProductSummary, "owner"> {
  owner: OwnerDetail;
}

export interface CreateProductPayload {
  title: string;
  description: string;
  category: string;
  price: number;
  condition: ProductCondition;
  images: File[]; // sent as multipart/form-data
}

export interface UpdateProductPayload {
  title?: string;
  description?: string;
  category?: string;
  price?: number;
  condition?: ProductCondition;
}

// ─── Service ─────────────────────────────────────────────────────────────────

export type RateType = "hourly" | "fixed";

/** Shape returned from GET /services (provider is OwnerSummary) */
export interface ServiceSummary {
  _id: string;
  title: string;
  description: string;
  category: string;
  rate: number;
  rateType: RateType;
  provider: OwnerSummary;
  createdAt: string;
  updatedAt: string;
}

/** Shape returned from GET /services/:id (provider is OwnerDetail) */
export interface ServiceDetail extends Omit<ServiceSummary, "provider"> {
  provider: OwnerDetail;
}

export interface CreateServicePayload {
  title: string;
  description: string;
  category: string;
  rate: number;
  rateType: RateType;
}

export interface UpdateServicePayload extends Partial<CreateServicePayload> {}

// ─── Search ──────────────────────────────────────────────────────────────────

export interface SearchParams {
  keyword?: string;
  category?: string;
  type?: "product" | "service";
  minPrice?: number;
  maxPrice?: number;
}

/**
 * Normalised frontend model for mixed search results.
 * Backend returns raw Product/Service objects; we tag them client-side.
 */
export type SearchResultItem =
  | (ProductSummary & { _type: "product" })
  | (ServiceSummary & { _type: "service" });

// ─── API Errors ──────────────────────────────────────────────────────────────

export interface ApiError {
  message: string;
  status: number;
}
