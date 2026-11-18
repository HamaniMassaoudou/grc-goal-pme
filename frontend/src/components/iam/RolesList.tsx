import React, { useState } from 'react';
import { 
  Shield, 
  Plus, 
  Edit3, 
  Trash2, 
  Copy, 
  CheckCircle2, 
  XCircle, 
  Table, 
  LayoutGrid,
  Info,
  Check
} from 'lucide-react';
import { RoleDefinition, UserAccount, ModuleResource, PermissionAction } from '../../types/auth';
import { ALL_RESOURCES_CONFIG, ALL_ACTIONS_CONFIG } from '../../data/rolesData';

interface RolesListProps {
  roles: RoleDefinition[];
  users: UserAccount[];
  canManageRoles: boolean;
  onOpenCreateRoleModal: () => void;
  onOpenEditRoleModal: (role: RoleDefinition) => void;
  onCloneRole: (role: RoleDefinition) => void;
  onDeleteRole: (roleId: string) => void;
}

export const RolesList: React.FC<RolesListProps> = ({
  roles,
  users,
  canManageRoles,
  onOpenCreateRoleModal,
  onOpenEditRoleModal,
  onCloneRole,
  onDeleteRole
}) => {
  const [viewMode, setViewMode] = useState<'cards' | 'matrix'>('cards');
  const [selectedResourceForDetails, setSelectedResourceForDetails] = useState<ModuleResource>('risks');

  return (
    <div className="space-y-5">
      
      {/* En-tête avec bouton nouveau rôle et switcher de vue */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            Rôles & Matrice de Contrôle d’Accès (RBAC)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Application stricte du principe du moindre privilège et du refus par défaut
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Segmented view switcher */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs">
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition ${
                viewMode === 'cards' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cartes des Rôles</span>
            </button>
            <button
              onClick={() => setViewMode('matrix')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition ${
                viewMode === 'matrix' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Matrice Complète</span>
            </button>
          </div>

          {canManageRoles && (
            <button
              onClick={onOpenCreateRoleModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#0B3B7B] hover:bg-[#072a5a] rounded-lg transition shadow-xs whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nouveau Rôle</span>
            </button>
          )}
        </div>
      </div>

      {/* Vue 1 : Cartes des rôles */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((role) => {
            const userCount = users.filter(u => u.roleIds.includes(role.id)).length;
            
            // Calculer le total d'actions autorisées
            let totalAllowedActions = 0;
            Object.values(role.permissions).forEach(acts => {
              if (acts.includes('manage')) totalAllowedActions += 7;
              else totalAllowedActions += acts.length;
            });

            return (
              <div 
                key={role.id} 
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono font-bold text-white px-2 py-0.5 rounded shadow-2xs ${role.color}`}>
                        {role.code}
                      </span>
                      {role.isSystem && (
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                          Système
                        </span>
                      )}
                    </div>

                    <span className="text-xs font-mono font-semibold text-slate-600 tabular-nums">
                      {userCount} utilisateur{userCount > 1 ? 's' : ''}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mt-2.5">
                    {role.name}
                  </h3>

                  <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                    {role.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1">
                    <div className="flex justify-between">
                      <span>Privilèges actifs :</span>
                      <strong className="text-slate-800 font-mono tabular-nums">{totalAllowedActions} permissions</strong>
                    </div>
                  </div>
                </div>

                {/* Actions sur le rôle */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">
                    {role.isSystem ? 'Rôle socle protégé' : 'Rôle personnalisable'}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onCloneRole(role)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition"
                      title="Dupliquer ce rôle pour créer une variante"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    {canManageRoles && (
                      <button
                        onClick={() => onOpenEditRoleModal(role)}
                        className="p-1.5 text-slate-400 hover:text-[#0B3B7B] hover:bg-slate-100 rounded transition"
                        title="Consulter et modifier les permissions"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {canManageRoles && !role.isSystem && (
                      <button
                        onClick={() => {
                          if (userCount > 0) {
                            alert(`Impossible de supprimer ce rôle : il est actuellement attribué à ${userCount} utilisateur(s). Réassignez leurs rôles d'abord.`);
                            return;
                          }
                          if (window.confirm(`Supprimer définitivement le rôle "${role.name}" ?`)) {
                            onDeleteRole(role.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                        title="Supprimer ce rôle personnalisé"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Vue 2 : Matrice globale de comparaison (Section 6 du Cahier des charges) */}
      {viewMode === 'matrix' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Table className="w-4 h-4 text-[#0B3B7B]" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Matrice Détaillée des Autorisations Multi-Rôles
              </h3>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-600" /> Autorisé
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-0.5 bg-slate-300 inline-block" /> Interdit
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-[10px] font-semibold uppercase text-slate-600">
                <tr>
                  <th className="py-3 px-4 min-w-[160px]">Ressource</th>
                  <th className="py-3 px-2 text-center min-w-[70px]">Action</th>
                  {roles.map(r => (
                    <th key={r.id} className="py-3 px-2 text-center min-w-[90px]">
                      <span className={`inline-block px-1.5 py-0.2 rounded text-[9px] text-white font-bold ${r.color}`}>
                        {r.code}
                      </span>
                      <div className="truncate text-[10px] text-slate-700 font-bold mt-0.5 max-w-[85px] mx-auto">
                        {r.name.split(' ')[0]}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ALL_RESOURCES_CONFIG.map((res) => {
                  return (
                    <React.Fragment key={res.id}>
                      <tr className="bg-slate-50/70">
                        <td colSpan={2 + roles.length} className="py-2 px-4 font-bold text-slate-800 bg-slate-50">
                          {res.name} <span className="font-normal text-slate-400">({res.description})</span>
                        </td>
                      </tr>
                      {ALL_ACTIONS_CONFIG.slice(0, 5).map((act) => (
                        <tr key={`${res.id}-${act.id}`} className="hover:bg-slate-50/30">
                          <td className="py-1.5 px-4 text-slate-500 pl-6">↳ {res.name}</td>
                          <td className="py-1.5 px-2 text-center font-semibold text-slate-700">
                            {act.label}
                          </td>
                          {roles.map(role => {
                            const pList = role.permissions[res.id] || [];
                            const isAllowed = pList.includes(act.id) || pList.includes('manage');

                            return (
                              <td key={role.id} className="py-1.5 px-2 text-center">
                                {isAllowed ? (
                                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 mx-auto">
                                    <Check className="w-3.5 h-3.5 font-bold" />
                                  </span>
                                ) : (
                                  <span className="text-slate-300">—</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
