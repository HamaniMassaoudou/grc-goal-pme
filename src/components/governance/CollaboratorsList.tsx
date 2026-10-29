import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  ShieldCheck, 
  Mail, 
  Phone, 
  Briefcase, 
  Building, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  UserCheck, 
  UserX, 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  KeyRound,
  ExternalLink
} from 'lucide-react';
import { Collaborator, Organization } from '../../types/grc';
import { RoleDefinition, UserAccount } from '../../types/auth';

interface CollaboratorsListProps {
  collaborators: Collaborator[];
  organization: Organization;
  roles: RoleDefinition[];
  accounts: UserAccount[];
  currentUser: UserAccount | null;
  onOpenAddModal: () => void;
  onOpenEditModal: (collab: Collaborator) => void;
  onDeleteCollaborator: (collabId: string) => void;
  onToggleStatus: (collab: Collaborator) => void;
  onResendInvitation: (collab: Collaborator) => void;
}

export const CollaboratorsList: React.FC<CollaboratorsListProps> = ({
  collaborators,
  organization,
  roles,
  accounts,
  currentUser,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteCollaborator,
  onToggleStatus,
  onResendInvitation
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [inviteSentMessage, setInviteSentMessage] = useState<string | null>(null);

  // Filtrer les collaborateurs de l'organisation active
  const orgCollaborators = collaborators.filter(c => c.organizationId === organization.id);

  // Extraire les départements uniques pour le filtre
  const departments = Array.from(new Set(orgCollaborators.map(c => c.department).filter(Boolean)));

  const filteredCollaborators = orgCollaborators.filter(c => {
    const matchesSearch = 
      c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.grcResponsibilities.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = departmentFilter === 'ALL' || c.department === departmentFilter;
    const matchesStatus = statusFilter === 'ALL' || c.invitationStatus === statusFilter;
    const matchesRole = roleFilter === 'ALL' || c.roleId === roleFilter;

    return matchesSearch && matchesDept && matchesStatus && matchesRole;
  });

  // Métriques
  const totalCount = orgCollaborators.length;
  const platformUsersCount = orgCollaborators.filter(c => c.isPlatformUser).length;
  const externalStakeholdersCount = orgCollaborators.filter(c => !c.isPlatformUser).length;
  const pendingInvitesCount = orgCollaborators.filter(c => c.invitationStatus === 'invite').length;

  const handleResend = (collab: Collaborator) => {
    onResendInvitation(collab);
    setInviteSentMessage(`Invitation renvoyée avec succès à ${collab.email} !`);
    setTimeout(() => setInviteSentMessage(null), 3500);
  };

  return (
    <div className="space-y-4">
      
      {/* Toast d'invitation envoyée */}
      {inviteSentMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">{inviteSentMessage}</span>
          </div>
          <button 
            onClick={() => setInviteSentMessage(null)}
            className="text-emerald-600 hover:text-emerald-800 text-xs font-bold"
          >
            Fermer
          </button>
        </div>
      )}

      {/* Cartes métriques synthétiques */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Collaborateurs</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-extrabold text-slate-900">{totalCount}</span>
            <Users className="w-4 h-4 text-[#0B3B7B]" />
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Parties prenantes déclarées</p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Accès Plateforme</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-extrabold text-blue-700">{platformUsersCount}</span>
            <KeyRound className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Comptes utilisateurs actifs</p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Parties Prenantes Ext.</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-extrabold text-slate-700">{externalStakeholdersCount}</span>
            <Building className="w-4 h-4 text-slate-500" />
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Sans accès direct GRC-Goal</p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Invitations en cours</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-extrabold text-amber-600">{pendingInvitesCount}</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">En attente de connexion</p>
        </div>
      </div>

      {/* Barre d'actions & Filtres */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Recherche */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par nom, email, poste ou responsabilité..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-[#0B3B7B] focus:outline-none"
            />
          </div>

          {/* Bouton Ajouter */}
          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#0B3B7B] hover:bg-[#072a5a] rounded-lg transition shadow-xs whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4" />
            <span>Ajouter un collaborateur / partie prenante</span>
          </button>
        </div>

        {/* Ligne des filtres */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 text-xs">
          <span className="text-slate-400 flex items-center gap-1 text-[11px] font-medium mr-1">
            <Filter className="w-3 h-3" /> Filtres :
          </span>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-2.5 py-1 text-xs rounded-md border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none"
          >
            <option value="ALL">Tous les départements ({departments.length})</option>
            {departments.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-2.5 py-1 text-xs rounded-md border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none"
          >
            <option value="ALL">Tous les rôles RBAC</option>
            {roles.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1 text-xs rounded-md border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="actif">Actif</option>
            <option value="invite">Invité</option>
            <option value="desactive">Désactivé</option>
          </select>

          {(searchTerm || departmentFilter !== 'ALL' || statusFilter !== 'ALL' || roleFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setDepartmentFilter('ALL');
                setStatusFilter('ALL');
                setRoleFilter('ALL');
              }}
              className="text-xs text-[#0B3B7B] hover:underline font-semibold ml-auto"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      </div>

      {/* Tableau des Collaborateurs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredCollaborators.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">Aucun collaborateur trouvé</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {searchTerm || departmentFilter !== 'ALL' || statusFilter !== 'ALL'
                ? 'Essayez de modifier vos critères de recherche ou vos filtres.'
                : 'Ajoutez votre premier collaborateur ou partie prenante pour structurer la gouvernance GRC.'}
            </p>
            <button
              onClick={onOpenAddModal}
              className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#0B3B7B] rounded-lg hover:bg-[#072a5a] transition"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Ajouter un collaborateur</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Collaborateur / Partie Prenante</th>
                  <th className="py-3 px-4">Département & Fonction</th>
                  <th className="py-3 px-4">Rôle Applicatif</th>
                  <th className="py-3 px-4">Responsabilités GRC</th>
                  <th className="py-3 px-4">Accès & Statut</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCollaborators.map(collab => {
                  const role = roles.find(r => r.id === collab.roleId) || {
                    name: 'Rôle inconnu',
                    color: 'bg-slate-500'
                  };

                  const linkedAccount = accounts.find(a => a.id === collab.userId || a.email.toLowerCase() === collab.email.toLowerCase());

                  return (
                    <tr key={collab.id} className="hover:bg-slate-50/70 transition">
                      
                      {/* Nom & Email */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#0B3B7B]/10 text-[#0B3B7B] font-extrabold flex items-center justify-center text-xs shrink-0">
                            {collab.fullName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{collab.fullName}</span>
                              {collab.isPlatformUser && (
                                <span className="inline-flex items-center text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200/60" title="Compte de connexion applicatif">
                                  Plateforme
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3 text-slate-400" />
                                {collab.email}
                              </span>
                              {collab.phone && (
                                <span className="text-slate-400">· {collab.phone}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Département & Poste */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{collab.jobTitle || 'Non spécifié'}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Building className="w-3 h-3 text-slate-400" />
                          <span>{collab.department}</span>
                        </div>
                      </td>

                      {/* Rôle RBAC */}
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold text-white px-2 py-0.5 rounded-md ${role.color}`}>
                          <ShieldCheck className="w-3 h-3" />
                          <span>{role.name}</span>
                        </span>
                      </td>

                      {/* Responsabilités GRC */}
                      <td className="py-3 px-4 max-w-xs">
                        <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed" title={collab.grcResponsibilities}>
                          {collab.grcResponsibilities || 'Partie prenante aux revues'}
                        </p>
                      </td>

                      {/* Statut & Accès */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {collab.invitationStatus === 'actif' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Actif</span>
                          </span>
                        ) : collab.invitationStatus === 'invite' ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>Invité</span>
                            </span>
                            <button
                              onClick={() => handleResend(collab)}
                              className="block text-[10px] text-[#0B3B7B] hover:underline font-semibold"
                            >
                              Renvoyer invitation
                            </button>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            <UserX className="w-3 h-3 text-slate-500" />
                            <span>Désactivé</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          
                          {/* Modifier */}
                          <button
                            onClick={() => onOpenEditModal(collab)}
                            className="p-1.5 text-slate-500 hover:text-[#0B3B7B] hover:bg-slate-100 rounded-md transition"
                            title="Modifier les informations"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Activer / Désactiver */}
                          <button
                            onClick={() => onToggleStatus(collab)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition"
                            title={collab.invitationStatus === 'actif' ? 'Désactiver le compte' : 'Activer l’accès'}
                          >
                            {collab.invitationStatus === 'actif' ? (
                              <UserX className="w-3.5 h-3.5 text-amber-600" />
                            ) : (
                              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                            )}
                          </button>

                          {/* Supprimer */}
                          <button
                            onClick={() => {
                              if (window.confirm(`Confirmez-vous le retrait du collaborateur « ${collab.fullName} » de cette organisation ?`)) {
                                onDeleteCollaborator(collab.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition"
                            title="Supprimer le collaborateur"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                        </div>
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
