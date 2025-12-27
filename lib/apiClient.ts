export interface ApiOptions {
  method?: string;
  body?: object;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

class ApiClient {
  private getAuthHeaders(): Record<string, string> {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        return { Authorization: `Bearer ${token}` };
      }
    }
    return {};
  }

  async request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { method = "GET", body, headers = {}, requiresAuth = true } = options;

    const requestHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      ...headers,
    };

    if (requiresAuth) {
      Object.assign(requestHeaders, this.getAuthHeaders());
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
      }

      if (response.status === 204) {
        return {} as T;
      }

      return response.json();
    } catch (error) {
      console.error(`API Error [${method} ${endpoint}]:`, error);
      throw error;
    }
  }

  get<T>(endpoint: string, requiresAuth = true): Promise<T> {
    return this.request<T>(endpoint, { method: "GET", requiresAuth });
  }

  post<T>(endpoint: string, body: object, requiresAuth = true): Promise<T> {
    return this.request<T>(endpoint, { method: "POST", body, requiresAuth });
  }

  put<T>(endpoint: string, body: object, requiresAuth = true): Promise<T> {
    return this.request<T>(endpoint, { method: "PUT", body, requiresAuth });
  }

  patch<T>(endpoint: string, body: object, requiresAuth = true): Promise<T> {
    return this.request<T>(endpoint, { method: "PATCH", body, requiresAuth });
  }

  delete<T>(endpoint: string, requiresAuth = true): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE", requiresAuth });
  }
}

export const api = new ApiClient();

// Helper functions for common operations
export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ user: any; token: string }>("/auth/login", { email, password }, false),
  
  register: (data: { name: string; email: string; phone: string; password: string }) =>
    api.post<{ user: any; token: string }>("/auth/register", data, false),
  
  getProfile: () => api.get<any>("/auth/me"),
  
  updateProfile: (data: any) => api.put<any>("/auth/profile", data),
  
  changePassword: (currentPassword: string, newPassword: string) =>
    api.put("/auth/change-password", { currentPassword, newPassword }),
  
  forgotPassword: (email: string) =>
    api.post("/auth/forgot-password", { email }, false),
  
  resetPassword: (token: string, password: string) =>
    api.post("/auth/reset-password", { token, password }, false),
};

export const productApi = {
  getAll: (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : "";
    return api.get<any>(`/products${query}`);
  },
  
  getById: (id: string) => api.get<any>(`/products/${id}`),
  
  getBySlug: (slug: string) => api.get<any>(`/products/slug/${slug}`),
  
  getRelated: (id: string) => api.get<any>(`/products/${id}/related`),
  
  getTrending: () => api.get<any>("/products/trending"),
  
  getNewArrivals: (limit = 8) => api.get<any>(`/products/new?limit=${limit}`),
  
  create: (data: any) => api.post<any>("/products", data),
  
  update: (id: string, data: any) => api.put<any>(`/products/${id}`, data),
  
  delete: (id: string) => api.delete(`/products/${id}`),
};

export const categoryApi = {
  getAll: () => api.get<any[]>("/categories"),
  
  getById: (id: string) => api.get<any>(`/categories/${id}`),
  
  create: (data: any) => api.post<any>("/categories", data),
  
  update: (id: string, data: any) => api.put<any>(`/categories/${id}`, data),
  
  delete: (id: string) => api.delete(`/categories/${id}`),
};

export const cartApi = {
  get: () => api.get<any>("/cart"),
  
  addItem: (productId: string, size: string, color: string, quantity: number) =>
    api.post<any>("/cart/items", { productId, size, color, quantity }),
  
  updateItem: (itemId: string, quantity: number) =>
    api.put<any>(`/cart/items/${itemId}`, { quantity }),
  
  removeItem: (itemId: string) => api.delete<any>(`/cart/items/${itemId}`),
  
  clear: () => api.delete("/cart/clear"),
  
  applyCoupon: (code: string) => api.post<any>("/coupons/apply", { code }),
  
  removeCoupon: () => api.post<any>("/coupons/remove", {}),
};

export const orderApi = {
  getAll: (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : "";
    return api.get<any>(`/orders${query}`);
  },
  
  getById: (id: string) => api.get<any>(`/orders/${id}`),
  
  track: (orderNumber: string) => api.get<any>(`/orders/track/${orderNumber}`),
  
  create: (data: { addressId: string; couponCode?: string }) =>
    api.post<any>("/orders", data),
  
  updateStatus: (id: string, status: string) =>
    api.put<any>(`/orders/${id}/status`, { status }),
};

export const addressApi = {
  getAll: () => api.get<any[]>("/addresses"),
  
  getById: (id: string) => api.get<any>(`/addresses/${id}`),
  
  create: (data: any) => api.post<any>("/addresses", data),
  
  update: (id: string, data: any) => api.put<any>(`/addresses/${id}`, data),
  
  delete: (id: string) => api.delete(`/addresses/${id}`),
  
  setDefault: (id: string) => api.put(`/addresses/${id}/default`, {}),
};

export const wishlistApi = {
  getAll: () => api.get<any[]>("/wishlist"),
  
  add: (productId: string) => api.post<any>("/wishlist", { productId }),
  
  remove: (productId: string) => api.delete(`/wishlist/${productId}`),
  
  check: (productId: string) => api.post<any>("/wishlist/check", { productId }),
};

export const paymentApi = {
  initiate: (orderId: string) =>
    api.post<any>("/payments/initiate", { orderId }),
  
  verify: (data: any) => api.post<any>("/payments/verify", data),
  
  getStatus: (orderId: string) => api.get<any>(`/payments/status/${orderId}`),
};

export const staffApi = {
  getAll: () => api.get<any[]>("/staff"),
  
  getById: (id: string) => api.get<any>(`/staff/${id}`),
  
  create: (data: any) => api.post<any>("/staff", data),
  
  update: (id: string, data: any) => api.put<any>(`/staff/${id}`, data),
  
  delete: (id: string) => api.delete(`/staff/${id}`),
};
