const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper function to get auth token
const getAuthToken = (): string | null => {
  const session = localStorage.getItem('adminSession');
  if (session) {
    const parsed = JSON.parse(session);
    return parsed.token || null;
  }
  return null;
};

// Helper function for API requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
};

// Auth API
export const authAPI = {
  login: async (username: string, password: string) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    return response;
  },

  verifyToken: async () => {
    return apiRequest('/auth/verify');
  },
  verify: async () => {
    return apiRequest('/auth/verify');
  },
};

// Properties API
export const propertiesAPI = {
  getAll: async (params?: {
    search?: string;
    type?: string;
    city?: string;
    area?: string;
    featured?: boolean;
    active?: boolean;
    transactionType?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // Convert boolean to string 'true' or 'false'
          const stringValue = typeof value === 'boolean' ? String(value) : String(value);
          queryParams.append(key, stringValue);
        }
      });
    }
    const query = queryParams.toString();
    const url = `/properties${query ? `?${query}` : ''}`;
    console.log('🌐 API Call:', url);
    return apiRequest(url);
  },

  getById: async (id: string) => {
    return apiRequest(`/properties/${id}`);
  },

  create: async (property: any) => {
    return apiRequest('/properties', {
      method: 'POST',
      body: JSON.stringify(property),
    });
  },

  update: async (id: string, property: any) => {
    return apiRequest(`/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(property),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/properties/${id}`, {
      method: 'DELETE',
    });
  },

  toggleFeatured: async (id: string, isFeatured: boolean) => {
    return apiRequest(`/properties/${id}/featured`, {
      method: 'PATCH',
      body: JSON.stringify({ isFeatured }),
    });
  },

  toggleActive: async (id: string, isActive: boolean) => {
    return apiRequest(`/properties/${id}/active`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    });
  },
};

// Locations API
export const locationsAPI = {
  getAll: async (city?: string) => {
    const query = city ? `?city=${city}` : '';
    return apiRequest(`/locations${query}`);
  },

  create: async (location: { name: string; city: string }) => {
    return apiRequest('/locations', {
      method: 'POST',
      body: JSON.stringify(location),
    });
  },

  update: async (id: number, location: { name: string; city: string }) => {
    return apiRequest(`/locations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(location),
    });
  },

  delete: async (id: number) => {
    return apiRequest(`/locations/${id}`, {
      method: 'DELETE',
    });
  },
};

// Types API
export const typesAPI = {
  getAll: async () => {
    return apiRequest('/types');
  },

  create: async (name: string) => {
    return apiRequest('/types', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  },

  update: async (id: number, name: string) => {
    return apiRequest(`/types/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name }),
    });
  },

  delete: async (id: number) => {
    return apiRequest(`/types/${id}`, {
      method: 'DELETE',
    });
  },
};

