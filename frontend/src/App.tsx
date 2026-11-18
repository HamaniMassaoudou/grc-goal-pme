import React, { useState, useEffect, Suspense, lazy } from 'react';
import { 
  loadGRCState, 
  saveGRCState, 
  resetGRCState, 
  createAuditLogEntry,
  getActiveOrganization,
  getOrganizationsForUser,
  createNewOrganization,
  updateOrganizationInState,
  switchActiveOrganization,
  addCollaboratorToState,
  updateCollaboratorInState,
  deleteCollaboratorFromState,
  resetDemoOrganizationOnly,
  isLastActiveAdmin,
  GRCState 
} from './services/storage';
import { 
  Risk, 
  SoAControl, 
  CorrectiveAction, 
  Asset, 
  Organization, 
  Collaborator,
  TestProtocolLog,
  UserTestSheet
} from './types/grc';
import { 
  UserAccount, 
  RoleDefinition, 
  UserSession, 
  SecurityAuditLog, 
  SecuritySettings, 
  UserStatus,
  SecurityEventType 
} from './types/auth';
import { 
  hasPermission, 
  generateSalt, 
  hashPassword, 
  generateSessionToken 
} from './services/security';

// Composants communs
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';

// Vues des modules (chargement différé par Code-Splitting)
const DashboardView = lazy(() => import('./components/dashboard/DashboardView').then(m => ({ default: m.DashboardView })));
const RisksView = lazy(() => import('./components/risks/RisksView').then(m => ({ default: m.RisksView })));
const RiskModal = lazy(() => import('./components/risks/RiskModal').then(m => ({ default: m.RiskModal })));
const RiskDetailsModal = lazy(() => import('./components/risks/RiskDetailsModal').then(m => ({ default: m.RiskDetailsModal })));
const SoAView = lazy(() => import('./components/soa/SoAView').then(m => ({ default: m.SoAView })));
const SoAEditModal = lazy(() => import('./components/soa/SoAEditModal').then(m => ({ default: m.SoAEditModal })));
const ActionsView = lazy(() => import('./components/actions/ActionsView').then(m => ({ default: m.ActionsView })));
const ActionModal = lazy(() => import('./components/actions/ActionModal').then(m => ({ default: m.ActionModal })));
const AssetsView = lazy(() => import('./components/assets/AssetsView').then(m => ({ default: m.AssetsView })));
const AssetModal = lazy(() => import('./components/assets/AssetModal').then(m => ({ default: m.AssetModal })));
const GovernanceView = lazy(() => import('./components/governance/GovernanceView').then(m => ({ default: m.GovernanceView })));
const OrganizationModal = lazy(() => import('./components/governance/OrganizationModal').then(m => ({ default: m.OrganizationModal })));
const CollaboratorModal = lazy(() => import('./components/governance/CollaboratorModal').then(m => ({ default: m.CollaboratorModal })));
const TestScenarioModal = lazy(() => import('./components/testGuide/TestScenarioModal').then(m => ({ default: m.TestScenarioModal })));
const TestProtocolView = lazy(() => import('./components/testGuide/TestProtocolView').then(m => ({ default: m.TestProtocolView })));
const DocumentationView = lazy(() => import('./components/documentation/DocumentationView').then(m => ({ default: m.DocumentationView })));
const PrintableReportModal = lazy(() => import('./components/reports/PrintableReportModal').then(m => ({ default: m.PrintableReportModal })));

// Nouveaux composants IAM & Authentification
import { LoginScreen } from './components/auth/LoginScreen';
const IamView = lazy(() => import('./components/iam/IamView').then(m => ({ default: m.IamView })));
const UserModal = lazy(() => import('./components/iam/UserModal').then(m => ({ default: m.UserModal })));
const ResetPasswordModal = lazy(() => import('./components/iam/ResetPasswordModal').then(m => ({ default: m.ResetPasswordModal })));
const RoleModal = lazy(() => import('./components/iam/RoleModal').then(m => ({ default: m.RoleModal })));

// Module de Notifications
const NotificationsView = lazy(() => import('./components/notifications/NotificationsView').then(m => ({ default: m.NotificationsView })));
import { AppNotification } from './types/notification';
import { 
  getUnreadNotificationsCount, 
  markNotificationAsRead, 
  markNotificationAsUnread, 
  markAllNotificationsAsRead, 
  deleteNotification, 
  clearReadNotifications,
  dispatchRiskNotification,
  dispatchActionNotification,
  dispatchActionClosedNotification,
  dispatchSoAGapNotification,
  dispatchSecurityAlertNotification
} from './services/notifications';
import { apiService } from './services/api';

