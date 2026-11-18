export type PermissionAction = 
  | 'view' 
  | 'create' 
  | 'update' 
  | 'delete' 
  | 'approve' 
  | 'export' 
  | 'manage';

export type ModuleResource = 
  | 'dashboard' 
  | 'risks' 
  | 'soa' 
  | 'actions' 
  | 'assets' 
  | 'governance' 
  | 'users' 
  | 'roles' 
  | 'audit_logs' 
  | 'test_protocol'
  | 'notifications';

export type UserStatus = 'actif' | 'suspendu' | 'desactive' | 'archive';

export interface UserSession {
  id: string;
  userId: string;
  token: string;
  createdAt: string;
  lastActivityAt: string;
  expiresAt: string;
  ip: string;
  userAgent: string;
  device: string;
  isCurrent?: boolean;
}

export interface UserAccount {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone?: string;
  jobTitle: string;
  department?: string;
  organizationId: string; // Organisation active par défaut
  organizationIds: string[]; // Liste des organisations dont l'utilisateur est membre
  organizationName: string;
  roleIds: string[];
  status: UserStatus;
  passwordHash: string;
  passwordSalt: string;
  mustChangePassword?: boolean;
  mfaEnabled: boolean;
  mfaSecret?: string;
  failedLoginAttempts: number;
  lockedUntil?: string | null;
  createdAt: string;
  lastLoginAt?: string | null;
  lastLoginIp?: string | null;
  avatarColor: string;
}

export interface RoleDefinition {
  id: string;
  code: string;
  name: string;
  description: string;
  isSystem: boolean; // Les rôles système ne peuvent être supprimés
  isActive: boolean;
  color: string;
  permissions: Record<ModuleResource, PermissionAction[]>;
}

export type SecurityEventType = 
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'ACCOUNT_LOCKED'
  | 'ACCOUNT_UNLOCKED'
  | 'LOGOUT'
  | 'SESSION_REVOKED'
  | 'ALL_SESSIONS_REVOKED'
  | 'USER_CREATED'
  | 'USER_UPDATED'
  | 'USER_DELETED'
  | 'USER_STATUS_CHANGED'
  | 'PASSWORD_RESET'
  | 'PASSWORD_CHANGED'
  | 'MFA_TOGGLED'
  | 'ROLE_CREATED'
  | 'ROLE_UPDATED'
  | 'ROLE_DELETED'
  | 'ROLE_ASSIGNED'
  | 'PERMISSION_DENIED'
  | 'EXPORT_EXECUTED'
  | 'SECURITY_SETTINGS_UPDATED'
  | 'ORGANIZATION_CREATED'
  | 'ORGANIZATION_UPDATED'
  | 'ORGANIZATION_SWITCHED'
  | 'COLLABORATOR_INVITED'
  | 'COLLABORATOR_UPDATED'
  | 'COLLABORATOR_REMOVED';

export interface SecurityAuditLog {
  id: string;
  timestamp: string;
  eventType: SecurityEventType;
  severity: 'info' | 'warning' | 'critical';
  actorId: string;
  actorName: string;
  actorEmail: string;
  targetResource: string;
  targetId?: string;
  details: string;
  ipAddress: string;
}

export interface SecuritySettings {
  passwordMinLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireSymbols: boolean;
  maxFailedAttempts: number;
  lockoutDurationMinutes: number;
  sessionTimeoutMinutes: number;
  mfaMandatoryForAdmins: boolean;
}

export interface AuthSessionState {
  isAuthenticated: boolean;
  currentUserId: string | null;
  currentSessionId: string | null;
  mfaPendingUserId: string | null;
  activeOrganizationId?: string | null;
}
