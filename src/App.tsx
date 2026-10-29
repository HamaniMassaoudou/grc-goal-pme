import React, { useState, useEffect } from 'react';
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

// Vues des modules
import { DashboardView } from './components/dashboard/DashboardView';
import { RisksView } from './components/risks/RisksView';
import { RiskModal } from './components/risks/RiskModal';
import { RiskDetailsModal } from './components/risks/RiskDetailsModal';
import { SoAView } from './components/soa/SoAView';
import { SoAEditModal } from './components/soa/SoAEditModal';
import { ActionsView } from './components/actions/ActionsView';
import { ActionModal } from './components/actions/ActionModal';
import { AssetsView } from './components/assets/AssetsView';
import { AssetModal } from './components/assets/AssetModal';
import { GovernanceView } from './components/governance/GovernanceView';
import { OrganizationModal } from './components/governance/OrganizationModal';
import { CollaboratorModal } from './components/governance/CollaboratorModal';
import { TestScenarioModal } from './components/testGuide/TestScenarioModal';
import { TestProtocolView } from './components/testGuide/TestProtocolView';
import { DocumentationView } from './components/documentation/DocumentationView';
import { PrintableReportModal } from './components/reports/PrintableReportModal';

// Nouveaux composants IAM & Authentification
import { LoginScreen } from './components/auth/LoginScreen';
import { IamView } from './components/iam/IamView';
import { UserModal } from './components/iam/UserModal';
import { ResetPasswordModal } from './components/iam/ResetPasswordModal';
import { RoleModal } from './components/iam/RoleModal';

// Module de Notifications
import { NotificationsView } from './components/notifications/NotificationsView';
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

export default function App() {
  const [state, setState] = useState<GRCState>(() => loadGRCState());
  const [activeModule, setActiveModule] = useState<string>('dashboard');

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
  };

  // ==================== GESTION DES NOTIFICATIONS ====================
  const handleMarkNotificationAsRead = (notifId: string) => {
    setState(prev => ({
      ...prev,
      notifications: markNotificationAsRead(prev.notifications, notifId, currentAccount.id)
    }));
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
  const handleLoginSuccess = (user: UserAccount) => {
    const newSessionToken = generateSessionToken();
    const newSession: UserSession = {
      id: `sess-${Date.now()}`,
      userId: user.id,
      token: newSessionToken,
      createdAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + state.securitySettings.sessionTimeoutMinutes * 60 * 1000).toISOString(),
      ip: '192.168.1.10',
      userAgent: navigator.userAgent,
      device: 'Poste de travail (Navigateur)',
      isCurrent: true
    };

    // Marquer les autres sessions comme non actuelles
    const updatedSessions = state.sessions.map(s => ({ ...s, isCurrent: false }));

    setState(prev => ({
      ...prev,
      authSession: {
        isAuthenticated: true,
        currentUserId: user.id,
        currentSessionId: newSession.id,
        mfaPendingUserId: null
      },
      sessions: [newSession, ...updatedSessions],
      accounts: prev.accounts.map(u => u.id === user.id ? {
        ...u,
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        lastLoginIp: '192.168.1.10'
      } : u)
    }));
  };

  const handleLogout = () => {
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
      logSecurityEvent('ORGANIZATION_UPDATED' as any, 'info', `Mise à jour des paramètres de l’organisation ${updated.name}`, 'governance', updated.id);
    } else {
      // Création d'une nouvelle organisation (Cas B ou ajout)
      const { state: newState, createdOrg } = createNewOrganization(orgData, currentAccount, state);
      setState(newState);
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
      logSecurityEvent('COLLABORATOR_UPDATED' as any, 'info', `Mise à jour du collaborateur ${collabData.fullName} (${collabData.email})`, 'collaborateurs', collabData.id);
    } else {
      // Ajout / Invitation
      const res = addCollaboratorToState(collabData, state, options);
      setState(res.state);
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
    const existingUser = state.accounts.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
    let targetUser: UserAccount;

    if (existingUser) {
      targetUser = existingUser;
    } else {
      const salt = generateSalt();
      const hash = await hashPassword(userData.password, salt);
      const nameParts = userData.name.trim().split(' ');
      targetUser = {
        id: `user-${Date.now().toString(36)}`,
        firstName: nameParts[0] || 'Admin',
        lastName: nameParts.slice(1).join(' ') || 'PME',
        name: userData.name,
        email: userData.email,
        phone: userData.phone || '',
        jobTitle: userData.jobTitle || 'Administrateur Organisation',
        department: 'Direction Générale',
        organizationId: '',
        organizationIds: [],
        organizationName: orgData.name,
        roleIds: ['role-org-admin'],
        status: 'actif',
        passwordSalt: salt,
        passwordHash: hash,
        mustChangePassword: false,
        mfaEnabled: false,
        failedLoginAttempts: 0,
        lockedUntil: null,
        createdAt: new Date().toISOString().slice(0, 10),
        lastLoginAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        lastLoginIp: '192.168.1.10',
        avatarColor: 'bg-[#0B3B7B]'
      };
      state.accounts.push(targetUser);
    }

    // Créer l'organisation et rattacher l'utilisateur
    const { state: newState, createdOrg } = createNewOrganization(
      {
        name: orgData.name,
        sector: orgData.sector || 'Services numériques & Conseil',
        size: orgData.size || '15 collaborateurs (TPE/PME)',
        phone: orgData.phone || '',
        contactName: targetUser.name,
        contactEmail: targetUser.email,
        securityOfficer: `${targetUser.name} (Référent GRC)`,
        description: `Espace GRC de ${orgData.name} pour le pilotage de la sécurité et la conformité ISO 27001.`,
        grcScope: orgData.grcScope || 'Système d’information, postes de travail, facturation et données clients'
      },
      targetUser,
      state
    );

    const refreshedUser = newState.accounts.find(u => u.id === targetUser.id) || targetUser;
    setState(newState);
    handleLoginSuccess(refreshedUser);
    logSecurityEvent('ORGANIZATION_CREATED' as any, 'info', `Nouvelle inscription et création d'organisation : ${createdOrg.name} (${targetUser.email})`, 'organisation', createdOrg.id);
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
    }
    setIsActionModalOpen(false);
    setEditingAction(null);
  };

  const handleQuickCloseAction = (actionId: string, proof: string) => {
    if (!hasPermission(currentAccount, state.roles, 'actions', 'approve') && !hasPermission(currentAccount, state.roles, 'actions', 'update')) {
      alert("Accès refusé : Privilège de validation d'action requis.");
      return;
    }

    setState(prev => {
      const updatedActions = prev.actions.map(a => 
        a.id === actionId 
          ? { 
              ...a, 
              status: 'cloturee' as any, 
              evidenceOfClosure: proof,
              closedAt: new Date().toISOString().slice(0, 10) 
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
  if (!state.authSession.isAuthenticated) {
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

    </div>
  );
}
