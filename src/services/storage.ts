import { 
  Organization, 
  Collaborator,
  Asset, 
  Risk, 
  SoAControl, 
  CorrectiveAction, 
  UserProfile, 
  TestProtocolLog, 
  UserTestSheet,
  RiskLevel 
} from '../types/grc';
import { AppNotification } from '../types/notification';
import { 
  UserAccount, 
  RoleDefinition, 
  UserSession, 
  SecurityAuditLog, 
  SecuritySettings, 
  AuthSessionState,
  SecurityEventType 
} from '../types/auth';
import { 
  INITIAL_ORGANIZATION, 
  INITIAL_COLLABORATORS,
  INITIAL_USERS, 
  INITIAL_ASSETS, 
  INITIAL_RISKS, 
  INITIAL_ACTIONS, 
  generateInitialSoA, 
  generateCleanSoA,
  INITIAL_TEST_PROTOCOL,
  INITIAL_TEST_SHEETS
} from '../data/initialData';
import { INITIAL_ROLES } from '../data/rolesData';
import { INITIAL_USER_ACCOUNTS, DEFAULT_SECURITY_SETTINGS, INITIAL_AUDIT_LOGS } from '../data/usersData';
import { INITIAL_NOTIFICATIONS } from '../data/notificationsData';

const STORAGE_KEYS = {
  ORGANIZATION: 'grc_goal_organization',
  ORGANIZATIONS: 'grc_goal_organizations_v3',
  ACTIVE_ORGANIZATION_ID: 'grc_goal_active_org_id_v3',
  COLLABORATORS: 'grc_goal_collaborators_v3',
  ASSETS: 'grc_goal_assets',
  RISKS: 'grc_goal_risks',
  SOA: 'grc_goal_soa',
  ACTIONS: 'grc_goal_actions',
  CURRENT_USER: 'grc_goal_current_user',
  TEST_PROTOCOL: 'grc_goal_test_protocol',
  TEST_SHEETS: 'grc_goal_test_sheets_v2',
  ACCOUNTS: 'grc_goal_user_accounts_v2',
  ROLES: 'grc_goal_roles_v2',
  SESSIONS: 'grc_goal_sessions_v2',
  AUDIT_LOGS: 'grc_goal_audit_logs_v2',
  SECURITY_SETTINGS: 'grc_goal_security_settings_v2',
  AUTH_SESSION: 'grc_goal_auth_session_v2',
  NOTIFICATIONS: 'grc_goal_notifications_v2',
  INITIALIZED: 'grc_goal_initialized_v2'
};

// Seuil officiel du Cahier des charges B14 (§7, EF-04)
export function calculateRiskLevel(score: number): RiskLevel {
  if (score >= 15) return 'Critique';
  if (score >= 8) return 'Élevé';
  if (score >= 4) return 'Moyen';
  return 'Faible';
}

export function getRiskLevelBadgeColor(level: RiskLevel): {
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  switch (level) {
    case 'Critique':
      return {
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-200',
        dot: 'bg-rose-500'
      };
    case 'Élevé':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        dot: 'bg-amber-500'
      };
    case 'Moyen':
      return {
        bg: 'bg-yellow-50',
        text: 'text-yellow-800',
        border: 'border-yellow-200',
        dot: 'bg-yellow-500'
      };
    case 'Faible':
    default:
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        dot: 'bg-emerald-500'
      };
  }
}

export interface GRCState {
  organizations: Organization[]; // Multi-organisations
  activeOrganizationId: string; // Organisation active en contexte
  organization: Organization; // Alias / Référence active pour rétro-compatibilité
  collaborators: Collaborator[]; // Parties prenantes et collaborateurs
  users: UserProfile[]; // Legacy profile mapping
  currentUser: UserProfile; // Legacy quick reference
  assets: Asset[];
  risks: Risk[];
  soa: SoAControl[];
  actions: CorrectiveAction[];
  testProtocol: TestProtocolLog;
  testSheets: UserTestSheet[]; // Multi-fiches de test par utilisateur
  notifications: AppNotification[]; // Système intelligent de notifications

  // Module IAM & Sécurité
  accounts: UserAccount[];
  roles: RoleDefinition[];
  sessions: UserSession[];
  auditLogs: SecurityAuditLog[];
  securitySettings: SecuritySettings;
  authSession: AuthSessionState;
}

