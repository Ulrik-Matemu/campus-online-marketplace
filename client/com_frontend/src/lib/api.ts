import type {
  RegisterPayload,
  LoginPayload,
  LoginResponse,
  MessageResponse,
  ProductSummary,
  ProductDetail,
  CreateProductPayload,
  UpdateProductPayload,
  ServiceSummary,
  ServiceDetail,
  CreateServicePayload,
  UpdateServicePayload,
  SearchParams,
  SearchResultItem,
  ApiError,
} from "../types/api";

// ─── Config ──────────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api/v1";

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  // Don't set Content-Type for FormData — browser sets it with boundary
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const body = await res.json();
      message = body.message ?? message;
    } catch {
      // swallow JSON parse errors
    }
    const error: ApiError = { message, status: res.status };
    throw error;
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

// ─── Auth API ─────────────────────────────────────────────────────────────────

export const authApi = {
  register(payload: RegisterPayload): Promise<MessageResponse> {
    return request("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Note: backend verifies and returns JSON, not a redirect.
   * The frontend handles this by hitting this URL directly (or via link in email).
   */
  verify(token: string): Promise<MessageResponse> {
    return request(`/auth/verify/${token}`);
  },

  login(payload: LoginPayload): Promise<LoginResponse> {
    return request("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};

// ─── Products API ─────────────────────────────────────────────────────────────

export const productsApi = {
  list(): Promise<ProductSummary[]> {
    return request("/products");
  },

  get(id: string): Promise<ProductDetail> {
    return request(`/products/${id}`);
  },

  /**
   * NOTE: Backend has a route-order bug where /:id captures /user/:userId.
   * This endpoint may silently fail or return wrong data until backend is fixed.
   * We gracefully handle this by catching the error and returning an empty array.
   */
  async listByUser(userId: string): Promise<ProductSummary[]> {
    try {
      return await request(`/products/user/${userId}`);
    } catch {
      console.warn(
        "[productsApi.listByUser] Endpoint may be broken due to route ordering bug. Returning empty array."
      );
      return [];
    }
  },

  create(payload: CreateProductPayload, token: string): Promise<ProductDetail> {
    const form = new FormData();
    form.append("title", payload.title);
    form.append("description", payload.description);
    form.append("category", payload.category);
    form.append("price", String(payload.price));
    form.append("condition", payload.condition);
    payload.images.forEach((file) => form.append("images", file));

    return request(
      "/products",
      { method: "POST", body: form },
      token
    );
  },

  update(
    id: string,
    payload: UpdateProductPayload,
    token: string
  ): Promise<ProductDetail> {
    return request(
      `/products/${id}`,
      { method: "PUT", body: JSON.stringify(payload) },
      token
    );
  },

  delete(id: string, token: string): Promise<MessageResponse> {
    return request(`/products/${id}`, { method: "DELETE" }, token);
  },
};

// ─── Services API ─────────────────────────────────────────────────────────────

export const servicesApi = {
  list(): Promise<ServiceSummary[]> {
    return request("/services");
  },

  get(id: string): Promise<ServiceDetail> {
    return request(`/services/${id}`);
  },

  /**
   * Same route-order bug as products. Silently returns empty array on failure.
   */
  async listByUser(userId: string): Promise<ServiceSummary[]> {
    try {
      return await request(`/services/user/${userId}`);
    } catch {
      console.warn(
        "[servicesApi.listByUser] Endpoint may be broken due to route ordering bug. Returning empty array."
      );
      return [];
    }
  },

  create(
    payload: CreateServicePayload,
    token: string
  ): Promise<ServiceDetail> {
    return request(
      "/services",
      { method: "POST", body: JSON.stringify(payload) },
      token
    );
  },

  update(
    id: string,
    payload: UpdateServicePayload,
    token: string
  ): Promise<ServiceDetail> {
    return request(
      `/services/${id}`,
      { method: "PUT", body: JSON.stringify(payload) },
      token
    );
  },

  delete(id: string, token: string): Promise<MessageResponse> {
    return request(`/services/${id}`, { method: "DELETE" }, token);
  },
};

// ─── Search API ───────────────────────────────────────────────────────────────

export const searchApi = {
  /**
   * Normalises mixed results — backend returns raw objects without a type tag,
   * so we discriminate using the presence of `price` (product) vs `rate` (service).
   *
   * KNOWN QUIRK: When type is omitted, minPrice/maxPrice won't filter services
   * correctly because backend uses `rate` for services, not `price`.
   * We filter services client-side to compensate.
   */
  async search(params: SearchParams): Promise<SearchResultItem[]> {
    const qs = new URLSearchParams();
    if (params.keyword) qs.set("keyword", params.keyword);
    if (params.category) qs.set("category", params.category);
    if (params.type) qs.set("type", params.type);
    if (params.minPrice !== undefined)
      qs.set("minPrice", String(params.minPrice));
    if (params.maxPrice !== undefined)
      qs.set("maxPrice", String(params.maxPrice));

    const raw: (ProductSummary | ServiceSummary)[] = await request(
      `/search?${qs.toString()}`
    );

    // Tag each result and apply client-side rate filter for mixed searches
    const tagged = raw.map((item): SearchResultItem => {
      if ("price" in item) {
        return { ...item, _type: "product" } as SearchResultItem;
      }
      return { ...item, _type: "service" } as SearchResultItem;
    });

    // Client-side compensation for mixed search price/rate bug
    if (!params.type && (params.minPrice !== undefined || params.maxPrice !== undefined)) {
      return tagged.filter((item) => {
        if (item._type === "service") {
          const rate = item.rate;
          if (params.minPrice !== undefined && rate < params.minPrice) return false;
          if (params.maxPrice !== undefined && rate > params.maxPrice) return false;
        }
        return true;
      });
    }

    return tagged;
  },
};

// ─── Health ───────────────────────────────────────────────────────────────────

export const healthApi = {
  check(): Promise<{ status: string }> {
    return request("/health");
  },
};
