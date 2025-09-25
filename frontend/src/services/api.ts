const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:8081/api';

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }

      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await this.handleResponse<{ token: string; user: any }>(response);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  }

  async register(email: string, password: string, name?: string) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
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
  async purchaseSweet(id: string, quantity: number = 1) {
    const response = await fetch(`${API_BASE_URL}/sweets/${id}/purchase`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ quantity }),
    });

    return this.handleResponse(response);
  }

  async restockSweet(id: string, quantity: number) {
    const response = await fetch(`${API_BASE_URL}/sweets/${id}/restock`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ quantity }),
    });

    return this.handleResponse(response);
  }
}

export const apiService = new ApiService();