export function loadGRCState(): GRCState {
  try {
    const isInit = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
    if (!isInit) {
      return resetGRCState();
    }

    const orgsStr = localStorage.getItem(STORAGE_KEYS.ORGANIZATIONS);
    const orgStr = localStorage.getItem(STORAGE_KEYS.ORGANIZATION);
    const activeOrgIdStr = localStorage.getItem(STORAGE_KEYS.ACTIVE_ORGANIZATION_ID);
    const collabsStr = localStorage.getItem(STORAGE_KEYS.COLLABORATORS);

    const assetsStr = localStorage.getItem(STORAGE_KEYS.ASSETS);
    const risksStr = localStorage.getItem(STORAGE_KEYS.RISKS);
    const soaStr = localStorage.getItem(STORAGE_KEYS.SOA);
    const actionsStr = localStorage.getItem(STORAGE_KEYS.ACTIONS);
    const userStr = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    const testStr = localStorage.getItem(STORAGE_KEYS.TEST_PROTOCOL);
    const testSheetsStr = localStorage.getItem(STORAGE_KEYS.TEST_SHEETS);
    const notificationsStr = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);

    const accountsStr = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    const rolesStr = localStorage.getItem(STORAGE_KEYS.ROLES);
    const sessionsStr = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    const auditLogsStr = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    const settingsStr = localStorage.getItem(STORAGE_KEYS.SECURITY_SETTINGS);
    const authSessionStr = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);

    // Initialisation ou migration multi-organisations
    let organizations: Organization[] = orgsStr ? JSON.parse(orgsStr) : [];
    if (organizations.length === 0) {
      if (orgStr) {
        const singleOrg = JSON.parse(orgStr);
        organizations = [{ ...INITIAL_ORGANIZATION, ...singleOrg }];
      } else {
        organizations = [INITIAL_ORGANIZATION];
      }
    }

    // Récupération des collaborateurs
    let collaborators: Collaborator[] = collabsStr ? JSON.parse(collabsStr) : INITIAL_COLLABORATORS;

    // Détermination de l'organisation active
    let activeOrganizationId = activeOrgIdStr || organizations[0]?.id || INITIAL_ORGANIZATION.id;
    if (!organizations.some(o => o.id === activeOrganizationId)) {
      activeOrganizationId = organizations[0]?.id || INITIAL_ORGANIZATION.id;
    }
    const organization = organizations.find(o => o.id === activeOrganizationId) || organizations[0] || INITIAL_ORGANIZATION;

    const assets: Asset[] = assetsStr ? JSON.parse(assetsStr) : INITIAL_ASSETS;
    const risks: Risk[] = risksStr ? JSON.parse(risksStr) : INITIAL_RISKS;
    const soa: SoAControl[] = soaStr ? JSON.parse(soaStr) : generateInitialSoA();
    const actions: CorrectiveAction[] = actionsStr ? JSON.parse(actionsStr) : INITIAL_ACTIONS;
    const currentUser: UserProfile = userStr ? JSON.parse(userStr) : INITIAL_USERS[0];
    const testProtocol: TestProtocolLog = testStr ? JSON.parse(testStr) : INITIAL_TEST_PROTOCOL;
    const testSheets: UserTestSheet[] = testSheetsStr ? JSON.parse(testSheetsStr) : INITIAL_TEST_SHEETS;
    const notifications: AppNotification[] = notificationsStr ? JSON.parse(notificationsStr) : INITIAL_NOTIFICATIONS;

    let accounts: UserAccount[] = accountsStr ? JSON.parse(accountsStr) : INITIAL_USER_ACCOUNTS;
    // Migration: s'assurer que tous les comptes ont organizationIds
    accounts = accounts.map(u => ({
      ...u,
      organizationIds: u.organizationIds && u.organizationIds.length > 0 
        ? u.organizationIds 
        : [u.organizationId || INITIAL_ORGANIZATION.id]
    }));

    const roles: RoleDefinition[] = rolesStr ? JSON.parse(rolesStr) : INITIAL_ROLES;
    const sessions: UserSession[] = sessionsStr ? JSON.parse(sessionsStr) : [];
    const auditLogs: SecurityAuditLog[] = auditLogsStr ? JSON.parse(auditLogsStr) : INITIAL_AUDIT_LOGS;
    const securitySettings: SecuritySettings = settingsStr ? JSON.parse(settingsStr) : DEFAULT_SECURITY_SETTINGS;
    
    const authSession: AuthSessionState = authSessionStr ? JSON.parse(authSessionStr) : {
      isAuthenticated: true,
      currentUserId: accounts[0]?.id || 'user-hamani',
      currentSessionId: 'sess-init-01',
      mfaPendingUserId: null,
      activeOrganizationId
    };

    return {
      organizations,
      activeOrganizationId,
      organization,
      collaborators,
      users: INITIAL_USERS,
      currentUser,
      assets,
      risks,
      soa,
      actions,
      testProtocol,
      testSheets,
      notifications,
      accounts,
      roles,
      sessions,
      auditLogs,
      securitySettings,
      authSession
    };
  } catch (err) {
    console.error('Error loading GRC state from localStorage:', err);
    return resetGRCState();
  }
}

