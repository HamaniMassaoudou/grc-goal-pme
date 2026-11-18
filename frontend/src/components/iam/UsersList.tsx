import React, { useState, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Download, 
  Upload, 
  ShieldCheck, 
  KeyRound, 
  Edit3, 
  Lock, 
  Unlock, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  Smartphone,
  LogOut,
  Mail,
  Phone
} from 'lucide-react';
import { UserAccount, RoleDefinition, UserStatus } from '../../types/auth';
import { exportUsersToCSV } from '../../services/storage';

interface UsersListProps {
  users: UserAccount[];
  roles: RoleDefinition[];
  currentUserId: string;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canManageRoles: boolean;
  canExport: boolean;
  onOpenCreateModal: () => void;
  onOpenEditModal: (user: UserAccount) => void;
  onOpenResetPasswordModal: (user: UserAccount) => void;
  onToggleUserStatus: (userId: string, newStatus: UserStatus) => void;
  onRevokeUserSessions: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
}

export const UsersList: React.FC<UsersListProps> = ({
  users,
  roles,
  currentUserId,
  canCreate,
  canUpdate,
  canDelete,
  canManageRoles,
  canExport,
  onOpenCreateModal,
  onOpenEditModal,
  onOpenResetPasswordModal,
  onToggleUserStatus,
  onRevokeUserSessions,
  onDeleteUser
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch = 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.department || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
      const matchesRole = roleFilter === 'all' || u.roleIds.includes(roleFilter);

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [users, searchQuery, statusFilter, roleFilter]);

  const activeCount = users.filter(u => u.status === 'actif').length;
  const suspendedCount = users.filter(u => u.status === 'suspendu').length;
  const mfaCount = users.filter(u => u.mfaEnabled).length;

  const getStatusBadge = (status: UserStatus) => {
    switch (status) {
      case 'actif':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Actif</span>
          </span>
        );
      case 'suspendu':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            <span>Suspendu</span>
          </span>
        );
      case 'desactive':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            <span>Désactivé</span>
          </span>
        );
      case 'archive':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            <span>Archivé</span>
          </span>
        );
    }
  };

  const handleExport = () => {
    exportUsersToCSV(users, roles);
  };

  return (
    <div className="space-y-4">
      
      {/* Statistiques Rapides */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Utilisateurs enregistrés</span>
          <div className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums mt-0.5">
            {users.length}
          </div>
          <span className="text-[10px] text-slate-500">Comptes d’accès configurés</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Comptes actifs</span>
          <div className="text-2xl font-extrabold text-emerald-600 font-mono tabular-nums mt-0.5">
            {activeCount}
          </div>
          <span className="text-[10px] text-slate-500">Sessions autorisées</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">MFA Activé</span>
          <div className="text-2xl font-extrabold text-[#0B3B7B] font-mono tabular-nums mt-0.5">
            {mfaCount}
          </div>
          <span className="text-[10px] text-slate-500">Double facteur vérifié</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Comptes restreints</span>
          <div className="text-2xl font-extrabold text-rose-600 font-mono tabular-nums mt-0.5">
            {suspendedCount}
          </div>
          <span className="text-[10px] text-rose-600 font-medium">Suspendus / verrouillés</span>
        </div>
      </div>

      {/* Barre d'outils, Recherche & Filtres */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, email, département..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Filtre statut */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none capitalize"
          >
            <option value="all">Tous les statuts</option>
            <option value="actif">Actif</option>
            <option value="suspendu">Suspendu</option>
            <option value="desactive">Désactivé</option>
            <option value="archive">Archivé</option>
          </select>

          {/* Filtre rôle */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none max-w-[170px] truncate"
          >
            <option value="all">Tous les rôles</option>
            {roles.map(r => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>

          {/* Export CSV */}
          {canExport && (
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition shadow-xs"
              title="Exporter la liste des utilisateurs en CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>
          )}

          {/* Nouveau compte */}
          {canCreate && (
            <button
              onClick={onOpenCreateModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#0B3B7B] hover:bg-[#072a5a] rounded-lg transition shadow-xs whitespace-nowrap"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Nouvel Utilisateur</span>
            </button>
          )}
        </div>
      </div>

      {/* Tableau des Utilisateurs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <Users className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">Aucun utilisateur trouvé</p>
            <p className="text-xs text-slate-400">Modifiez les filtres de recherche ou créez un nouveau compte.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Utilisateur & Fonction</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Rôles Attribués (RBAC)</th>
                  <th className="py-3 px-3 text-center">MFA</th>
                  <th className="py-3 px-3">Statut</th>
                  <th className="py-3 px-3">Dernière Connexion</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => {
                  const userRoles = roles.filter(r => user.roleIds.includes(r.id));
                  const isCurrent = user.id === currentUserId;

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/70 transition">
                      
                      {/* Nom & Avatar */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg ${user.avatarColor} text-white flex items-center justify-center text-xs font-bold shrink-0`}>
                            {user.firstName[0]}{user.lastName[0]}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 truncate">{user.name}</span>
                              {isCurrent && (
                                <span className="text-[9px] font-bold text-[#0B3B7B] bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                                  Vous
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">
                              {user.jobTitle} {user.department ? `· ${user.department}` : ''}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3 px-4 text-slate-600">
                        <div className="flex items-center gap-1 text-[11px]">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{user.email}</span>
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                            <Phone className="w-3 h-3 shrink-0" />
                            <span>{user.phone}</span>
                          </div>
                        )}
                      </td>

                      {/* Rôles */}
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {userRoles.map(r => (
                            <span
                              key={r.id}
                              className={`text-[10px] font-bold text-white px-2 py-0.5 rounded shadow-2xs ${r.color}`}
                              title={r.description}
                            >
                              {r.name}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* MFA */}
                      <td className="py-3 px-3 text-center">
                        {user.mfaEnabled ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200" title="Double facteur activé">
                            <Smartphone className="w-3 h-3 text-blue-600" />
                            <span>MFA</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Non</span>
                        )}
                      </td>

                      {/* Statut */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {getStatusBadge(user.status)}
                      </td>

                      {/* Connexion */}
                      <td className="py-3 px-3 whitespace-nowrap text-[11px] text-slate-500 font-mono">
                        {user.lastLoginAt ? (
                          <div>
                            <div>{user.lastLoginAt}</div>
                            {user.lastLoginIp && (
                              <div className="text-[10px] text-slate-400 truncate max-w-[120px]">{user.lastLoginIp}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Jamais connecté</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                        {canUpdate && (
                          <button
                            onClick={() => onOpenEditModal(user)}
                            className="p-1.5 text-slate-400 hover:text-[#0B3B7B] hover:bg-slate-100 rounded transition"
                            title="Modifier le compte"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {canUpdate && (
                          <button
                            onClick={() => onOpenResetPasswordModal(user)}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-slate-100 rounded transition"
                            title="Réinitialiser le mot de passe"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {canUpdate && !isCurrent && (
                          <button
                            onClick={() => onToggleUserStatus(user.id, user.status === 'actif' ? 'suspendu' : 'actif')}
                            className={`p-1.5 rounded transition ${
                              user.status === 'actif'
                                ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                                : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={user.status === 'actif' ? 'Suspendre le compte' : 'Réactiver le compte'}
                          >
                            {user.status === 'actif' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                          </button>
                        )}

                        {canUpdate && (
                          <button
                            onClick={() => onRevokeUserSessions(user.id)}
                            className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded transition"
                            title="Révoquer toutes les sessions actives (Déconnexion forcée)"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {canDelete && !isCurrent && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Confirmez-vous la suppression du compte de ${user.name} ? Cette action est irréversible.`)) {
                                onDeleteUser(user.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                            title="Supprimer définitivement"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
