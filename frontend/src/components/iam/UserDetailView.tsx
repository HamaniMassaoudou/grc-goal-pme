import React, { useState, useEffect } from 'react';
import { ArrowLeft, Mail, Phone, Building2, Shield, Clock, Smartphone, AlertTriangle, CheckCircle, XCircle, KeyRound } from 'lucide-react';
import { UserAccount, RoleDefinition, UserSession, SecurityAuditLog } from '../../types/auth';

interface UserDetailViewProps {
  userId: string;
  user: UserAccount | null;
  roles: RoleDefinition[];
  sessions: UserSession[];
  auditLogs: SecurityAuditLog[];
  onBack: () => void;
  onEditUser: (user: UserAccount) => void;
  onResetPassword: (userId: string) => void;
  onRevokeSession: (sessionId: string) => void;
  onRevokeAllSessions: (userId: string) => void;
}

export const UserDetailView: React.FC<UserDetailViewProps> = ({
  userId,
  user,
  roles,
  sessions,
  auditLogs,
  onBack,
  onEditUser,
  onResetPassword,
  onRevokeSession,
  onRevokeAllSessions
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'sessions' | 'logs'>('info');

  if (!user) {
    return (
      <div className="p-6">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4">
          <ArrowLeft className="w-4 h-4" />
          <span>Retour</span>
        </button>
        <p className="text-slate-500">Utilisateur non trouvé</p>
      </div>
    );
  }

  const userRoles = roles.filter(r => user.roleIds.includes(r.id));
  const userSessions = sessions.filter(s => s.userId === userId);
  const userLogs = auditLogs.filter(l => l.actorId === userId || l.targetId === userId);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'actif':
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'suspendu':
        return <XCircle className="w-4 h-4 text-rose-600" />;
      case 'verrouillé':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="p-6">
      {/* En-tête avec bouton retour */}
      <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6">
        <ArrowLeft className="w-4 h-4" />
        <span>Retour à la liste</span>
      </button>

      {/* Carte principale utilisateur */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-lg ${user.avatarColor} text-white flex items-center justify-center text-2xl font-bold`}>
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
              <p className="text-slate-500 text-sm">{user.email}</p>
              <div className="flex items-center gap-2 mt-1">
                {getStatusIcon(user.status)}
                <span className="text-sm font-medium capitalize">{user.status}</span>
              </div>
            </div>
          </div>
          <div className="flex_gap-2">
            <button
              onClick={() => onEditUser(user)}
              className="px-4 py-2 bg-[#0B3B7B] text-white rounded-lg hover:bg-[#072a5a] transition text-sm font-medium"
            >
              Modifier
            </button>
            <button
              onClick={() => onResetPassword(user.id)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition text-sm font-medium"
            >
              Réinitialiser mot de passe
            </button>
          </div>
        </div>

        {/* Informations de contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <Mail className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Email</p>
              <p className="text-sm font-medium text-slate-900">{user.email}</p>
            </div>
          </div>
          {user.phone && (
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <Phone className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">Téléphone</p>
                <p className="text-sm font-medium text-slate-900">{user.phone}</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <Building2 className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Organisation</p>
              <p className="text-sm font-medium text-slate-900">{user.organizationName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <Shield className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Poste</p>
              <p className="text-sm font-medium text-slate-900">{user.jobTitle}</p>
            </div>
          </div>
        </div>

        {/* Rôles */}
        <div className="border-t border-slate-100 pt-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Rôles</p>
          <div className="flex flex-wrap gap-2">
            {userRoles.map(role => (
              <span
                key={role.id}
                className={`px-3 py-1 rounded-full text-xs font-medium text-white ${role.color}`}
              >
                {role.name}
              </span>
            ))}
          </div>
        </div>

        {/* Sécurité */}
        <div className="border-t border-slate-100 pt-4 mt-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Sécurité</p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Smartphone className={`w-4 h-4 ${user.mfaEnabled ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span className="text-sm text-slate-700">
                MFA: {user.mfaEnabled ? 'Activé' : 'Désactivé'}
              </span>
            </div>
            {user.mustChangePassword && (
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-600" />
                <span className="text-sm text-amber-700">Mot de passe à changer</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-6 py-3 text-sm font-medium transition ${
              activeTab === 'info'
                ? 'bg-blue-50 text-[#0B3B7B] border-b-2 border-[#0B3B7B]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Informations
          </button>
          <button
            onClick={() => setActiveTab('sessions')}
            className={`px-6 py-3 text-sm font-medium transition ${
              activeTab === 'sessions'
                ? 'bg-blue-50 text-[#0B3B7B] border-b-2 border-[#0B3B7B]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Sessions ({userSessions.length})
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-6 py-3 text-sm font-medium transition ${
              activeTab === 'logs'
                ? 'bg-blue-50 text-[#0B3B7B] border-b-2 border-[#0B3B7B]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Journal d'audit ({userLogs.length})
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Informations supplémentaires</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500">Département</p>
                    <p className="text-sm font-medium text-slate-900">{user.department || '-'}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500">ID Utilisateur</p>
                    <p className="text-sm font-medium text-slate-900">{user.id}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500">Créé le</p>
                    <p className="text-sm font-medium text-slate-900">{user.createdAt}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500">Dernière connexion</p>
                    <p className="text-sm font-medium text-slate-900">{user.lastLoginAt || 'Jamais'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sessions' && (
            <div className="space-y-3">
              {userSessions.length === 0 ? (
                <p className="text-slate-500 text-sm">Aucune session active</p>
              ) : (
                <>
                  {userSessions.map(session => (
                    <div key={session.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Smartphone className="w-5 h-5 text-slate-400" />
                        <div>
                          <p className="text-sm font-medium text-slate-900">{session.device}</p>
                          <p className="text-xs text-slate-500">{session.ip}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xs text-slate-500">Créée le</p>
                          <p className="text-sm text-slate-700">{session.createdAt}</p>
                        </div>
                        <button
                          onClick={() => onRevokeSession(session.id)}
                          className="px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        >
                          Révoquer
                        </button>
                      </div>
                    </div>
                  ))}
                  {userSessions.length > 1 && (
                    <button
                      onClick={() => onRevokeAllSessions(userId)}
                      className="w-full mt-4 px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition border border-rose-200"
                    >
                      Révoquer toutes les autres sessions
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-3">
              {userLogs.length === 0 ? (
                <p className="text-slate-500 text-sm">Aucun journal d'audit</p>
              ) : (
                userLogs.map(log => (
                  <div key={log.id} className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        log.severity === 'critical' ? 'bg-rose-100 text-rose-700' :
                        log.severity === 'warning' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {log.severity}
                      </span>
                      <span className="text-xs text-slate-500">{log.timestamp}</span>
                    </div>
                    <p className="text-sm font-medium text-slate-900 mb-1">{log.eventType}</p>
                    <p className="text-xs text-slate-600">{log.details}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