export function saveGRCState(state: Partial<GRCState>): void {
  try {
    if (state.organizations) {
      localStorage.setItem(STORAGE_KEYS.ORGANIZATIONS, JSON.stringify(state.organizations));
    }
    if (state.activeOrganizationId) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_ORGANIZATION_ID, state.activeOrganizationId);
    }
    if (state.collaborators) {
      localStorage.setItem(STORAGE_KEYS.COLLABORATORS, JSON.stringify(state.collaborators));
    }
    if (state.organization) {
      localStorage.setItem(STORAGE_KEYS.ORGANIZATION, JSON.stringify(state.organization));
    }
    if (state.assets) {
      localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(state.assets));
    }
    if (state.risks) {
      localStorage.setItem(STORAGE_KEYS.RISKS, JSON.stringify(state.risks));
    }
    if (state.soa) {
      localStorage.setItem(STORAGE_KEYS.SOA, JSON.stringify(state.soa));
    }
    if (state.actions) {
      localStorage.setItem(STORAGE_KEYS.ACTIONS, JSON.stringify(state.actions));
    }
    if (state.currentUser) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(state.currentUser));
    }
    if (state.testProtocol) {
      localStorage.setItem(STORAGE_KEYS.TEST_PROTOCOL, JSON.stringify(state.testProtocol));
    }
    if (state.testSheets) {
      localStorage.setItem(STORAGE_KEYS.TEST_SHEETS, JSON.stringify(state.testSheets));
    }
    if (state.notifications) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(state.notifications));
    }
    if (state.accounts) {
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(state.accounts));
    }
    if (state.roles) {
      localStorage.setItem(STORAGE_KEYS.ROLES, JSON.stringify(state.roles));
    }
    if (state.sessions) {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(state.sessions));
    }
    if (state.auditLogs) {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(state.auditLogs));
    }
    if (state.securitySettings) {
      localStorage.setItem(STORAGE_KEYS.SECURITY_SETTINGS, JSON.stringify(state.securitySettings));
    }
    if (state.authSession) {
      localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(state.authSession));
    }
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  } catch (err) {
    console.error('Error saving GRC state to localStorage:', err);
  }
}

export function resetGRCState(): GRCState {
  const initialSoA = generateInitialSoA();
  const initialAccounts = INITIAL_USER_ACCOUNTS;
  const initialRoles = INITIAL_ROLES;
  const initialAuditLogs = INITIAL_AUDIT_LOGS;

  const state: GRCState = {
    organizations: [INITIAL_ORGANIZATION],
    activeOrganizationId: INITIAL_ORGANIZATION.id,
    organization: INITIAL_ORGANIZATION,
    collaborators: INITIAL_COLLABORATORS,
    users: INITIAL_USERS,
    currentUser: INITIAL_USERS[0],
    assets: INITIAL_ASSETS,
    risks: INITIAL_RISKS,
    soa: initialSoA,
    actions: INITIAL_ACTIONS,
    testProtocol: INITIAL_TEST_PROTOCOL,
    testSheets: INITIAL_TEST_SHEETS,
    notifications: INITIAL_NOTIFICATIONS,
    accounts: initialAccounts,
    roles: initialRoles,
    sessions: [
      {
        id: 'sess-init-01',
        userId: initialAccounts[0].id,
        token: 'tok-hamani-demo',
        createdAt: new Date().toISOString(),
        lastActivityAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
        ip: '192.168.1.10',
        userAgent: navigator.userAgent,
        device: 'Ordinateur de bureau (Navigateur)',
        isCurrent: true
      }
    ],
    auditLogs: initialAuditLogs,
    securitySettings: DEFAULT_SECURITY_SETTINGS,
    authSession: {
      isAuthenticated: true,
      currentUserId: initialAccounts[0].id,
      currentSessionId: 'sess-init-01',
      mfaPendingUserId: null,
      activeOrganizationId: INITIAL_ORGANIZATION.id
    }
  };

  saveGRCState(state);
  return state;
}

