// Service API complet relié au backend Python / Django et SQLite
import { 
  Risk, 
  SoAControl, 
  CorrectiveAction, 
  Asset, 
  Organization, 
  Collaborator, 
  TestProtocolLog, 
  UserTestSheet,
  EvidenceFile 
} from '../types/grc';
import { 
  UserAccount, 
  RoleDefinition, 
  SecurityAuditLog, 
  SecuritySettings 
} from '../types/auth';
import { GRCState } from './storage';
import { AppNotification } from '../types/notification';
import {
  fromApiOrg, toApiOrg,
  fromApiCollaborator, toApiCollaborator,
  fromApiAsset, toApiAsset,
  fromApiRisk, toApiRisk,
  fromApiSoA, toApiSoA,
  fromApiAction, toApiAction,
  fromApiUser, toApiUser,
  fromApiRole, toApiRole,
  fromApiNotification,
  fromApiTestProtocol, toApiTestProtocol,
  fromApiTestSheet, toApiTestSheet,
  fromApiAuditLog, toApiAuditLog,
  fromApiSecuritySettings, toApiSecuritySettings,
  fromApiEvidenceFile
} from './apiAdapter';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export class ApiService {
  private accessToken: string | null = null;
  private refreshTokenValue: string | null = null;
  private isRefreshing: boolean = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor() {
    this.accessToken = localStorage.getItem('access_token');
    this.refreshTokenValue = localStorage.getItem('refresh_token');
  }

  public async request(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const url = `${API_URL}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    try {
      let response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401 && this.refreshTokenValue && !endpoint.includes('/login')) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          headers['Authorization'] = `Bearer ${this.accessToken}`;
          response = await fetch(url, { ...options, headers });
        }
      }

      return response;
    } catch (err) {
      console.warn(`Erreur réseau lors de l'appel à ${url}:`, err);
      throw err;
    }
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (this.isRefreshing) {
      return new Promise<boolean>((resolve) => {
        this.refreshSubscribers.push((token: string) => {
          resolve(Boolean(token));
        });
      });
    }

    this.isRefreshing = true;

    try {
      const response = await fetch(`${API_URL}/auth/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: this.refreshTokenValue }),
      });

      if (response.ok) {
        const data = await response.json();
        this.accessToken = data.access;
        localStorage.setItem('access_token', this.accessToken!);

        // Notifier tous les abonnés en attente
        this.refreshSubscribers.forEach(callback => callback(this.accessToken!));
        this.refreshSubscribers = [];

        return true;
      }
    } catch (error) {
      console.error('Échec du rafraîchissement du token:', error);
    } finally {
      this.isRefreshing = false;
      // Notifier les abonnés en cas d'échec
      this.refreshSubscribers.forEach(callback => callback(''));
      this.refreshSubscribers = [];
    }

    this.clearTokens();
    return false;
  }

  // Méthode publique pour vérifier et rafraîchir le token
  public async refreshToken(): Promise<void> {
    if (!this.refreshTokenValue) {
      throw new Error('Aucun refresh token disponible');
    }
    const refreshed = await this.refreshAccessToken();
    if (!refreshed) {
      throw new Error('Échec du rafraîchissement du token');
    }
  }

  public clearTokens() {
    this.accessToken = null;
    this.refreshTokenValue = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  public setTokens(access: string, refresh: string) {
    this.accessToken = access;
    this.refreshTokenValue = refresh;
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
  }

  public isAuthenticated(): boolean {
    return Boolean(this.accessToken);
  }

  // ==================== AUTHENTIFICATION ====================
  async login(email: string, password: string): Promise<{ user: UserAccount; access: string; refresh: string }> {
    const response = await this.request('/auth/users/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Identifiants invalides');
    }

    const data = await response.json();
    this.setTokens(data.access, data.refresh);
    return {
      user: fromApiUser(data.user),
      access: data.access,
      refresh: data.refresh
    };
  }

  async logout(): Promise<void> {
    if (this.refreshToken) {
      await this.request('/auth/users/logout/', {
        method: 'POST',
        body: JSON.stringify({ refresh: this.refreshToken }),
      }).catch(() => {});
    }
    this.clearTokens();
  }

  // Helper pour extraire les tableaux depuis DRF (supportant pagination ou array direct)
  private extractArray<T>(data: any): T[] {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.results)) return data.results;
    return [];
  }

  // ==================== ORGANISATIONS ====================
  async getOrganizations(): Promise<Organization[]> {
    const response = await this.request('/organizations/');
    if (!response.ok) throw new Error('Impossible de charger les organisations');
    const data = await response.json();
    return this.extractArray<any>(data).map(fromApiOrg);
  }

  async createOrganization(org: Partial<Organization>): Promise<Organization> {
    const response = await this.request('/organizations/', {
      method: 'POST',
      body: JSON.stringify(toApiOrg(org)),
    });
    if (!response.ok) throw new Error('Échec de création de l\'organisation');
    const data = await response.json();
    return fromApiOrg(data);
  }

  async updateOrganization(id: string, org: Partial<Organization>): Promise<Organization> {
    const response = await this.request(`/organizations/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(toApiOrg(org)),
    });
    if (!response.ok) throw new Error('Échec de mise à jour de l\'organisation');
    const data = await response.json();
    return fromApiOrg(data);
  }

  // ==================== COLLABORATEURS ====================
  async getCollaborators(orgId?: string): Promise<Collaborator[]> {
    const endpoint = orgId ? `/collaborators/?organization=${orgId}` : '/collaborators/';
    const response = await this.request(endpoint);
    if (!response.ok) throw new Error('Impossible de charger les collaborateurs');
    const data = await response.json();
    return this.extractArray<any>(data).map(fromApiCollaborator);
  }

  async createCollaborator(collab: Partial<Collaborator>): Promise<Collaborator> {
    const response = await this.request('/collaborators/', {
      method: 'POST',
      body: JSON.stringify(toApiCollaborator(collab)),
    });
    if (!response.ok) throw new Error('Échec d\'ajout du collaborateur');
    const data = await response.json();
    return fromApiCollaborator(data);
  }

  async updateCollaborator(id: string, collab: Partial<Collaborator>): Promise<Collaborator> {
    const response = await this.request(`/collaborators/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(toApiCollaborator(collab)),
    });
    if (!response.ok) throw new Error('Échec de mise à jour du collaborateur');
    const data = await response.json();
    return fromApiCollaborator(data);
  }

  async deleteCollaborator(id: string): Promise<boolean> {
    const response = await this.request(`/collaborators/${id}/`, { method: 'DELETE' });
    return response.ok;
  }

  // ==================== UTILISATEURS (IAM) ====================
  async getUsers(): Promise<UserAccount[]> {
    const response = await this.request('/auth/users/');
    if (!response.ok) throw new Error('Impossible de charger les utilisateurs');
    const data = await response.json();
    return this.extractArray<any>(data).map(fromApiUser);
  }

  async createUser(user: Partial<UserAccount>, plainPassword?: string): Promise<UserAccount> {
    const response = await this.request('/auth/users/', {
      method: 'POST',
      body: JSON.stringify(toApiUser(user, plainPassword)),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.detail || errorData.error || errorData.message || 'Échec de création du compte utilisateur';
      throw new Error(errorMsg);
    }
    const data = await response.json();
    return fromApiUser(data);
  }

  async updateUser(id: string, user: Partial<UserAccount>): Promise<UserAccount> {
    const response = await this.request(`/auth/users/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(toApiUser(user)),
    });
    if (!response.ok) throw new Error('Échec de mise à jour de l\'utilisateur');
    const data = await response.json();
    return fromApiUser(data);
  }

  async deleteUser(id: string): Promise<boolean> {
    const response = await this.request(`/auth/users/${id}/`, { method: 'DELETE' });
    return response.ok;
  }

  // ==================== RÔLES RBAC ====================
  async getRoles(): Promise<RoleDefinition[]> {
    const response = await this.request('/auth/roles/');
    if (!response.ok) throw new Error('Impossible de charger les rôles');
    const data = await response.json();
    return this.extractArray<any>(data).map(fromApiRole);
  }

  async createRole(role: Partial<RoleDefinition>): Promise<RoleDefinition> {
    const response = await this.request('/auth/roles/', {
      method: 'POST',
      body: JSON.stringify(toApiRole(role)),
    });
    if (!response.ok) throw new Error('Échec de création du rôle');
    const data = await response.json();
    return fromApiRole(data);
  }

  async updateRole(id: string, role: Partial<RoleDefinition>): Promise<RoleDefinition> {
    const response = await this.request(`/auth/roles/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(toApiRole(role)),
    });
    if (!response.ok) throw new Error('Échec de modification du rôle');
    const data = await response.json();
    return fromApiRole(data);
  }

  async deleteRole(id: string): Promise<boolean> {
    const response = await this.request(`/auth/roles/${id}/`, { method: 'DELETE' });
    return response.ok;
  }

  // ==================== ACTIFS ====================
  async getAssets(orgId?: string): Promise<Asset[]> {
    const endpoint = orgId ? `/assets/?organization=${orgId}` : '/assets/';
    const response = await this.request(endpoint);
    if (!response.ok) throw new Error('Impossible de charger les actifs');
    const data = await response.json();
    return this.extractArray<any>(data).map(fromApiAsset);
  }

  async createAsset(asset: Partial<Asset>): Promise<Asset> {
    const response = await this.request('/assets/', {
      method: 'POST',
      body: JSON.stringify(toApiAsset(asset)),
    });
    if (!response.ok) throw new Error('Échec de création de l\'actif');
    const data = await response.json();
    return fromApiAsset(data);
  }

  async updateAsset(id: string, asset: Partial<Asset>): Promise<Asset> {
    const response = await this.request(`/assets/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(toApiAsset(asset)),
    });
    if (!response.ok) throw new Error('Échec de mise à jour de l\'actif');
    const data = await response.json();
    return fromApiAsset(data);
  }

  async deleteAsset(id: string): Promise<boolean> {
    const response = await this.request(`/assets/${id}/`, { method: 'DELETE' });
    return response.ok;
  }

  // ==================== RISQUES ====================
  async getRisks(orgId?: string): Promise<Risk[]> {
    const endpoint = orgId ? `/risks/?organization=${orgId}` : '/risks/';
    const response = await this.request(endpoint);
    if (!response.ok) throw new Error('Impossible de charger les risques');
    const data = await response.json();
    return this.extractArray<any>(data).map(fromApiRisk);
  }

  async createRisk(risk: Partial<Risk>): Promise<Risk> {
    const response = await this.request('/risks/', {
      method: 'POST',
      body: JSON.stringify(toApiRisk(risk)),
    });
    if (!response.ok) throw new Error('Échec de création du risque');
    const data = await response.json();
    return fromApiRisk(data);
  }

  async updateRisk(id: string, risk: Partial<Risk>): Promise<Risk> {
    const response = await this.request(`/risks/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(toApiRisk(risk)),
    });
    if (!response.ok) throw new Error('Échec de modification du risque');
    const data = await response.json();
    return fromApiRisk(data);
  }

  async deleteRisk(id: string): Promise<boolean> {
    const response = await this.request(`/risks/${id}/`, { method: 'DELETE' });
    return response.ok;
  }

  // ==================== SoA CONTROLS (ISO 27001) ====================
  async getSoaControls(orgId?: string): Promise<SoAControl[]> {
    const endpoint = orgId ? `/soa-controls/?organization=${orgId}` : '/soa-controls/';
    const response = await this.request(endpoint);
    if (!response.ok) throw new Error('Impossible de charger la SoA');
    const data = await response.json();
    return this.extractArray<any>(data).map(fromApiSoA);
  }

  async updateSoaControl(id: string, control: Partial<SoAControl>): Promise<SoAControl> {
    const response = await this.request(`/soa-controls/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(toApiSoA(control)),
    });
    if (!response.ok) throw new Error('Échec de mise à jour du contrôle SoA');
    const data = await response.json();
    return fromApiSoA(data);
  }

  // ==================== ACTIONS CORRECTIVES ====================
  async getActions(orgId?: string): Promise<CorrectiveAction[]> {
    const endpoint = orgId ? `/actions/?organization=${orgId}` : '/actions/';
    const response = await this.request(endpoint);
    if (!response.ok) throw new Error('Impossible de charger les actions');
    const data = await response.json();
    return this.extractArray<any>(data).map(fromApiAction);
  }

  async createAction(action: Partial<CorrectiveAction>): Promise<CorrectiveAction> {
    const response = await this.request('/actions/', {
      method: 'POST',
      body: JSON.stringify(toApiAction(action)),
    });
    if (!response.ok) throw new Error('Échec de création de l\'action');
    const data = await response.json();
    return fromApiAction(data);
  }

  async updateAction(id: string, action: Partial<CorrectiveAction>): Promise<CorrectiveAction> {
    const response = await this.request(`/actions/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(toApiAction(action)),
    });
    if (!response.ok) throw new Error('Échec de mise à jour de l\'action');
    const data = await response.json();
    return fromApiAction(data);
  }

  async deleteAction(id: string): Promise<boolean> {
    const response = await this.request(`/actions/${id}/`, { method: 'DELETE' });
    return response.ok;
  }

  // ==================== NOTIFICATIONS ====================
  async getNotifications(): Promise<AppNotification[]> {
    const response = await this.request('/notifications/');
    if (!response.ok) return [];
    const data = await response.json();
    return this.extractArray<any>(data).map(fromApiNotification);
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await this.request(`/notifications/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify({ is_read: true, read_at: new Date().toISOString() }),
    }).catch(() => {});
  }

  // ==================== JOURNAUX D'AUDIT ====================
  async getAuditLogs(): Promise<SecurityAuditLog[]> {
    const response = await this.request('/auth/audit-logs/');
    if (!response.ok) return [];
    const data = await response.json();
    return this.extractArray<any>(data).map(fromApiAuditLog);
  }

  async createAuditLog(log: Partial<SecurityAuditLog>): Promise<void> {
    await this.request('/auth/audit-logs/', {
      method: 'POST',
      body: JSON.stringify(toApiAuditLog(log)),
    }).catch(() => {});
  }

  // ==================== PARAMÈTRES DE SÉCURITÉ ====================
  async getSecuritySettings(): Promise<SecuritySettings | null> {
    const response = await this.request('/auth/security-settings/1/');
    if (!response.ok) return null;
    const data = await response.json();
    return fromApiSecuritySettings(data);
  }

  async updateSecuritySettings(settings: Partial<SecuritySettings>): Promise<SecuritySettings> {
    const response = await this.request('/auth/security-settings/1/', {
      method: 'PATCH',
      body: JSON.stringify(toApiSecuritySettings(settings)),
    });
    if (!response.ok) throw new Error('Échec de mise à jour des paramètres de sécurité');
    const data = await response.json();
    return fromApiSecuritySettings(data);
  }

  // ==================== PROTOCOLE & FICHES DE TEST B14 ====================
  async getTestProtocol(): Promise<TestProtocolLog | null> {
    const response = await this.request('/test-protocol/');
    if (!response.ok) return null;
    const data = await response.json();
    const list = this.extractArray<any>(data);
    return list.length > 0 ? fromApiTestProtocol(list[0]) : null;
  }

  async getTestSheets(): Promise<UserTestSheet[]> {
    const response = await this.request('/test-sheets/');
    if (!response.ok) return [];
    const data = await response.json();
    return this.extractArray<any>(data).map(fromApiTestSheet);
  }

  async saveTestSheet(sheet: Partial<UserTestSheet>): Promise<UserTestSheet> {
    const payload = toApiTestSheet(sheet);
    let response: Response;
    if (sheet.id) {
      response = await this.request(`/test-sheets/${sheet.id}/`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      if (!response.ok && response.status === 404) {
        response = await this.request('/test-sheets/', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
    } else {
      response = await this.request('/test-sheets/', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }
    const data = await response.json();
    return fromApiTestSheet(data);
  }

  async deleteTestSheet(id: string): Promise<boolean> {
    const response = await this.request(`/test-sheets/${id}/`, { method: 'DELETE' });
    return response.ok;
  }

  // ==================== FICHIERS DE PREUVES ====================
  async getEvidences(linkedType?: string, linkedId?: string): Promise<EvidenceFile[]> {
    try {
      const params = new URLSearchParams();
      if (linkedType) params.append('linked_type', linkedType);
      if (linkedId) params.append('linked_id', linkedId);
      const query = params.toString() ? `?${params.toString()}` : '';
      const response = await this.request(`/evidences/${query}`);
      if (!response.ok) return [];
      const data = await response.json();
      return this.extractArray<any>(data).map(fromApiEvidenceFile);
    } catch (err) {
      console.warn('Erreur lors de la récupération des preuves:', err);
      return [];
    }
  }

  async uploadEvidence(
    file: File,
    linkedType: string,
    linkedId: string,
    title?: string,
    notes?: string,
    organizationId?: string
  ): Promise<EvidenceFile> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('linked_type', linkedType);
    formData.append('linked_id', linkedId);
    if (title) formData.append('title', title);
    if (notes) formData.append('notes', notes);
    if (organizationId) formData.append('organization', organizationId);

    const headers: Record<string, string> = {};
    const token = this.accessToken || localStorage.getItem('access_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_URL}/evidences/`, {
      method: 'POST',
      headers,
      body: formData
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || errData.error || 'Échec du téléversement du fichier de preuve');
    }

    const data = await res.json();
    return fromApiEvidenceFile(data);
  }

  async deleteEvidence(id: string): Promise<boolean> {
    const response = await this.request(`/evidences/${id}/`, { method: 'DELETE' });
    return response.ok;
  }

  // ==================== CHARGEMENT GLOBAL DE L'ÉTAT GRC DEPUIS SQLITE ====================
  async fetchFullGRCState(): Promise<Partial<GRCState> | null> {
    try {
      const [
        organizations,
        collaborators,
        assets,
        risks,
        soa,
        actions,
        accounts,
        roles,
        notifications,
        auditLogs,
        securitySettings,
        testProtocol,
        testSheets
      ] = await Promise.all([
        this.getOrganizations().catch(() => []),
        this.getCollaborators().catch(() => []),
        this.getAssets().catch(() => []),
        this.getRisks().catch(() => []),
        this.getSoaControls().catch(() => []),
        this.getActions().catch(() => []),
        this.getUsers().catch(() => []),
        this.getRoles().catch(() => []),
        this.getNotifications().catch(() => []),
        this.getAuditLogs().catch(() => []),
        this.getSecuritySettings().catch(() => null),
        this.getTestProtocol().catch(() => null),
        this.getTestSheets().catch(() => [])
      ]);

      if (organizations.length === 0 && accounts.length === 0) {
        return null;
      }

      return {
        ...(organizations.length > 0 ? { organizations } : {}),
        ...(collaborators.length > 0 ? { collaborators } : {}),
        ...(assets.length > 0 ? { assets } : {}),
        ...(risks.length > 0 ? { risks } : {}),
        ...(soa.length > 0 ? { soa } : {}),
        ...(actions.length > 0 ? { actions } : {}),
        ...(accounts.length > 0 ? { accounts } : {}),
        ...(roles.length > 0 ? { roles } : {}),
        ...(notifications.length > 0 ? { notifications } : {}),
        ...(auditLogs.length > 0 ? { auditLogs } : {}),
        ...(securitySettings ? { securitySettings } : {}),
        ...(testProtocol ? { testProtocol } : {}),
        ...(testSheets.length > 0 ? { testSheets } : {})
      };
    } catch (err) {
      console.warn('Backend non disponible lors du chargement initial:', err);
      return null;
    }
  }
}

export const apiService = new ApiService();