export default function App() {
  const [state, setState] = useState<GRCState>(() => loadGRCState());
  const [activeModule, setActiveModule] = useState<string>('dashboard');
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Vérification de l'authentification au chargement
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const accessToken = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');
        const userId = localStorage.getItem('user_id');

        if (!accessToken || !refreshToken) {
          setIsAuthenticated(false);
          setIsAuthChecked(true);
          return;
        }

        // Tenter de rafraîchir le token pour vérifier sa validité
        if (refreshToken) {
          await apiService.refreshToken();
        }
        
        // Si le rafraîchissement réussit, restaurer la session
        if (userId) {
          setState(prev => ({
            ...prev,
            authSession: {
              isAuthenticated: true,
              currentUserId: userId,
              currentSessionId: prev.authSession.currentSessionId,
              mfaPendingUserId: null
            }
          }));
        }
        
        setIsAuthenticated(true);
        setIsAuthChecked(true);
        
        // Rediriger vers le module demandé après login (deep linking)
        const redirectModule = localStorage.getItem('redirect_after_login');
        if (redirectModule) {
          localStorage.removeItem('redirect_after_login');
          setActiveModule(redirectModule);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Nettoyer les tokens invalides
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_id');
        setIsAuthenticated(false);
        setIsAuthChecked(true);
      }
    };

    checkAuth();
  }, []);

  // Hydratation initiale depuis le backend Django (SQLite) si disponible
  useEffect(() => {
    let isMounted = true;
    if (isAuthenticated) {
      apiService.fetchFullGRCState().then(backendData => {
        if (isMounted && backendData) {
          setState(prev => ({
            ...prev,
            ...backendData
          }));
        }
      }).catch(err => {
        console.info('Mode cache local / fallback:', err);
      });
    }
    return () => { isMounted = false; };
  }, [isAuthenticated]);

  // Utilisateur actuellement authentifié
  const currentAccount = state.accounts.find(u => u.id === state.authSession.currentUserId) || state.accounts[0];

  // Organisation active résolue
  const activeOrganization = getActiveOrganization(state);

  // Données filtrées et cloisonnées par organisation active (Cloisonnement multi-tenant)
  const scopedAssets = state.assets.filter(a => a.organizationId === activeOrganization.id || (!a.organizationId && activeOrganization.id === 'org-pme-demo'));
  const scopedRisks = state.risks.filter(r => r.organizationId === activeOrganization.id || (!r.organizationId && activeOrganization.id === 'org-pme-demo'));
  const scopedActions = state.actions.filter(a => a.organizationId === activeOrganization.id || (!a.organizationId && activeOrganization.id === 'org-pme-demo'));
  const scopedSoA = state.soa.filter(s => s.organizationId === activeOrganization.id || (!s.organizationId && activeOrganization.id === 'org-pme-demo'));
  const scopedCollaborators = state.collaborators.filter(c => c.organizationId === activeOrganization.id || (!c.organizationId && activeOrganization.id === 'org-pme-demo'));

  // Modales Organisations & Collaborateurs
  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
  const [orgModalMode, setOrgModalMode] = useState<'create' | 'edit'>('create');
  const [isCollabModalOpen, setIsCollabModalOpen] = useState(false);
  const [editingCollab, setEditingCollab] = useState<Collaborator | null>(null);

  // Gestion des modales métier
  const [isRiskModalOpen, setIsRiskModalOpen] = useState(false);
  const [editingRisk, setEditingRisk] = useState<Risk | null>(null);
  const [inspectingRisk, setInspectingRisk] = useState<Risk | null>(null);

  const [isSoAModalOpen, setIsSoAModalOpen] = useState(false);
  const [editingControl, setEditingControl] = useState<SoAControl | null>(null);

  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<CorrectiveAction | null>(null);
  const [actionModalDefaults, setActionModalDefaults] = useState<{
    source?: 'risque' | 'soa_ecart' | 'audit_interne';
    linkedRiskId?: string;
    linkedControlCode?: string;
    title?: string;
    description?: string;
  }>({});

  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  const [isTestScenarioOpen, setIsTestScenarioOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Modales IAM
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUserAccount, setEditingUserAccount] = useState<UserAccount | null>(null);

  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [userForPasswordReset, setUserForPasswordReset] = useState<UserAccount | null>(null);

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleDefinition | null>(null);

  // Sauvegarde automatique à chaque changement
  useEffect(() => {
    saveGRCState(state);
  }, [state]);

  // Fonction centrale de journalisation de sécurité (Audit Trail)
  const logSecurityEvent = (
    eventType: SecurityEventType,
    severity: 'info' | 'warning' | 'critical',
    details: string,
    targetResource: string,
    targetId?: string
  ) => {
    const actor = currentAccount ? {
      id: currentAccount.id,
      name: currentAccount.name,
      email: currentAccount.email
    } : {
      id: 'system',
      name: 'Système GRC-Goal',
      email: 'system@grc-goal.local'
    };

    const newLog = createAuditLogEntry(actor, eventType, severity, targetResource, details, targetId);
    
    // Déclencheur intelligent : générer une notification pour les administrateurs si alerte sensible
    const securityNotifs = (severity === 'warning' || severity === 'critical')
      ? dispatchSecurityAlertNotification(eventType, details, severity, state.accounts, state.notifications)
      : [];

    setState(prev => ({
      ...prev,
      auditLogs: [newLog, ...prev.auditLogs],
      notifications: [...securityNotifs, ...prev.notifications]
    }));
    // Only send to backend if user is authenticated
    if (state.authSession.isAuthenticated) {
      apiService.createAuditLog(newLog).catch(() => {});
    }
  };

  // ==================== GESTION DES NOTIFICATIONS ====================
  const handleMarkNotificationAsRead = (notifId: string) => {
    setState(prev => ({
      ...prev,
      notifications: markNotificationAsRead(prev.notifications, notifId, currentAccount.id)
    }));
    apiService.markNotificationAsRead(notifId).catch(() => {});
  };

  const handleMarkNotificationAsUnread = (notifId: string) => {
    setState(prev => ({
      ...prev,
      notifications: markNotificationAsUnread(prev.notifications, notifId, currentAccount.id)
    }));
  };

  const handleMarkAllNotificationsAsRead = () => {
    setState(prev => ({
      ...prev,
      notifications: markAllNotificationsAsRead(prev.notifications, currentAccount.id)
    }));
  };

  const handleDeleteNotification = (notifId: string) => {
    setState(prev => ({
      ...prev,
      notifications: deleteNotification(prev.notifications, notifId, currentAccount.id)
    }));
  };

  const handleClearReadNotifications = () => {
    setState(prev => ({
      ...prev,
      notifications: clearReadNotifications(prev.notifications, currentAccount.id)
    }));
  };

  const handleNavigateToResource = (module: string, resourceId?: string) => {
    setActiveModule(module);
    if (module === 'risks' && resourceId) {
      const risk = state.risks.find(r => r.id === resourceId || r.code === resourceId);
      if (risk) {
        setInspectingRisk(risk);
      }
    } else if (module === 'actions' && resourceId) {
      const action = state.actions.find(a => a.id === resourceId || a.code === resourceId);
      if (action) {
        setEditingAction(action);
        setIsActionModalOpen(true);
      }
    } else if (module === 'soa' && resourceId) {
      const control = state.soa.find(c => c.code === resourceId || c.id === resourceId);
      if (control) {
        setEditingControl(control);
        setIsSoAModalOpen(true);
      }
    }
  };

  // Codes séquentiels pour l'organisation active
  const nextRiskCode = `RSK-${String(scopedRisks.length + 1).padStart(2, '0')}`;
  const nextActionCode = `ACT-${String(scopedActions.length + 1).padStart(2, '0')}`;

  // ==================== AUTHENTIFICATION ====================
  const handleLoginSuccess = async (loginResponse: { user: UserAccount; access?: string; refresh?: string } | UserAccount) => {
    let user: UserAccount;
    if ('user' in loginResponse) {
      user = loginResponse.user;
      if (loginResponse.access) localStorage.setItem('access_token', loginResponse.access);
      if (loginResponse.refresh) localStorage.setItem('refresh_token', loginResponse.refresh);
    } else {
      user = loginResponse;
      try {
        const authRes = await apiService.login(user.email, 'PmeSecure2026!');
        if (authRes.access) localStorage.setItem('access_token', authRes.access);
        if (authRes.refresh) localStorage.setItem('refresh_token', authRes.refresh);
      } catch (err) {
        console.info('Connexion backend pour persona non bloquante:', err);
      }
    }
    localStorage.setItem('user_id', user.id);
    
    // Mettre à jour l'état d'authentification
    setState(prev => ({
      ...prev,
      authSession: {
        isAuthenticated: true,
        currentUserId: user.id,
        currentSessionId: prev.authSession.currentSessionId,
        mfaPendingUserId: null
      },
      accounts: prev.accounts.map(u => u.id === user.id ? {
        ...u,
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        lastLoginIp: '192.168.1.10'
      } : u)
    }));
    
    setIsAuthenticated(true);
    
    // Rediriger vers l'URL demandée si elle existe
    const redirectUrl = localStorage.getItem('redirect_after_login');
    if (redirectUrl) {
      localStorage.removeItem('redirect_after_login');
      // Note: comme l'app n'utilise pas React Router, on ne peut pas vraiment rediriger
      // mais on pourrait utiliser activeModule pour simuler la navigation
    }
  };

  const handleLogout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    // Nettoyer les tokens du localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_id');
    
    logSecurityEvent('LOGOUT', 'info', `Déconnexion volontaire de l'utilisateur ${currentAccount.name}`, 'authentification');
    
    setState(prev => ({
      ...prev,
      authSession: {
        isAuthenticated: false,
        currentUserId: null,
        currentSessionId: null,
        mfaPendingUserId: null
      },
      sessions: prev.sessions.filter(s => s.id !== prev.authSession.currentSessionId)
    }));
    
    setIsAuthenticated(false);
  };

  const handleSwitchUserPersona = (user: UserAccount) => {
    if (user.status === 'suspendu') {
      alert("Ce compte est actuellement suspendu. Impossible d'ouvrir une session.");
      logSecurityEvent('LOGIN_FAILED', 'warning', `Refus de bascule sur le compte suspendu : ${user.email}`, 'authentification');
      return;
    }

    logSecurityEvent('LOGIN_SUCCESS', 'info', `Bascule de profil de test vers : ${user.name} (${user.email})`, 'authentification');
    handleLoginSuccess(user);
  };

  // ==================== GESTION DES ORGANISATIONS & COLLABORATEURS ====================
  const handleSwitchOrganization = (orgId: string) => {
    const userOrgs = getOrganizationsForUser(currentAccount, state);
    if (!userOrgs.some(o => o.id === orgId)) {
      alert("Accès refusé : Vous ne faites pas partie des membres autorisés pour cette organisation.");
      logSecurityEvent('PERMISSION_DENIED', 'critical', `Tentative non autorisée de bascule vers l'organisation ID ${orgId}`, 'organisation', orgId);
      return;
    }
    const newState = switchActiveOrganization(orgId, state);
    setState(newState);
    const targetOrg = newState.organizations.find(o => o.id === orgId);
    logSecurityEvent('ORGANIZATION_SWITCHED' as any, 'info', `Bascule vers l'organisation : ${targetOrg?.name || orgId}`, 'organisation', orgId);
  };

  const handleSaveOrganization = (orgData: Omit<Organization, 'id' | 'createdAt'> & { id?: string }) => {
    if (orgModalMode === 'edit' && orgData.id) {
      if (!hasPermission(currentAccount, state.roles, 'governance', 'update') && !currentAccount.roleIds.includes('role-org-admin') && !currentAccount.roleIds.includes('role-super-admin')) {
        alert("Accès refusé : Vos privilèges ne vous permettent pas de modifier cette organisation.");
        return;
      }
      const targetOrg = state.organizations.find(o => o.id === orgData.id) || activeOrganization;
      const updated: Organization = {
        ...targetOrg,
        ...orgData,
        updatedAt: new Date().toISOString().slice(0, 10)
      };
      const newState = updateOrganizationInState(updated, state);
      setState(newState);
      apiService.updateOrganization(updated.id, updated).catch(console.error);
      logSecurityEvent('ORGANIZATION_UPDATED' as any, 'info', `Mise à jour des paramètres de l’organisation ${updated.name}`, 'governance', updated.id);
    } else {
      // Création d'une nouvelle organisation (Cas B ou ajout)
      const { state: newState, createdOrg } = createNewOrganization(orgData, currentAccount, state);
      setState(newState);
      apiService.createOrganization(createdOrg).catch(console.error);
      logSecurityEvent('ORGANIZATION_CREATED' as any, 'info', `Création d'une nouvelle organisation [${createdOrg.name}] par ${currentAccount.name}`, 'governance', createdOrg.id);
    }
    setIsOrgModalOpen(false);
  };

  const handleSaveCollaborator = (
    collabData: Omit<Collaborator, 'id' | 'createdAt'> & { id?: string },
    options?: { createPlatformAccount?: boolean; initialPassword?: string }
  ) => {
    if (collabData.id) {
      // Modification
      const existing = state.collaborators.find(c => c.id === collabData.id);
      if (!existing) return;
      const updated: Collaborator = {
        ...existing,
        ...collabData,
        updatedAt: new Date().toISOString().slice(0, 10)
      };
      const res = updateCollaboratorInState(updated, state);
      if (!res.success) {
        alert(res.error || "Impossible de mettre à jour le collaborateur.");
        return;
      }
      setState(res.state);
      apiService.updateCollaborator(updated.id, updated).catch(console.error);
      logSecurityEvent('COLLABORATOR_UPDATED' as any, 'info', `Mise à jour du collaborateur ${collabData.fullName} (${collabData.email})`, 'collaborateurs', collabData.id);
    } else {
      // Ajout / Invitation
      const res = addCollaboratorToState(collabData, state, options);
      setState(res.state);
      const addedCollab = res.state.collaborators[res.state.collaborators.length - 1];
      if (addedCollab) {
        apiService.createCollaborator(addedCollab).catch(console.error);
      }
      logSecurityEvent('COLLABORATOR_INVITED' as any, 'info', `Invitation du collaborateur ${collabData.fullName} (${collabData.email}) - Rôle: ${collabData.roleId}`, 'collaborateurs');
    }
    setIsCollabModalOpen(false);
    setEditingCollab(null);
  };

  const handleDeleteCollaborator = (collabId: string) => {
    const target = state.collaborators.find(c => c.id === collabId);
    if (!target) return;

    if (!confirm(`Confirmez-vous le retrait de "${target.fullName}" de l'organisation "${activeOrganization.name}" ?`)) {
      return;
    }

    const res = deleteCollaboratorFromState(collabId, state);
    if (!res.success) {
      alert(res.error || "Impossible de supprimer ce collaborateur.");
      return;
    }
    setState(res.state);
    apiService.deleteCollaborator(collabId).catch(console.error);
    logSecurityEvent('COLLABORATOR_REMOVED' as any, 'warning', `Suppression du collaborateur ${target.fullName} de l'organisation ${activeOrganization.name}`, 'collaborateurs', collabId);
  };

  const handleToggleCollaboratorStatus = (collab: Collaborator) => {
    const newStatus = collab.invitationStatus === 'actif' ? 'desactive' : 'actif';
    const updated: Collaborator = {
      ...collab,
      invitationStatus: newStatus,
      updatedAt: new Date().toISOString().slice(0, 10)
    };
    const res = updateCollaboratorInState(updated, state);
    if (!res.success) {
      alert(res.error || "Impossible de modifier le statut.");
      return;
    }
    setState(res.state);
    logSecurityEvent('COLLABORATOR_UPDATED' as any, 'info', `Statut du collaborateur ${collab.fullName} passé à : ${newStatus}`, 'collaborateurs', collab.id);
  };

  const handleResendInvitation = (collab: Collaborator) => {
    const updated: Collaborator = {
      ...collab,
      invitedAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10)
    };
    const res = updateCollaboratorInState(updated, state);
    if (res.success) {
      setState(res.state);
      alert(`Une nouvelle invitation a été simulée et envoyée avec succès à ${collab.email}.`);
      logSecurityEvent('COLLABORATOR_INVITED' as any, 'info', `Renvoi de l'invitation à ${collab.fullName} (${collab.email})`, 'collaborateurs', collab.id);
    }
  };

  const handleRegisterNewOrg = async (
    userData: { name: string; email: string; password: string; jobTitle: string; phone?: string },
    orgData: { name: string; sector: string; size: string; phone?: string; grcScope?: string }
  ) => {
    try {
      // Créer l'utilisateur via l'API backend
      const nameParts = userData.name.trim().split(' ');
      const newUser = await apiService.createUser({
        firstName: nameParts[0] || 'Admin',
        lastName: nameParts.slice(1).join(' ') || 'PME',
        name: userData.name,
        email: userData.email,
        phone: userData.phone || '',
        jobTitle: userData.jobTitle || 'Administrateur Organisation',
        department: 'Direction Générale',
        organizationIds: [],
        organizationName: orgData.name,
        roleIds: ['role-org-admin'],
        status: 'actif',
        mustChangePassword: false,
        mfaEnabled: false,
        avatarColor: 'bg-[#0B3B7B]'
      }, userData.password);

      // Créer l'organisation via l'API backend
      const orgResponse = await apiService.request('/organizations/', {
        method: 'POST',
        body: JSON.stringify({
          name: orgData.name,
          sector: orgData.sector || 'Services numériques & Conseil',
          size: orgData.size || '15 collaborateurs (TPE/PME)',
          phone: orgData.phone || '',
          contact_name: newUser.name,
          contact_email: newUser.email,
          security_officer: `${newUser.name} (Référent GRC)`,
          description: `Espace GRC de ${orgData.name} pour le pilotage de la sécurité et la conformité ISO 27001.`,
          grc_scope: orgData.grcScope || 'Système d\'information, postes de travail, facturation et données clients'
        })
      });

      if (!orgResponse.ok) {
        throw new Error('Échec de création de l\'organisation');
      }

      const createdOrg = await orgResponse.json();

      // Mettre à jour l'utilisateur avec l'organization_id
      await apiService.updateUser(newUser.id, {
        organization_id: createdOrg.id,
        organizationIds: [createdOrg.id],
        organizationName: createdOrg.name
      });

      // Connecter l'utilisateur avec ses vrais identifiants
      const loginResponse = await apiService.login(userData.email, userData.password);
      handleLoginSuccess(loginResponse);
      logSecurityEvent('ORGANIZATION_CREATED' as any, 'info', `Nouvelle inscription et création d'organisation : ${createdOrg.name} (${userData.email})`, 'organisation', createdOrg.id);

    } catch (error) {
      console.error('Erreur lors de la création de l\'organisation:', error);
      alert('Une erreur est survenue lors de la création de votre compte. Veuillez réessayer.');
    }
  };


  // ==================== GESTION DES UTILISATEURS (IAM) ====================
  const handleSaveUserAccount = async (userData: Partial<UserAccount>, plainPassword?: string) => {
    // Vérification de permission côté serveur/gestionnaire
    const isEditing = Boolean(userData.id);
    const requiredAction = isEditing ? 'update' : 'create';
    
    if (!hasPermission(currentAccount, state.roles, 'users', requiredAction)) {
      logSecurityEvent('PERMISSION_DENIED', 'critical', `Tentative non autorisée de ${isEditing ? 'modification' : 'création'} d'utilisateur par ${currentAccount.name}`, 'users');
      alert("Action refusée : Vos privilèges RBAC ne vous permettent pas d'administrer les utilisateurs.");
      return;
    }

    if (userData.id) {
      // Modification
      setState(prev => ({
        ...prev,
        accounts: prev.accounts.map(u => u.id === userData.id ? { ...u, ...userData } as UserAccount : u)
      }));
      apiService.updateUser(userData.id, userData).catch(console.error);
      logSecurityEvent('USER_UPDATED', 'info', `Mise à jour du profil utilisateur : ${userData.name || userData.id}`, 'users', userData.id);
    } else {
      // Création
      const salt = generateSalt();
      const pwd = plainPassword || 'PmeSecure2026!';
      const hash = await hashPassword(pwd, salt);

      const newUser: UserAccount = {
        id: `user-${Date.now()}`,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        name: userData.name || `${userData.firstName} ${userData.lastName}`,
        email: userData.email || '',
        phone: userData.phone || '',
        jobTitle: userData.jobTitle || 'Opérateur',
        department: userData.department || 'Opérations',
        organizationId: activeOrganization.id,
        organizationIds: [activeOrganization.id],
        organizationName: activeOrganization.name,
        roleIds: userData.roleIds || ['role-viewer'],
        status: userData.status || 'actif',
        passwordSalt: salt,
        passwordHash: hash,
        mustChangePassword: userData.mustChangePassword || false,
        mfaEnabled: userData.mfaEnabled || false,
        failedLoginAttempts: 0,
        lockedUntil: null,
        createdAt: new Date().toISOString().slice(0, 10),
        lastLoginAt: null,
        lastLoginIp: null,
        avatarColor: 'bg-indigo-600'
      };

      setState(prev => ({
        ...prev,
        accounts: [...prev.accounts, newUser]
      }));
      apiService.createUser(newUser, pwd).catch(console.error);
      logSecurityEvent('USER_CREATED', 'info', `Création du nouveau compte : ${newUser.name} (${newUser.email})`, 'users', newUser.id);
    }

    setIsUserModalOpen(false);
    setEditingUserAccount(null);
  };

  const handleToggleUserStatus = (userId: string, newStatus: UserStatus) => {
    if (!hasPermission(currentAccount, state.roles, 'users', 'update')) {
      logSecurityEvent('PERMISSION_DENIED', 'critical', `Tentative de modification de statut par ${currentAccount.name}`, 'users');
      alert("Action refusée par la politique RBAC.");
      return;
    }

    if (userId === currentAccount.id) {
      alert("Vous ne pouvez pas modifier le statut de votre propre compte connecté.");
      return;
    }

    setState(prev => ({
      ...prev,
      accounts: prev.accounts.map(u => u.id === userId ? { ...u, status: newStatus } : u),
      // Si suspendu ou désactivé, révoquer immédiatement toutes ses sessions
      sessions: (newStatus === 'suspendu' || newStatus === 'desactive') 
        ? prev.sessions.filter(s => s.userId !== userId) 
        : prev.sessions
    }));
    apiService.updateUser(userId, { status: newStatus }).catch(console.error);

    logSecurityEvent(
      'USER_STATUS_CHANGED', 
      newStatus === 'suspendu' ? 'warning' : 'info', 
      `Changement de statut du compte ${userId} vers [${newStatus}]`, 
      'users', 
      userId
    );
  };

  const handleConfirmResetPassword = async (userId: string, tempPassword: string, forceChange: boolean) => {
    if (!hasPermission(currentAccount, state.roles, 'users', 'update')) {
      alert("Action refusée par la politique RBAC.");
      return;
    }

    const salt = generateSalt();
    const hash = await hashPassword(tempPassword, salt);

    setState(prev => ({
      ...prev,
      accounts: prev.accounts.map(u => u.id === userId ? {
        ...u,
        passwordSalt: salt,
        passwordHash: hash,
        mustChangePassword: forceChange,
        failedLoginAttempts: 0,
        lockedUntil: null
      } : u),
      // Révocation de toutes les sessions actives de l'utilisateur concerné
      sessions: prev.sessions.filter(s => s.userId !== userId)
    }));

    logSecurityEvent('PASSWORD_RESET', 'warning', `Réinitialisation administrative du mot de passe pour le compte ${userId}`, 'users', userId);
    alert(`Le mot de passe a été réinitialisé avec succès.\nMot de passe temporaire : ${tempPassword}`);
  };

  const handleRevokeUserSessions = (userId: string) => {
    if (!hasPermission(currentAccount, state.roles, 'users', 'update')) {
      alert("Action refusée par la politique RBAC.");
      return;
    }

    setState(prev => ({
      ...prev,
      sessions: prev.sessions.filter(s => s.userId !== userId)
    }));

    logSecurityEvent('SESSION_REVOKED', 'warning', `Révocation de toutes les sessions actives pour l’utilisateur ${userId}`, 'sessions', userId);
    alert("Toutes les sessions de cet utilisateur ont été révoquées.");
  };

  const handleDeleteUser = (userId: string) => {
    if (!hasPermission(currentAccount, state.roles, 'users', 'delete')) {
      alert("Action non autorisée.");
      return;
    }

    setState(prev => ({
      ...prev,
      accounts: prev.accounts.filter(u => u.id !== userId),
      sessions: prev.sessions.filter(s => s.userId !== userId)
    }));
    apiService.deleteUser(userId).catch(console.error);

    logSecurityEvent('USER_DELETED', 'critical', `Suppression définitive du compte utilisateur ${userId}`, 'users', userId);
  };

  // ==================== GESTION DES RÔLES (RBAC) ====================
  const handleSaveRole = (roleData: Partial<RoleDefinition>) => {
    if (!hasPermission(currentAccount, state.roles, 'roles', 'manage') && !hasPermission(currentAccount, state.roles, 'roles', 'update')) {
      alert("Action refusée : Privilèges administrateur requis pour modifier les rôles RBAC.");
      return;
    }

    if (roleData.id) {
      setState(prev => ({
        ...prev,
        roles: prev.roles.map(r => r.id === roleData.id ? { ...r, ...roleData } as RoleDefinition : r)
      }));
      apiService.updateRole(roleData.id, roleData).catch(console.error);
      logSecurityEvent('ROLE_UPDATED', 'info', `Mise à jour des permissions du rôle : ${roleData.name}`, 'roles', roleData.id);
    } else {
      const newRole: RoleDefinition = {
        id: `role-${Date.now()}`,
        code: roleData.code || 'CUSTOM_ROLE',
        name: roleData.name || 'Nouveau Rôle',
        description: roleData.description || '',
        isSystem: false,
        isActive: true,
        color: roleData.color || 'bg-blue-600',
        permissions: roleData.permissions || {
          dashboard: ['view'],
          risks: ['view'],
          soa: ['view'],
          actions: ['view'],
          assets: ['view'],
          governance: ['view'],
          users: [],
          roles: [],
          audit_logs: [],
          test_protocol: ['view'],
          notifications: ['view']
        }
      };

      setState(prev => ({
        ...prev,
        roles: [...prev.roles, newRole]
      }));
      apiService.createRole(newRole).catch(console.error);
      logSecurityEvent('ROLE_CREATED', 'info', `Création du nouveau rôle personnalisé : ${newRole.name}`, 'roles', newRole.id);
    }

    setIsRoleModalOpen(false);
    setEditingRole(null);
  };

  const handleCloneRole = (role: RoleDefinition) => {
    const clonedRole: RoleDefinition = {
      ...role,
      id: `role-${Date.now()}`,
      code: `${role.code}_COPIE`,
      name: `${role.name} (Variante)`,
      isSystem: false,
      permissions: { ...role.permissions }
    };

    setEditingRole(clonedRole);
    setIsRoleModalOpen(true);
  };

  const handleDeleteRole = (roleId: string) => {
    setState(prev => ({
      ...prev,
      roles: prev.roles.filter(r => r.id !== roleId)
    }));
    apiService.deleteRole(roleId).catch(console.error);
    logSecurityEvent('ROLE_DELETED', 'warning', `Suppression du rôle personnalisé ${roleId}`, 'roles', roleId);
  };

  // ==================== GESTION DES SESSIONS ====================
  const handleRevokeSingleSession = (sessionId: string) => {
    setState(prev => ({
      ...prev,
      sessions: prev.sessions.filter(s => s.id !== sessionId)
    }));
    logSecurityEvent('SESSION_REVOKED', 'info', `Révocation de la session individuelle ${sessionId}`, 'sessions', sessionId);
  };

  const handleRevokeAllOtherSessions = () => {
    setState(prev => ({
      ...prev,
      sessions: prev.sessions.filter(s => s.id === prev.authSession.currentSessionId || s.isCurrent)
    }));
    logSecurityEvent('ALL_SESSIONS_REVOKED', 'warning', `Révocation en masse de toutes les sessions distantes`, 'sessions');
    alert("Toutes les sessions secondaires ont été révoquées avec succès.");
  };

  const handleUpdateSecuritySettings = (newSettings: SecuritySettings) => {
    setState(prev => ({
      ...prev,
      securitySettings: newSettings
    }));
    apiService.updateSecuritySettings(newSettings).catch(console.error);
    logSecurityEvent('SECURITY_SETTINGS_UPDATED', 'info', `Mise à jour de la politique de sécurité des mots de passe et sessions`, 'securite');
  };

  // ==================== OPÉRATIONS MÉTIER (AVEC CONTRÔLE RBAC) ====================
  const handleSaveRisk = (riskData: Partial<Risk>) => {
    const isEdit = Boolean(riskData.id);
    const reqAction = isEdit ? 'update' : 'create';

    if (!hasPermission(currentAccount, state.roles, 'risks', reqAction)) {
      logSecurityEvent('PERMISSION_DENIED', 'critical', `Tentative non autorisée de ${isEdit ? 'modification' : 'création'} de risque par ${currentAccount.name}`, 'risks');
      alert(`Accès refusé par la politique RBAC : Votre rôle (${currentAccount.roleIds.join(', ')}) n'a pas le droit de ${isEdit ? 'modifier' : 'créer'} des risques.`);
      return;
    }

    if (riskData.id) {
      setState(prev => {
        const updatedRisks = prev.risks.map(r => r.id === riskData.id ? { ...r, ...riskData, updatedAt: new Date().toISOString().slice(0, 10) } as Risk : r);
        const targetRisk = updatedRisks.find(r => r.id === riskData.id);
        const riskNotifs = targetRisk ? dispatchRiskNotification(targetRisk, prev.accounts, prev.notifications) : [];
        return {
          ...prev,
          risks: updatedRisks,
          notifications: [...riskNotifs, ...prev.notifications]
        };
      });
      apiService.updateRisk(riskData.id, riskData).catch(console.error);
      logSecurityEvent('RISK_MODIFIED' as any, 'info', `Mise à jour du risque ${riskData.code} : ${riskData.title}`, 'risks', riskData.id);
    } else {
      const newRisk: Risk = {
        id: `rsk-${Date.now()}`,
        code: riskData.code || nextRiskCode,
        title: riskData.title || '',
        description: riskData.description || '',
        assetId: riskData.assetId || (state.assets[0]?.id || ''),
        threat: riskData.threat || '',
        vulnerability: riskData.vulnerability || '',
        owner: riskData.owner || currentAccount.name,
        probability: riskData.probability || 3,
        impact: riskData.impact || 3,
        score: (riskData.probability || 3) * (riskData.impact || 3),
        level: riskData.level || 'Moyen',
        strategy: riskData.strategy || 'réduire',
        treatmentNotes: riskData.treatmentNotes || '',
        residualProbability: riskData.residualProbability,
        residualImpact: riskData.residualImpact,
        residualScore: riskData.residualScore,
        residualLevel: riskData.residualLevel,
        status: riskData.status || 'ouvert',
        createdAt: new Date().toISOString().slice(0, 10),
        updatedAt: new Date().toISOString().slice(0, 10),
        organizationId: activeOrganization.id
      };
      setState(prev => {
        const riskNotifs = dispatchRiskNotification(newRisk, prev.accounts, prev.notifications);
        return {
          ...prev,
          risks: [newRisk, ...prev.risks],
          notifications: [...riskNotifs, ...prev.notifications]
        };
      });
      apiService.createRisk(newRisk).catch(console.error);
      logSecurityEvent('RISK_MODIFIED' as any, 'info', `Création du risque ${newRisk.code} : ${newRisk.title}`, 'risks', newRisk.id);
    }
    setIsRiskModalOpen(false);
    setEditingRisk(null);
  };

  const handleSaveSoAControl = (updatedControl: SoAControl) => {
    if (!hasPermission(currentAccount, state.roles, 'soa', 'update')) {
      logSecurityEvent('PERMISSION_DENIED', 'critical', `Tentative non autorisée de mise à jour de la mesure SoA ${updatedControl.code} par ${currentAccount.name}`, 'soa');
      alert("Accès refusé par la politique RBAC : La mise à jour de la Déclaration d'Applicabilité ISO 27001 est réservée aux profils autorisés.");
      return;
    }

    setState(prev => {
      let soaNotifs: AppNotification[] = [];
      if (updatedControl.gapDescription && updatedControl.gapDescription.trim()) {
        soaNotifs = dispatchSoAGapNotification(updatedControl, prev.accounts, prev.notifications);
      }
      return {
        ...prev,
        soa: prev.soa.map(c => 
          (c.id === updatedControl.id || (c.code === updatedControl.code && (c.organizationId === activeOrganization.id || (!c.organizationId && activeOrganization.id === 'org-pme-demo'))))
            ? updatedControl 
            : c
        ),
        notifications: [...soaNotifs, ...prev.notifications]
      };
    });
    apiService.updateSoaControl(updatedControl.id, updatedControl).catch(console.error);
    logSecurityEvent('SOA_UPDATED' as any, 'info', `Mise à jour de la mesure SoA ${updatedControl.code} (Applicable: ${updatedControl.isApplicable}, État: ${updatedControl.implementationStatus})`, 'soa', updatedControl.code);
    setIsSoAModalOpen(false);
    setEditingControl(null);
  };

  const handleSaveAction = (actionData: Partial<CorrectiveAction>) => {
    const isEdit = Boolean(actionData.id);
    const reqAction = isEdit ? 'update' : 'create';

    if (!hasPermission(currentAccount, state.roles, 'actions', reqAction)) {
      logSecurityEvent('PERMISSION_DENIED', 'critical', `Tentative non autorisée sur les actions par ${currentAccount.name}`, 'actions');
      alert("Accès refusé par la politique RBAC.");
      return;
    }

    if (actionData.id) {
      setState(prev => {
        const updatedActions = prev.actions.map(a => a.id === actionData.id ? { ...a, ...actionData } as CorrectiveAction : a);
        const targetAction = updatedActions.find(a => a.id === actionData.id);
        const actionNotifs = targetAction ? dispatchActionNotification(targetAction, prev.accounts, prev.notifications, false) : [];
        return {
          ...prev,
          actions: updatedActions,
          notifications: [...actionNotifs, ...prev.notifications]
        };
      });
      apiService.updateAction(actionData.id, actionData).catch(console.error);
    } else {
      const newAction: CorrectiveAction = {
        id: `act-${Date.now()}`,
        code: actionData.code || nextActionCode,
        title: actionData.title || '',
        description: actionData.description || '',
        source: actionData.source || 'risque',
        linkedRiskId: actionData.linkedRiskId,
        linkedControlCode: actionData.linkedControlCode,
        owner: actionData.owner || currentAccount.name,
        priority: actionData.priority || 'Haute',
        dueDate: actionData.dueDate || '2026-11-15',
        status: actionData.status || 'a_faire',
        evidenceOfClosure: actionData.evidenceOfClosure || '',
        comments: actionData.comments || [],
        organizationId: activeOrganization.id,
        createdAt: new Date().toISOString().slice(0, 10)
      };
      setState(prev => {
        const actionNotifs = dispatchActionNotification(newAction, prev.accounts, prev.notifications, true);
        return {
          ...prev,
          actions: [newAction, ...prev.actions],
          notifications: [...actionNotifs, ...prev.notifications]
        };
      });
      apiService.createAction(newAction).catch(console.error);
    }
    setIsActionModalOpen(false);
    setEditingAction(null);
  };

  const handleQuickCloseAction = (actionId: string, proof: string) => {
    if (!hasPermission(currentAccount, state.roles, 'actions', 'approve') && !hasPermission(currentAccount, state.roles, 'actions', 'update')) {
      alert("Accès refusé : Privilège de validation d'action requis.");
      return;
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    setState(prev => {
      const updatedActions = prev.actions.map(a => 
        a.id === actionId 
          ? { 
              ...a, 
              status: 'cloturee' as any, 
              evidenceOfClosure: proof,
              closedAt: todayStr 
            } 
          : a
      );
      const targetAction = updatedActions.find(a => a.id === actionId);
      const closeNotifs = targetAction 
        ? dispatchActionClosedNotification(targetAction, currentAccount.name, prev.accounts, prev.notifications)
        : [];

      return {
        ...prev,
        actions: updatedActions,
        notifications: [...closeNotifs, ...prev.notifications]
      };
    });
    apiService.updateAction(actionId, {
      status: 'cloturee',
      evidenceOfClosure: proof,
      closedAt: todayStr
    }).catch(console.error);
    logSecurityEvent('ACTION_CLOSED' as any, 'info', `Clôture de l'action ${actionId} avec preuve enregistrée : ${proof}`, 'actions', actionId);
  };

  const handleSaveAsset = (assetData: Partial<Asset>) => {
    const isEdit = Boolean(assetData.id);
    const reqAction = isEdit ? 'update' : 'create';

    if (!hasPermission(currentAccount, state.roles, 'assets', reqAction)) {
      alert("Accès refusé par la politique RBAC pour la cartographie des actifs.");
      return;
    }

    if (assetData.id) {
      setState(prev => ({
        ...prev,
        assets: prev.assets.map(a => a.id === assetData.id ? { ...a, ...assetData } as Asset : a)
      }));
      apiService.updateAsset(assetData.id, assetData).catch(console.error);
    } else {
      const newAsset: Asset = {
        id: `ast-${Date.now()}`,
        name: assetData.name || '',
        category: assetData.category || 'database',
        description: assetData.description || '',
        owner: assetData.owner || currentAccount.name,
        criticality: assetData.criticality || 'Moyenne',
        location: assetData.location || '',
        createdAt: new Date().toISOString().slice(0, 10),
        organizationId: activeOrganization.id
      };
      setState(prev => ({
        ...prev,
        assets: [...prev.assets, newAsset]
      }));
      apiService.createAsset(newAsset).catch(console.error);
    }
    setIsAssetModalOpen(false);
    setEditingAsset(null);
  };

  const handleCreateActionForRisk = (risk: Risk) => {
    setInspectingRisk(null);
    setActionModalDefaults({
      source: 'risque',
      linkedRiskId: risk.id,
      title: `Mesure corrective : ${risk.title}`,
      description: `Traitement de la vulnérabilité "${risk.vulnerability}" pour réduire l'impact sur l'actif.`
    });
    setEditingAction(null);
    setIsActionModalOpen(true);
  };

  const handleCreateActionForSoAGap = (control: SoAControl) => {
    setIsSoAModalOpen(false);
    setActionModalDefaults({
      source: 'soa_ecart',
      linkedControlCode: control.code,
      title: `Comblement de l'écart : ${control.code} ${control.title}`,
      description: control.gapDescription || `Mise en conformité avec les exigences de la mesure ${control.code}.`
    });
    setEditingAction(null);
    setIsActionModalOpen(true);
  };

  // Gestion des fiches de tests utilisateurs (multi-fiches & export PDF)
  const handleSaveTestSheet = (sheet: UserTestSheet) => {
    setState(prev => {
      const existingIdx = (prev.testSheets || []).findIndex(s => s.id === sheet.id);
      let updatedSheets: UserTestSheet[];
      if (existingIdx >= 0) {
        updatedSheets = [...prev.testSheets];
        updatedSheets[existingIdx] = sheet;
      } else {
        updatedSheets = [sheet, ...(prev.testSheets || [])];
      }
      return {
        ...prev,
        testSheets: updatedSheets
      };
    });
    apiService.saveTestSheet(sheet).catch(console.error);

    logSecurityEvent(
      'TEST_PROTOCOL_SAVED' as any,
      'info',
      `Fiche de test utilisateur enregistrée : ${sheet.code} (${sheet.testerName})`,
      'test_protocol',
      sheet.id
    );
  };

  const handleDeleteTestSheet = (sheetId: string) => {
    setState(prev => ({
      ...prev,
      testSheets: (prev.testSheets || []).filter(s => s.id !== sheetId)
    }));
    apiService.deleteTestSheet(sheetId).catch(console.error);

    logSecurityEvent(
      'TEST_PROTOCOL_DELETED' as any,
      'warning',
      `Suppression de la fiche de test ID : ${sheetId}`,
      'test_protocol',
      sheetId
    );
  };

  const handleResetData = () => {
    if (confirm("Réinitialiser les données de démonstration ?\n\nCliquez sur OK pour réinitialiser les données du modèle PME Démonstration (B14) tout en conservant vos organisations et collaborateurs personnalisés.")) {
      const newState = resetDemoOrganizationOnly(state);
      setState(newState);
      logSecurityEvent('SECURITY_SETTINGS_UPDATED', 'info', "Réinitialisation des données de démonstration B14", "système");
    }
  };

  // ==================== RENDU CONDITIONNEL : ÉCRAN DE CONNEXION ====================
  // Stocker le module actuel avant redirection pour deep linking
  if (!isAuthenticated && isAuthChecked) {
    // Stocker le module actuel pour redirection après login
    if (activeModule !== 'dashboard') {
      localStorage.setItem('redirect_after_login', activeModule);
    }
    
    return (
      <LoginScreen
        accounts={state.accounts}
        roles={state.roles}
        securitySettings={state.securitySettings}
        onLoginSuccess={handleLoginSuccess}
        onRecordAudit={(eventType, severity, details, email) => {
          logSecurityEvent(eventType, severity, details, 'authentification', email);
        }}
        onRegisterNewOrg={handleRegisterNewOrg}
      />
    );
  }

  // ==================== RENDU PRINCIPAL DE L'APPLICATION ====================
  
  // Afficher un indicateur de chargement pendant la vérification d'authentification
  if (!isAuthChecked) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-[#0B3B7B]"></div>
          <p className="mt-4 text-sm text-slate-600 font-medium">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  // Si non authentifié, afficher l'écran de login
  if (!isAuthenticated) {
    return (
      <LoginScreen
        accounts={state.accounts}
        roles={state.roles}
        securitySettings={state.securitySettings}
        onLoginSuccess={handleLoginSuccess}
        onRecordAudit={(eventType, severity, details, email) => {
          logSecurityEvent(eventType, severity, details, 'authentification', email);
        }}
        onRegisterNewOrg={handleRegisterNewOrg}
      />
    );
  }

  // Si authentifié, afficher l'application principale
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Barre supérieure principale avec Sélecteur Multi-Organisations */}
      <Header
        organization={activeOrganization}
        organizations={getOrganizationsForUser(currentAccount, state)}
        onSwitchOrganization={handleSwitchOrganization}
        onOpenCreateOrganization={() => {
          setOrgModalMode('create');
          setIsOrgModalOpen(true);
        }}
        accounts={state.accounts}
        roles={state.roles}
        currentUser={currentAccount}
        onSelectUser={handleSwitchUserPersona}
        onOpenTestScenario={() => setIsTestScenarioOpen(true)}
        onOpenReport={() => setIsReportModalOpen(true)}
        onResetData={handleResetData}
        onLogout={handleLogout}
        activeModule={activeModule}
        onNavigate={setActiveModule}
        notifications={state.notifications}
        onMarkNotificationAsRead={handleMarkNotificationAsRead}
        onMarkAllNotificationsAsRead={handleMarkAllNotificationsAsRead}
      />

      {/* Corps avec barre latérale et zone de travail */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        
        {/* Navigation latérale avec protection RBAC et compteurs temps-réel */}
        <Sidebar
          activeModule={activeModule}
          onNavigate={setActiveModule}
          risks={scopedRisks}
          actions={scopedActions}
          soa={scopedSoA}
          currentUser={currentAccount}
          roles={state.roles}
          accountsCount={state.accounts.length}
          unreadNotificationsCount={getUnreadNotificationsCount(state.notifications, currentAccount.id)}
        />

        {/* Zone de contenu principale */}
        <main className="flex-1 min-w-0">
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-[400px] p-8 space-y-3 bg-white rounded-xl border border-slate-200">
              <div className="w-8 h-8 border-3 border-[#0B3B7B] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-semibold text-slate-700">Chargement du module GRC-Goal...</span>
            </div>
          }>
          {activeModule === 'dashboard' && (
            <DashboardView
              organization={activeOrganization}
              risks={scopedRisks}
              actions={scopedActions}
              soa={scopedSoA}
              assets={scopedAssets}
              onNavigate={setActiveModule}
              onSelectRisk={(r) => setInspectingRisk(r)}
              onOpenTestScenario={() => setIsTestScenarioOpen(true)}
            />
          )}

          {activeModule === 'risks' && (
            <RisksView
              risks={scopedRisks}
              assets={scopedAssets}
              onOpenCreateModal={() => {
                if (!hasPermission(currentAccount, state.roles, 'risks', 'create')) {
                  alert("Accès refusé : Votre rôle ne permet pas la création de risques.");
                  return;
                }
                setEditingRisk(null);
                setIsRiskModalOpen(true);
              }}
              onOpenEditModal={(r) => {
                if (!hasPermission(currentAccount, state.roles, 'risks', 'update')) {
                  alert("Accès refusé : Votre rôle ne permet pas la modification de risques.");
                  return;
                }
                setEditingRisk(r);
                setIsRiskModalOpen(true);
              }}
              onSelectRisk={(r) => setInspectingRisk(r)}
            />
          )}

          {activeModule === 'soa' && (
            <SoAView
              soa={scopedSoA}
              organizationName={activeOrganization?.name}
              grcScope={activeOrganization?.grcScope}
              onEditControl={(c) => {
                if (!hasPermission(currentAccount, state.roles, 'soa', 'update')) {
                  alert("Accès refusé : Votre rôle ne permet pas la modification de la Déclaration d'Applicabilité.");
                  return;
                }
                setEditingControl(c);
                setIsSoAModalOpen(true);
              }}
              onCreateActionForGap={handleCreateActionForSoAGap}
            />
          )}

          {activeModule === 'actions' && (
            <ActionsView
              actions={scopedActions}
              risks={scopedRisks}
              soa={scopedSoA}
              onOpenCreateModal={() => {
                if (!hasPermission(currentAccount, state.roles, 'actions', 'create')) {
                  alert("Accès refusé : Votre rôle ne permet pas de créer de nouvelles actions.");
                  return;
                }
                setEditingAction(null);
                setActionModalDefaults({});
                setIsActionModalOpen(true);
              }}
              onOpenEditModal={(a) => {
                if (!hasPermission(currentAccount, state.roles, 'actions', 'update')) {
                  alert("Accès refusé : Votre rôle ne permet pas de modifier cette action.");
                  return;
                }
                setEditingAction(a);
                setIsActionModalOpen(true);
              }}
              onQuickCloseAction={handleQuickCloseAction}
            />
          )}

          {activeModule === 'assets' && (
            <AssetsView
              assets={scopedAssets}
              risks={scopedRisks}
              onOpenCreateModal={() => {
                if (!hasPermission(currentAccount, state.roles, 'assets', 'create')) {
                  alert("Accès refusé : Votre rôle ne permet pas d'enregistrer d'actifs.");
                  return;
                }
                setEditingAsset(null);
                setIsAssetModalOpen(true);
              }}
              onOpenEditModal={(a) => {
                if (!hasPermission(currentAccount, state.roles, 'assets', 'update')) {
                  alert("Accès refusé : Votre rôle ne permet pas de modifier cet actif.");
                  return;
                }
                setEditingAsset(a);
                setIsAssetModalOpen(true);
              }}
              onFilterRisksByAsset={(assetId) => {
                setActiveModule('risks');
              }}
            />
          )}

          {/* Module IAM & Gestion des Accès */}
          {activeModule === 'iam' && (
            <IamView
              currentUser={currentAccount}
              users={state.accounts}
              roles={state.roles}
              sessions={state.sessions}
              auditLogs={state.auditLogs}
              securitySettings={state.securitySettings}
              currentSessionId={state.authSession.currentSessionId}
              onOpenCreateUserModal={() => {
                setEditingUserAccount(null);
                setIsUserModalOpen(true);
              }}
              onOpenEditUserModal={(u) => {
                setEditingUserAccount(u);
                setIsUserModalOpen(true);
              }}
              onOpenResetPasswordModal={(u) => {
                setUserForPasswordReset(u);
                setIsResetPasswordModalOpen(true);
              }}
              onToggleUserStatus={handleToggleUserStatus}
              onRevokeUserSessions={handleRevokeUserSessions}
              onDeleteUser={handleDeleteUser}
              onOpenCreateRoleModal={() => {
                setEditingRole(null);
                setIsRoleModalOpen(true);
              }}
              onOpenEditRoleModal={(r) => {
                setEditingRole(r);
                setIsRoleModalOpen(true);
              }}
              onCloneRole={handleCloneRole}
              onDeleteRole={handleDeleteRole}
              onRevokeSession={handleRevokeSingleSession}
              onRevokeAllOtherSessions={handleRevokeAllOtherSessions}
              onUpdateSecuritySettings={handleUpdateSecuritySettings}
            />
          )}

          {activeModule === 'governance' && (
            <GovernanceView
              organization={activeOrganization}
              collaborators={state.collaborators}
              roles={state.roles}
              accounts={state.accounts}
              currentUser={currentAccount}
              onUpdateOrganization={(updatedOrg) => {
                handleSaveOrganization({ ...updatedOrg, id: updatedOrg.id });
              }}
              onOpenCreateOrgModal={() => {
                setOrgModalMode('create');
                setIsOrgModalOpen(true);
              }}
              onOpenEditOrgModal={() => {
                setOrgModalMode('edit');
                setIsOrgModalOpen(true);
              }}
              onOpenAddCollaboratorModal={() => {
                setEditingCollab(null);
                setIsCollabModalOpen(true);
              }}
              onOpenEditCollaboratorModal={(collab) => {
                setEditingCollab(collab);
                setIsCollabModalOpen(true);
              }}
              onDeleteCollaborator={handleDeleteCollaborator}
              onToggleCollaboratorStatus={handleToggleCollaboratorStatus}
              onResendInvitation={handleResendInvitation}
              canManageOrg={hasPermission(currentAccount, state.roles, 'governance', 'update') || currentAccount.roleIds.includes('role-super-admin') || currentAccount.roleIds.includes('role-org-admin')}
            />
          )}

          {activeModule === 'test-protocol' && (
            <TestProtocolView
              testSheets={state.testSheets || []}
              onSaveSheet={handleSaveTestSheet}
              onDeleteSheet={handleDeleteTestSheet}
              onOpenStepGuide={() => setIsTestScenarioOpen(true)}
              accounts={state.accounts}
              currentUser={currentAccount}
              testProtocol={state.testProtocol}
              onUpdateProtocol={(updated) => setState(prev => ({ ...prev, testProtocol: updated }))}
            />
          )}

          {/* Module dédié de Notifications */}
          {activeModule === 'notifications' && (
            <NotificationsView
              currentUser={currentAccount}
              notifications={state.notifications}
              onMarkAsRead={handleMarkNotificationAsRead}
              onMarkAsUnread={handleMarkNotificationAsUnread}
              onMarkAllAsRead={handleMarkAllNotificationsAsRead}
              onDeleteNotification={handleDeleteNotification}
              onClearReadNotifications={handleClearReadNotifications}
              onNavigateToResource={handleNavigateToResource}
            />
          )}

          {activeModule === 'documentation' && (
            <DocumentationView />
          )}
          </Suspense>
        </main>
      </div>

      {/* Pied de page discret */}
      <footer className="no-print bg-white border-t border-slate-200 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#0B3B7B]">GRC-Goal</span>
            <span aria-hidden="true">·</span>
            <span>Programme d’Excellence en Cybersécurité — Niger 2026</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Sujet B14 · Hamani Massaoudou</span>
          </div>
        </div>
      </footer>

      {/* ==================== MODALES ==================== */}
      <Suspense fallback={null}>
      {/* Modale Utilisateur (IAM) */}
      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => {
          setIsUserModalOpen(false);
          setEditingUserAccount(null);
        }}
        onSave={handleSaveUserAccount}
        initialUser={editingUserAccount}
        roles={state.roles}
        securitySettings={state.securitySettings}
        currentUserId={currentAccount.id}
      />

      {/* Modale Réinitialisation Mot de Passe (IAM) */}
      <ResetPasswordModal
        isOpen={isResetPasswordModalOpen}
        onClose={() => {
          setIsResetPasswordModalOpen(false);
          setUserForPasswordReset(null);
        }}
        user={userForPasswordReset}
        onConfirmReset={handleConfirmResetPassword}
      />

      {/* Modale Rôle & Permissions RBAC (IAM) */}
      <RoleModal
        isOpen={isRoleModalOpen}
        onClose={() => {
          setIsRoleModalOpen(false);
          setEditingRole(null);
        }}
        onSave={handleSaveRole}
        initialRole={editingRole}
      />

      {/* Modale Création / Édition de Risque */}
      <RiskModal
        isOpen={isRiskModalOpen}
        onClose={() => {
          setIsRiskModalOpen(false);
          setEditingRisk(null);
        }}
        onSave={handleSaveRisk}
        initialRisk={editingRisk}
        assets={scopedAssets}
        nextCode={nextRiskCode}
      />

      {/* Modale Consultation Détails Risque */}
      <RiskDetailsModal
        risk={inspectingRisk}
        assets={scopedAssets}
        actions={scopedActions}
        onClose={() => setInspectingRisk(null)}
        onEdit={(r) => {
          setInspectingRisk(null);
          setEditingRisk(r);
          setIsRiskModalOpen(true);
        }}
        onCreateActionForRisk={handleCreateActionForRisk}
        onNavigateToAction={(actId) => {
          setInspectingRisk(null);
          setActiveModule('actions');
        }}
      />

      {/* Modale Édition Mesure SoA */}
      <SoAEditModal
        isOpen={isSoAModalOpen}
        onClose={() => {
          setIsSoAModalOpen(false);
          setEditingControl(null);
        }}
        control={editingControl}
        onSave={handleSaveSoAControl}
        onCreateActionForGap={handleCreateActionForSoAGap}
      />

      {/* Modale Création / Édition d'Action */}
      <ActionModal
        isOpen={isActionModalOpen}
        onClose={() => {
          setIsActionModalOpen(false);
          setEditingAction(null);
          setActionModalDefaults({});
        }}
        onSave={handleSaveAction}
        initialAction={editingAction}
        risks={scopedRisks}
        soa={scopedSoA}
        nextCode={nextActionCode}
        defaultSource={actionModalDefaults.source}
        defaultLinkedRiskId={actionModalDefaults.linkedRiskId}
        defaultLinkedControlCode={actionModalDefaults.linkedControlCode}
        defaultTitle={actionModalDefaults.title}
        defaultDescription={actionModalDefaults.description}
      />

      {/* Modale Actif */}
      <AssetModal
        isOpen={isAssetModalOpen}
        onClose={() => {
          setIsAssetModalOpen(false);
          setEditingAsset(null);
        }}
        onSave={handleSaveAsset}
        initialAsset={editingAsset}
        organizationId={activeOrganization.id}
      />

      {/* Modale Guide Scénario B14 */}
      <TestScenarioModal
        isOpen={isTestScenarioOpen}
        onClose={() => setIsTestScenarioOpen(false)}
        onNavigate={setActiveModule}
      />

      {/* Modale Rapport Exécutif Imprimable */}
      <PrintableReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        organization={activeOrganization}
        risks={scopedRisks}
        actions={scopedActions}
        soa={scopedSoA}
        assets={scopedAssets}
      />

      {/* Modale Organisation (Création / Édition) */}
      <OrganizationModal
        isOpen={isOrgModalOpen}
        onClose={() => setIsOrgModalOpen(false)}
        onSave={handleSaveOrganization}
        initialData={orgModalMode === 'edit' ? activeOrganization : null}
        mode={orgModalMode}
      />

      {/* Modale Collaborateur / Partie Prenante */}
      <CollaboratorModal
        isOpen={isCollabModalOpen}
        onClose={() => {
          setIsCollabModalOpen(false);
          setEditingCollab(null);
        }}
        onSave={handleSaveCollaborator}
        initialData={editingCollab}
        organizationId={activeOrganization.id}
        roles={state.roles}
        isLastAdmin={editingCollab ? isLastActiveAdmin(activeOrganization.id, editingCollab.id, state) : false}
      />
      </Suspense>

    </div>
  );
}