/**
 * Récupère les organisations autorisées pour un utilisateur donné
 * Le Super Administrateur GRC a accès à l'ensemble des organisations.
 * Les autres utilisateurs n'accèdent qu'aux organisations dont ils sont membres déclarés.
 */
export function getOrganizationsForUser(user: UserAccount | null, state: GRCState): Organization[] {
  if (!user) return [];
  const isSuperAdmin = user.roleIds.includes('role-super-admin');
  if (isSuperAdmin) {
    return state.organizations;
  }
  const allowedIds = new Set([
    ...(user.organizationIds || []),
    user.organizationId
  ]);
  return state.organizations.filter(o => allowedIds.has(o.id));
}

/**
 * Récupère l'organisation active courante
 */
export function getActiveOrganization(state: GRCState): Organization {
  return state.organizations.find(o => o.id === state.activeOrganizationId) 
    || state.organization 
    || state.organizations[0] 
    || INITIAL_ORGANIZATION;
}

/**
 * Vérifie si un collaborateur est le dernier administrateur actif de l'organisation
 * Règle de sécurité : Interdiction formelle de supprimer ou rétrograder le dernier admin.
 */
export function isLastActiveAdmin(orgId: string, collaboratorId: string, state: GRCState): boolean {
  const targetCollab = state.collaborators.find(c => c.id === collaboratorId && c.organizationId === orgId);
  if (!targetCollab || targetCollab.roleId !== 'role-org-admin' || targetCollab.invitationStatus !== 'actif') {
    return false;
  }

  const activeAdmins = state.collaborators.filter(
    c => c.organizationId === orgId && 
         c.roleId === 'role-org-admin' && 
         c.invitationStatus === 'actif'
  );

  return activeAdmins.length <= 1;
}

/**
 * Création d'une nouvelle organisation par un utilisateur (Cas B)
 * - Génère un ID technique unique
 * - Rattache le créateur comme "Administrateur Organisation (PME)"
 * - Initialise la SoA vierge ISO 27001 (93 contrôles propres)
 * - Enregistre le créateur comme partie prenante / collaborateur admin
 * - Bascule immédiatement le contexte actif vers cette nouvelle organisation
 */
