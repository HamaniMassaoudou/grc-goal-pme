import React, { useState } from 'react';
import { 
  Users, 
  ShieldCheck, 
  Laptop, 
  Activity, 
  Lock, 
  KeyRound,
  FileText
} from 'lucide-react';
import { 
  UserAccount, 
  RoleDefinition, 
  UserSession, 
  SecurityAuditLog, 
  SecuritySettings, 
  UserStatus 
} from '../../types/auth';
import { hasPermission } from '../../services/security';
import { UsersList } from './UsersList';
import { RolesList } from './RolesList';
import { SessionsList } from './SessionsList';
import { AuditLogsView } from './AuditLogsView';

interface IamViewProps {
  currentUser: UserAccount | null;
  users: UserAccount[];
  roles: RoleDefinition[];
  sessions: UserSession[];
  auditLogs: SecurityAuditLog[];
  securitySettings: SecuritySettings;
  currentSessionId: string | null;
  onOpenCreateUserModal: () => void;
  onOpenEditUserModal: (user: UserAccount) => void;
  onOpenResetPasswordModal: (user: UserAccount) => void;
  onToggleUserStatus: (userId: string, newStatus: UserStatus) => void;
  onRevokeUserSessions: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
  onOpenCreateRoleModal: () => void;
  onOpenEditRoleModal: (role: RoleDefinition) => void;
  onCloneRole: (role: RoleDefinition) => void;
  onDeleteRole: (roleId: string) => void;
  onRevokeSession: (sessionId: string) => void;
  onRevokeAllOtherSessions: () => void;
  onUpdateSecuritySettings: (newSettings: SecuritySettings) => void;
}

export const IamView: React.FC<IamViewProps> = ({
  currentUser,
  users,
  roles,
  sessions,
  auditLogs,
  securitySettings,
  currentSessionId,
  onOpenCreateUserModal,
  onOpenEditUserModal,
  onOpenResetPasswordModal,
  onToggleUserStatus,
  onRevokeUserSessions,
  onDeleteUser,
  onOpenCreateRoleModal,
  onOpenEditRoleModal,
  onCloneRole,
  onDeleteRole,
  onRevokeSession,
  onRevokeAllOtherSessions,
  onUpdateSecuritySettings
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'sessions' | 'audit'>('users');

  // Permissions côté client (complétées par les vérifications serveur/gestionnaire)
  const canViewUsers = hasPermission(currentUser, roles, 'users', 'view');
  const canCreateUsers = hasPermission(currentUser, roles, 'users', 'create');
  const canUpdateUsers = hasPermission(currentUser, roles, 'users', 'update');
  const canDeleteUsers = hasPermission(currentUser, roles, 'users', 'delete');
  const canManageRoles = hasPermission(currentUser, roles, 'roles', 'manage') || hasPermission(currentUser, roles, 'roles', 'update');
  const canViewRoles = hasPermission(currentUser, roles, 'roles', 'view');
  const canViewAudit = hasPermission(currentUser, roles, 'audit_logs', 'view');
  const canExportUsers = hasPermission(currentUser, roles, 'users', 'export');
  const canExportAudit = hasPermission(currentUser, roles, 'audit_logs', 'export');

  const tabs = [
    {
      id: 'users',
      label: 'Utilisateurs & Profils',
      count: users.length,
      icon: Users,
      allowed: canViewUsers
    },
    {
      id: 'roles',
      label: 'Rôles & Permissions (RBAC)',
      count: roles.length,
      icon: ShieldCheck,
      allowed: canViewRoles
    },
    {
      id: 'sessions',
      label: 'Sessions & Politiques de Sécurité',
      count: sessions.length,
      icon: Laptop,
      allowed: canManageRoles || canViewUsers
    },
    {
      id: 'audit',
      label: 'Journal d’Audit de Sécurité',
      count: auditLogs.length,
      icon: Activity,
      allowed: canViewAudit
    }
  ];

  return (
    <div className="space-y-5">
      
      {/* En-tête du Module IAM */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            Administration des Utilisateurs & Rôles RBAC
          </h1>
        </div>
      </div>

      {/* Onglets de Navigation Principaux */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 pb-1">
        {tabs.map((tab) => {
          if (!tab.allowed) return null;
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
                isActive
                  ? 'bg-[#0B3B7B] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Contenu selon l'onglet actif */}
      {activeTab === 'users' && canViewUsers && (
        <UsersList
          users={users}
          roles={roles}
          currentUserId={currentUser?.id || ''}
          canCreate={canCreateUsers}
          canUpdate={canUpdateUsers}
          canDelete={canDeleteUsers}
          canManageRoles={canManageRoles}
          canExport={canExportUsers}
          onOpenCreateModal={onOpenCreateUserModal}
          onOpenEditModal={onOpenEditUserModal}
          onOpenResetPasswordModal={onOpenResetPasswordModal}
          onToggleUserStatus={onToggleUserStatus}
          onRevokeUserSessions={onRevokeUserSessions}
          onDeleteUser={onDeleteUser}
        />
      )}

      {activeTab === 'roles' && canViewRoles && (
        <RolesList
          roles={roles}
          users={users}
          canManageRoles={canManageRoles}
          onOpenCreateRoleModal={onOpenCreateRoleModal}
          onOpenEditRoleModal={onOpenEditRoleModal}
          onCloneRole={onCloneRole}
          onDeleteRole={onDeleteRole}
        />
      )}

      {activeTab === 'sessions' && (
        <SessionsList
          sessions={sessions}
          currentSessionId={currentSessionId}
          securitySettings={securitySettings}
          users={users}
          canManageSettings={canManageRoles}
          onRevokeSession={onRevokeSession}
          onRevokeAllOtherSessions={onRevokeAllOtherSessions}
          onUpdateSecuritySettings={onUpdateSecuritySettings}
        />
      )}

      {activeTab === 'audit' && canViewAudit && (
        <AuditLogsView
          logs={auditLogs}
          canExport={canExportAudit}
        />
      )}

    </div>
  );
};
