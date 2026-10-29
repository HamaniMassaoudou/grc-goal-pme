// API Service for Django Backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface LoginResponse {
  access: string;
  refresh: string;
  user: any;
}

class ApiService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    // Load tokens from localStorage
    this.accessToken = localStorage.getItem('access_token');
    this.refreshToken = localStorage.getItem('refresh_token');
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const url = `${API_URL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401 && this.refreshToken) {
      // Try to refresh token
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        headers['Authorization'] = `Bearer ${this.accessToken}`;
        return fetch(url, { ...options, headers });
      }
    }

    return response;
  }

  private async refreshAccessToken(): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/auth/users/logout/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: this.refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        this.accessToken = data.access;
        this.refreshToken = data.refresh;
        localStorage.setItem('access_token', this.accessToken);
        localStorage.setItem('refresh_token', this.refreshToken);
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }
    
    this.clearTokens();
    return false;
  }

  private clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  // Authentication
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await this.request('/auth/users/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    this.accessToken = data.access;
    this.refreshToken = data.refresh;
    localStorage.setItem('access_token', this.accessToken);
    localStorage.setItem('refresh_token', this.refreshToken);
    return data;
  }

  async logout(): Promise<void> {
    if (this.refreshToken) {
      await this.request('/auth/users/logout/', {
        method: 'POST',
        body: JSON.stringify({ refresh: this.refreshToken }),
      });
    }
    this.clearTokens();
  }

  // Organizations
  async getOrganizations() {
    const response = await this.request('/organizations/');
    return response.json();
  }

  async createOrganization(data: any) {
    const response = await this.request('/organizations/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async updateOrganization(id: string, data: any) {
    const response = await this.request(`/organizations/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return response.json();
  }

  // Users
  async getUsers() {
    const response = await this.request('/auth/users/');
    return response.json();
  }

  async createUser(data: any) {
    const response = await this.request('/auth/users/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async updateUser(id: string, data: any) {
    const response = await this.request(`/auth/users/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async deleteUser(id: string) {
    const response = await this.request(`/auth/users/${id}/`, {
      method: 'DELETE',
    });
    return response.ok;
  }

  // Roles
  async getRoles() {
    const response = await this.request('/auth/roles/');
    return response.json();
  }

  async createRole(data: any) {
    const response = await this.request('/auth/roles/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async updateRole(id: string, data: any) {
    const response = await this.request(`/auth/roles/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async deleteRole(id: string) {
    const response = await this.request(`/auth/roles/${id}/`, {
      method: 'DELETE',
    });
    return response.ok;
  }

  // Collaborators
  async getCollaborators() {
    const response = await this.request('/collaborators/');
    return response.json();
  }

  async createCollaborator(data: any) {
    const response = await this.request('/collaborators/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async updateCollaborator(id: string, data: any) {
    const response = await this.request(`/collaborators/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async deleteCollaborator(id: string) {
    const response = await this.request(`/collaborators/${id}/`, {
      method: 'DELETE',
    });
    return response.ok;
  }

  // Assets
  async getAssets() {
    const response = await this.request('/assets/');
    return response.json();
  }

  async createAsset(data: any) {
    const response = await this.request('/assets/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async updateAsset(id: string, data: any) {
    const response = await this.request(`/assets/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async deleteAsset(id: string) {
    const response = await this.request(`/assets/${id}/`, {
      method: 'DELETE',
    });
    return response.ok;
  }

  // Risks
  async getRisks() {
    const response = await this.request('/risks/');
    return response.json();
  }

  async createRisk(data: any) {
    const response = await this.request('/risks/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async updateRisk(id: string, data: any) {
    const response = await this.request(`/risks/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async deleteRisk(id: string) {
    const response = await this.request(`/risks/${id}/`, {
      method: 'DELETE',
    });
    return response.ok;
  }

  // SoA Controls
  async getSoaControls() {
    const response = await this.request('/soa-controls/');
    return response.json();
  }

  async createSoaControl(data: any) {
    const response = await this.request('/soa-controls/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async updateSoaControl(id: string, data: any) {
    const response = await this.request(`/soa-controls/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async deleteSoaControl(id: string) {
    const response = await this.request(`/soa-controls/${id}/`, {
      method: 'DELETE',
    });
    return response.ok;
  }

  // Actions
  async getActions() {
    const response = await this.request('/actions/');
    return response.json();
  }

  async createAction(data: any) {
    const response = await this.request('/actions/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async updateAction(id: string, data: any) {
    const response = await this.request(`/actions/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async deleteAction(id: string) {
    const response = await this.request(`/actions/${id}/`, {
      method: 'DELETE',
    });
    return response.ok;
  }

  // Notifications
  async getNotifications() {
    const response = await this.request('/notifications/');
    return response.json();
  }

  async markNotificationAsRead(id: string) {
    const response = await this.request(`/notifications/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify({ is_read: true, read_at: new Date().toISOString() }),
    });
    return response.json();
  }

  // Audit Logs
  async getAuditLogs() {
    const response = await this.request('/auth/audit-logs/');
    return response.json();
  }

  // Sessions
  async getSessions() {
    const response = await this.request('/auth/sessions/');
    return response.json();
  }

  async revokeSession(id: string) {
    const response = await this.request(`/auth/sessions/${id}/`, {
      method: 'DELETE',
    });
    return response.ok;
  }
}

export const apiService = new ApiService();