export function createNewOrganization(
  orgData: Omit<Organization, 'id' | 'createdAt' | 'status'> & { status?: Organization['status'] },
  creatorUser: UserAccount,
  state: GRCState
): { state: GRCState; createdOrg: Organization } {
  const cleanSlug = orgData.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 16);
  
  const uniqueId = `org-${cleanSlug}-${Date.now().toString(36)}`;
  const now = new Date().toISOString().slice(0, 10);

  const newOrg: Organization = {
    ...orgData,
    id: uniqueId,
    slug: cleanSlug,
    status: orgData.status || 'active',
    isDemo: false,
    creatorUserId: creatorUser.id,
    createdAt: now,
    updatedAt: now
  };

  // 1. Initialiser la déclaration d'applicabilité SoA propre pour cette organisation
  const newOrgSoA = generateCleanSoA(uniqueId);

  // 2. Créer l'entrée Collaborateur pour le créateur en tant qu'admin de l'organisation
  const creatorCollab: Collaborator = {
    id: `collab-${creatorUser.id}-${Date.now().toString(36)}`,
    organizationId: uniqueId,
    userId: creatorUser.id,
    fullName: creatorUser.name,
    email: creatorUser.email,
    phone: creatorUser.phone || orgData.phone,
    department: creatorUser.department || 'Direction Générale',
    jobTitle: creatorUser.jobTitle || 'Administrateur Organisation',
    roleId: 'role-org-admin',
    grcResponsibilities: 'Créateur & Administrateur de l’organisation : gouvernance, gestion des collaborateurs et validation GRC.',
    isPlatformUser: true,
    invitationStatus: 'actif',
    joinedAt: now,
    createdAt: now
  };

  // 3. Mettre à jour le compte utilisateur du créateur pour lui ajouter cette organisation
  const updatedAccounts = state.accounts.map(acc => {
    if (acc.id === creatorUser.id) {
      const currentOrgIds = acc.organizationIds || [acc.organizationId];
      const updatedOrgIds = Array.from(new Set([...currentOrgIds, uniqueId]));
      const updatedRoleIds = Array.from(new Set([...acc.roleIds, 'role-org-admin']));
      return {
        ...acc,
        organizationId: uniqueId, // Nouvelle organisation active
        organizationName: newOrg.name,
        organizationIds: updatedOrgIds,
        roleIds: updatedRoleIds
      };
    }
    return acc;
  });

  const nextState: GRCState = {
    ...state,
    organizations: [...state.organizations, newOrg],
    activeOrganizationId: uniqueId,
    organization: newOrg,
    collaborators: [...state.collaborators, creatorCollab],
    soa: [...state.soa, ...newOrgSoA],
    accounts: updatedAccounts,
    authSession: {
      ...state.authSession,
      activeOrganizationId: uniqueId
    }
  };

  saveGRCState(nextState);
  return { state: nextState, createdOrg: newOrg };
}

/**
 * Modification des métadonnées d'une organisation
 */
export function updateOrganizationInState(
  updatedOrg: Organization,
  state: GRCState
): GRCState {
  const nextOrganizations = state.organizations.map(o => 
    o.id === updatedOrg.id ? { ...updatedOrg, updatedAt: new Date().toISOString().slice(0, 10) } : o
  );

  const nextState: GRCState = {
    ...state,
    organizations: nextOrganizations,
    organization: updatedOrg.id === state.activeOrganizationId ? updatedOrg : state.organization
  };

  saveGRCState(nextState);
  return nextState;
}

/**
 * Changement de l'organisation active (Switch)
 */
export function switchActiveOrganization(
  orgId: string,
  state: GRCState
): GRCState {
  const targetOrg = state.organizations.find(o => o.id === orgId);
  if (!targetOrg) return state;

  const nextState: GRCState = {
    ...state,
    activeOrganizationId: orgId,
    organization: targetOrg,
    authSession: {
      ...state.authSession,
      activeOrganizationId: orgId
    }
  };

  saveGRCState(nextState);
  return nextState;
}

/**
 * Ajout d'un collaborateur ou d'une partie prenante
 */
