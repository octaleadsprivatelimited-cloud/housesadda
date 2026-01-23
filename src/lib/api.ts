// Determine API base URL based on environment
const getApiBaseUrl = () => {
  // If VITE_API_URL is explicitly set, use it
  if (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL !== 'http://localhost:3001/api') {
    return import.meta.env.VITE_API_URL;
  }
  
  // Check if we're in production (not localhost)
  const isProduction = window.location.hostname !== 'localhost' && 
                       window.location.hostname !== '127.0.0.1' &&
                       !window.location.hostname.startsWith('192.168.');
  
  // In production, use relative URL to avoid localhost issues
  // This assumes the API is on the same domain or proxied via Vercel
  if (isProduction) {
    console.log('🌐 Using relative API URL for production');
    return '/api';
  }
  
  // In development, use localhost
  console.log('🌐 Using localhost API URL for development');
  return 'http://localhost:3001/api';
};

const API_BASE_URL = getApiBaseUrl();
console.log('🔗 API Base URL:', API_BASE_URL);

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

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      // Create error object with detailed message
      const error = new Error(data.error || data.message || `HTTP error! status: ${response.status}`);
      (error as any).error = data.error || data.message || `Request failed with status ${response.status}`;
      (error as any).message = data.error || data.message || `Request failed with status ${response.status}`;
      (error as any).status = response.status;
      throw error;
    }

    return data;
  } catch (error: any) {
    console.error('API request error:', error);
    // If it's already our custom error, re-throw it
    if (error.error || error.message) {
      throw error;
    }
    // Otherwise, create a user-friendly error
    const friendlyError = new Error(error.message || 'Network error. Please check your connection.');
    (friendlyError as any).error = error.message || 'Network error. Please check your connection.';
    throw friendlyError;
  }
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
  
  updateCredentials: async (currentPassword: string, newUsername?: string, newPassword?: string) => {
    return apiRequest('/auth/update-credentials', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newUsername, newPassword }),
    });
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

