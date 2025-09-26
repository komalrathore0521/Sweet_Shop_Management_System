const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:8081/api';

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

   private async handleResponse<T>(response: Response): Promise<T | null> {
         if (!response.ok) {
           if (response.status === 401) {
             localStorage.removeItem('token');
             localStorage.removeItem('user');
             window.location.href = '/login';
           }

           const error = await response.json().catch(() => ({ message: 'An error occurred' }));
           throw new Error(error.message || `HTTP ${response.status}`);
         }

         const contentLength = response.headers.get('content-length');
         if (contentLength === '0' || response.status === 204) {
             return null;
         }

         const contentType = response.headers.get('content-type');
         if (contentType && !contentType.includes('application/json')) {
             return null;
         }

         return response.json();
       }

  // Auth endpoints
  async login(username: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await this.handleResponse<{ token: string }>(response);
    return data;
  }

  async register(username: string, email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });

    return this.handleResponse(response);
  }

  // Sweets endpoints
  async getSweets() {
    const response = await fetch(`${API_BASE_URL}/sweets`, {
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<any[]>(response);
  }

  async searchSweets(filters: any) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await fetch(`${API_BASE_URL}/sweets/search?${params}`, {
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<any[]>(response);
  }

  async createSweet(sweet: Omit<any, 'id'>) {
    const response = await fetch(`${API_BASE_URL}/sweets`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(sweet),
    });

    return this.handleResponse(response);
  }

  async updateSweet(id: string, sweet: Partial<any>) {
    const response = await fetch(`${API_BASE_URL}/sweets/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(sweet),
    });

    return this.handleResponse(response);
  }

  async deleteSweet(id: string) {
    const response = await fetch(`${API_BASE_URL}/sweets/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse(response);
  }

  // Inventory endpoints
  async purchaseSweet(id: string) {
    const response = await fetch(`${API_BASE_URL}/sweets/${id}/purchase`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse(response);
  }

  async restockSweet(id: string, quantity: number) {
    const response = await fetch(`${API_BASE_URL}/sweets/${id}/restock`, {
      method: 'POST',
      headers: {...this.getAuthHeaders(),'Content-Type': 'application/json', },
      body: JSON.stringify({ quantity }),
    });

    return this.handleResponse(response);
  }
}

export const apiService = new ApiService();