export function addCollaboratorToState(
  collabData: Omit<Collaborator, 'id' | 'createdAt'>,
  state: GRCState,
  options?: {
    createPlatformAccount?: boolean;
    initialPassword?: string;
  }
): { state: GRCState; createdUser?: UserAccount } {
  const id = `collab-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`;
  const now = new Date().toISOString().slice(0, 10);

  let userId = collabData.userId;
  let createdUser: UserAccount | undefined = undefined;
  let nextAccounts = [...state.accounts];

  // Si on crée un compte applicatif lié
  if (options?.createPlatformAccount && collabData.email) {
    const existingUser = nextAccounts.find(u => u.email.toLowerCase() === collabData.email.toLowerCase());
    if (existingUser) {
      userId = existingUser.id;
      // Rattacher l'organisation au compte existant
      nextAccounts = nextAccounts.map(u => {
        if (u.id === existingUser.id) {
          const orgIds = Array.from(new Set([...(u.organizationIds || [u.organizationId]), collabData.organizationId]));
          const roleIds = Array.from(new Set([...u.roleIds, collabData.roleId]));
          return { ...u, organizationIds: orgIds, roleIds };
        }
        return u;
      });
    } else {
      // Créer un nouveau compte utilisateur
      const nameParts = collabData.fullName.trim().split(' ');
      const firstName = nameParts[0] || 'Collaborateur';
      const lastName = nameParts.slice(1).join(' ') || 'GRC';
      const newUserId = `user-${Date.now().toString(36)}`;
      
      createdUser = {
        id: newUserId,
        firstName,
        lastName,
        name: collabData.fullName,
        email: collabData.email,
        phone: collabData.phone,
        jobTitle: collabData.jobTitle,
        department: collabData.department,
        organizationId: collabData.organizationId,
        organizationIds: [collabData.organizationId],
        organizationName: state.organizations.find(o => o.id === collabData.organizationId)?.name || 'Organisation',
        roleIds: [collabData.roleId],
        status: collabData.invitationStatus === 'actif' ? 'actif' : 'desactive',
        passwordSalt: '8a2f4c1e7b9d3f5a',
        passwordHash: '8b7f32997194fecdc1e085c82db71597a7a2fdc9657b01b63ef5e4125b42d312', // PmeSecure2026!
        mustChangePassword: true,
        mfaEnabled: false,
        failedLoginAttempts: 0,
        lockedUntil: null,
        createdAt: now,
        avatarColor: 'bg-blue-600'
      };

      userId = newUserId;
      nextAccounts.push(createdUser);
    }
  }

  const newCollab: Collaborator = {
    ...collabData,
    id,
    userId,
    isPlatformUser: Boolean(userId || options?.createPlatformAccount),
    createdAt: now
  };

  const nextState: GRCState = {
    ...state,
    collaborators: [...state.collaborators, newCollab],
    accounts: nextAccounts
  };

  saveGRCState(nextState);
  return { state: nextState, createdUser };
}

/**
 * Mise à jour d'un collaborateur
 */
export function updateCollaboratorInState(
  collab: Collaborator,
  state: GRCState
): { success: boolean; state: GRCState; error?: string } {
  // Règle de sécurité : si c'est le dernier admin, on ne peut pas changer son rôle ni le désactiver
  if (isLastActiveAdmin(collab.organizationId, collab.id, state)) {
    if (collab.roleId !== 'role-org-admin' || collab.invitationStatus !== 'actif') {
      return {
        success: false,
        state,
        error: 'Action refusée : Impossible de rétrograder ou désactiver le dernier administrateur actif de cette organisation.'
      };
    }
  }

  const nextCollabs = state.collaborators.map(c => 
    c.id === collab.id ? { ...collab, updatedAt: new Date().toISOString().slice(0, 10) } : c
  );

  // Synchroniser le rôle si lié à un compte
  let nextAccounts = state.accounts;
  if (collab.userId) {
    nextAccounts = state.accounts.map(acc => {
      if (acc.id === collab.userId) {
        return {
          ...acc,
          name: collab.fullName,
          email: collab.email,
          phone: collab.phone || acc.phone,
          jobTitle: collab.jobTitle,
          department: collab.department,
          status: collab.invitationStatus === 'actif' ? 'actif' : acc.status,
          roleIds: Array.from(new Set([...acc.roleIds.filter(r => r !== 'role-org-admin' && r !== 'role-risk-owner' && r !== 'role-viewer'), collab.roleId]))
        };
      }
      return acc;
    });
  }

  const nextState: GRCState = {
    ...state,
    collaborators: nextCollabs,
    accounts: nextAccounts
  };

  saveGRCState(nextState);
  return { success: true, state: nextState };
}

/**
 * Suppression d'un collaborateur avec protection du dernier administrateur
 */
export function deleteCollaboratorFromState(
  collabId: string,
  state: GRCState
): { success: boolean; state: GRCState; error?: string } {
  const target = state.collaborators.find(c => c.id === collabId);
  if (!target) {
    return { success: false, state, error: 'Collaborateur introuvable.' };
  }

  // Protection du dernier administrateur actif
  if (isLastActiveAdmin(target.organizationId, target.id, state)) {
    return {
      success: false,
      state,
      error: 'Action refusée : Impossible de supprimer le dernier administrateur actif de l’organisation. Désignez un autre administrateur au préalable.'
    };
  }

  const nextCollabs = state.collaborators.filter(c => c.id !== collabId);

  const nextState: GRCState = {
    ...state,
    collaborators: nextCollabs
  };

  saveGRCState(nextState);
  return { success: true, state: nextState };
}

/**
 * Réinitialisation contrôlée des données de démonstration uniquement
 * Préserve intégralement les organisations et collaborateurs créés par l'utilisateur !
 */
export function resetDemoOrganizationOnly(state: GRCState): GRCState {
  const initialSoA = generateInitialSoA('org-pme-demo');

  // Filtrer les données hors démo
  const customOrgs = state.organizations.filter(o => o.id !== 'org-pme-demo');
  const customCollabs = state.collaborators.filter(c => c.organizationId !== 'org-pme-demo');
  const customAssets = state.assets.filter(a => a.organizationId !== 'org-pme-demo');
  const customRisks = state.risks.filter(r => r.organizationId !== 'org-pme-demo');
  const customActions = state.actions.filter(a => a.organizationId !== 'org-pme-demo');
  const customSoA = state.soa.filter(s => s.organizationId !== 'org-pme-demo');

  const nextState: GRCState = {
    ...state,
    organizations: [INITIAL_ORGANIZATION, ...customOrgs],
    activeOrganizationId: state.activeOrganizationId === 'org-pme-demo' ? 'org-pme-demo' : state.activeOrganizationId,
    organization: state.activeOrganizationId === 'org-pme-demo' ? INITIAL_ORGANIZATION : state.organization,
    collaborators: [...INITIAL_COLLABORATORS, ...customCollabs],
    assets: [...INITIAL_ASSETS, ...customAssets],
    risks: [...INITIAL_RISKS, ...customRisks],
    actions: [...INITIAL_ACTIONS, ...customActions],
    soa: [...initialSoA, ...customSoA]
  };

  saveGRCState(nextState);
  return nextState;
}

// Enregistrement d'un événement d'audit de sécurité
export function createAuditLogEntry(
  actor: { id: string; name: string; email: string },
  eventType: SecurityEventType,
  severity: 'info' | 'warning' | 'critical',
  targetResource: string,
  details: string,
  targetId?: string
): SecurityAuditLog {
  const now = new Date();
  const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  
  return {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: formattedDate,
    eventType,
    severity,
    actorId: actor.id,
    actorName: actor.name,
    actorEmail: actor.email,
    targetResource,
    targetId,
    details,
    ipAddress: '192.168.1.10 (Local)'
  };
}

// Export CSV des Utilisateurs
export function exportUsersToCSV(accounts: UserAccount[], roles: RoleDefinition[]): void {
  const headers = ['Nom', 'Prénom', 'Email', 'Téléphone', 'Fonction', 'Département', 'Statut', 'Rôles', 'MFA Actif', 'Dernière Connexion', 'Date Création'];
  const rows = accounts.map(u => {
    const userRoleNames = roles
      .filter(r => u.roleIds.includes(r.id))
      .map(r => r.name)
      .join('; ');

    return [
      `"${u.lastName.replace(/"/g, '""')}"`,
      `"${u.firstName.replace(/"/g, '""')}"`,
      `"${u.email.replace(/"/g, '""')}"`,
      `"${(u.phone || '').replace(/"/g, '""')}"`,
      `"${u.jobTitle.replace(/"/g, '""')}"`,
      `"${(u.department || '').replace(/"/g, '""')}"`,
      `"${u.status}"`,
      `"${userRoleNames.replace(/"/g, '""')}"`,
      u.mfaEnabled ? 'OUI' : 'NON',
      `"${u.lastLoginAt || 'Jamais'}"`,
      `"${u.createdAt}"`
    ].join(',');
  });

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `GRC-Goal_Utilisateurs_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Export CSV des Journaux d'Audit de Sécurité
export function exportAuditLogsToCSV(logs: SecurityAuditLog[]): void {
  const headers = ['Horodatage', 'Type Événement', 'Gravité', 'Acteur', 'Email Acteur', 'Ressource', 'ID Cible', 'Détails', 'Adresse IP'];
  const rows = logs.map(l => [
    `"${l.timestamp}"`,
    `"${l.eventType}"`,
    `"${l.severity}"`,
    `"${l.actorName.replace(/"/g, '""')}"`,
    `"${l.actorEmail.replace(/"/g, '""')}"`,
    `"${l.targetResource.replace(/"/g, '""')}"`,
    `"${l.targetId || ''}"`,
    `"${l.details.replace(/"/g, '""')}"`,
    `"${l.ipAddress}"`
  ].join(','));

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `GRC-Goal_Journal_Audit_Securite_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Export CSV Utilities (EF-10)
export function exportRisksToCSV(risks: Risk[], assets: Asset[]): void {
  const headers = ['Code', 'Titre', 'Actif', 'Menace', 'Vulnérabilité', 'Responsable', 'Probabilité', 'Impact', 'Score', 'Niveau', 'Stratégie', 'Statut'];
  const rows = risks.map(r => {
    const asset = assets.find(a => a.id === r.assetId)?.name || 'N/A';
    return [
      `"${r.code}"`,
      `"${r.title.replace(/"/g, '""')}"`,
      `"${asset.replace(/"/g, '""')}"`,
      `"${r.threat.replace(/"/g, '""')}"`,
      `"${r.vulnerability.replace(/"/g, '""')}"`,
      `"${r.owner}"`,
      r.probability,
      r.impact,
      r.score,
      `"${r.level}"`,
      `"${r.strategy}"`,
      `"${r.status}"`
    ].join(',');
  });

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `GRC-Goal_Registre_des_Risques_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportSoAToCSV(soa: SoAControl[]): void {
  const headers = ['Code', 'Intitulé', 'Domaine', 'Applicable', 'Statut de mise en œuvre', 'Maturité (1-5)', 'Justification', 'Preuve', 'Écart constaté'];
  const rows = soa.map(c => [
    `"${c.code}"`,
    `"${c.title.replace(/"/g, '""')}"`,
    `"${c.domain.replace(/"/g, '""')}"`,
    c.isApplicable ? 'OUI' : 'NON',
    `"${c.implementationStatus}"`,
    c.maturityLevel,
    `"${c.justification.replace(/"/g, '""')}"`,
    `"${c.evidenceRef.replace(/"/g, '""')}"`,
    `"${c.gapDescription.replace(/"/g, '""')}"`
  ].join(','));

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `GRC-Goal_Declaration_Applicabilite_SoA_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportActionsToCSV(actions: CorrectiveAction[]): void {
  const headers = ['Code', 'Titre', 'Source', 'Priorité', 'Responsable', 'Échéance', 'Statut', 'Preuve de clôture'];
  const rows = actions.map(a => [
    `"${a.code}"`,
    `"${a.title.replace(/"/g, '""')}"`,
    `"${a.source}"`,
    `"${a.priority}"`,
    `"${a.owner}"`,
    `"${a.dueDate}"`,
    `"${a.status}"`,
    `"${(a.evidenceOfClosure || '').replace(/"/g, '""')}"`
  ].join(','));

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `GRC-Goal_Plan_d_Actions_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportFullBackupJSON(state: GRCState): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
  const link = document.createElement('a');
  link.setAttribute('href', dataStr);
  link.setAttribute('download', `GRC-Goal_Sauvegarde_Complete_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportTestSheetsToCSV(sheets: UserTestSheet[]): void {
  const headers = [
    'Code',
    'Date',
    'Testeur',
    'Email',
    'Fonction',
    'Organisation',
    'Session',
    'Durée (min)',
    'Score Réussite (%)',
    'Utilité Perçue',
    'Note Recommandation (1-10)',
    'Signé',
    'Date Signature',
    'Évaluateur / Mentor',
    'Synthèse des retours'
  ];

  const rows = sheets.map(s => [
    `"${s.code}"`,
    `"${s.date}"`,
    `"${s.testerName.replace(/"/g, '""')}"`,
    `"${s.testerEmail.replace(/"/g, '""')}"`,
    `"${s.testerRole.replace(/"/g, '""')}"`,
    `"${s.organizationName.replace(/"/g, '""')}"`,
    `"${s.sessionTitle.replace(/"/g, '""')}"`,
    s.durationMinutes,
    s.globalScorePercent,
    `"${s.perceivedUtility}"`,
    s.recommendationScore,
    s.signedByTester ? 'OUI' : 'NON',
    `"${s.signatureDate || ''}"`,
    `"${(s.mentorOrEvaluatorName || '').replace(/"/g, '""')}"`,
    `"${s.feedbackNotes.replace(/"/g, '""')}"`
  ].join(','));

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `GRC-Goal_Fiches_Tests_Utilisateurs_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
