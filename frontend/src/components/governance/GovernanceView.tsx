import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Users, 
  FileCheck, 
  Target, 
  Award, 
  Compass, 
  Save, 
  CheckCircle2, 
  ExternalLink,
  Edit3,
  Plus,
  Mail,
  Phone,
  MapPin,
  Clock,
  Sparkles,
  KeyRound,
  Layers,
  HelpCircle
} from 'lucide-react';
import { Organization, Collaborator } from '../../types/grc';
import { RoleDefinition, UserAccount } from '../../types/auth';
import { CollaboratorsList } from './CollaboratorsList';

interface GovernanceViewProps {
  organization: Organization;
  collaborators: Collaborator[];
  roles: RoleDefinition[];
  accounts: UserAccount[];
  currentUser: UserAccount;
  onUpdateOrganization: (updatedOrg: Organization) => void;
  onOpenCreateOrgModal: () => void;
  onOpenEditOrgModal: () => void;
  onOpenAddCollaboratorModal: () => void;
  onOpenEditCollaboratorModal: (collab: Collaborator) => void;
  onDeleteCollaborator: (collabId: string) => void;
  onToggleCollaboratorStatus: (collab: Collaborator) => void;
  onResendInvitation: (collab: Collaborator) => void;
  canManageOrg?: boolean;
}

export const GovernanceView: React.FC<GovernanceViewProps> = ({
  organization,
  collaborators,
  roles,
  accounts,
  currentUser,
  onUpdateOrganization,
  onOpenCreateOrgModal,
  onOpenEditOrgModal,
  onOpenAddCollaboratorModal,
  onOpenEditCollaboratorModal,
  onDeleteCollaborator,
  onToggleCollaboratorStatus,
  onResendInvitation,
  canManageOrg = true
}) => {
  const [activeTab, setActiveTab] = useState<'fiche' | 'collaborateurs' | 'cadrage'>('fiche');

  // Filtrer les collaborateurs de l'organisation active
  const orgCollabs = collaborators.filter(c => c.organizationId === organization.id);

  const tabs = [
    {
      id: 'fiche',
      label: 'Fiche de l’Organisation & Périmètre GRC',
      icon: Building2,
      badge: organization.status === 'active' ? 'Active' : organization.status
    },
    {
      id: 'collaborateurs',
      label: 'Collaborateurs & Parties Prenantes',
      icon: Users,
      count: orgCollabs.length
    },
    {
      id: 'cadrage',
      label: 'Parties Prenantes Référentes (B14)',
      icon: ShieldCheck
    }
  ];

  const stakeholdersB14 = [
    {
      role: 'Participant & Développeur (B14)',
      name: 'Hamani Massaoudou',
      title: 'Concepteur de l’outil GRC-Goal & Développeur',
      organization: 'Programme d’Excellence en Cybersécurité · Niger 2026',
      responsibilities: 'Analyse des besoins PME, architecture multi-tenant, modèle de données GRC, mise en œuvre SoA ISO 27001 et protocole de validation.'
    },
    {
      role: 'Testeur Tiers Identifié',
      name: 'Abdoul Salam Issifi',
      title: 'Responsable de Sirba Communication',
      organization: 'Sirba Communication (Niamey)',
      responsibilities: 'Exécution du protocole de test en conditions réelles de PME, évaluation ergonomique et validation d’utilisabilité opérationnelle.'
    },
    {
      role: 'Mentor Référent GRC',
      name: 'Aboubacar Yacouba Mai Birni',
      title: 'Expert Cybersécurité & Mentorat',
      organization: 'APSI-NE (Filière Gouvernance, Risques & Conformité)',
      responsibilities: 'Orientation méthodologique, arbitrage des contrôles ISO 27001, évaluation du matériau propre et validation du cadre de test.'
    }
  ];

  return (
    <div className="space-y-5">
      
      {/* En-tête du Module */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Gouvernance, Organisation & Collaborateurs
            </h1>
            {organization.isDemo && (
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-[#0B3B7B] border border-blue-200 uppercase tracking-wider">
                Organisation Démo B14
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Administration de l'organisation active « {organization.name} » et pilotage des responsabilités GRC
          </p>
        </div>

        {canManageOrg && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenEditOrgModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition shadow-xs"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
              <span>Modifier la fiche</span>
            </button>

            <button
              onClick={onOpenCreateOrgModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#0B3B7B] hover:bg-[#072a5a] rounded-lg transition shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Créer une nouvelle organisation</span>
            </button>
          </div>
        )}
      </div>

      {/* Onglets de navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto">
        {tabs.map(tab => {
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
              {tab.count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {tab.count}
                </span>
              )}
              {tab.badge && (
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider ${
                  isActive ? 'bg-emerald-400 text-slate-900' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* CONTENU DE L'ONGLET 1 : FICHE & PARAMÈTRES DE L'ORGANISATION */}
      {activeTab === 'fiche' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Fiche détaillée de l'organisation */}
          <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0B3B7B] to-[#154c96] text-white flex items-center justify-center font-extrabold text-base shadow-xs">
                  {organization.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{organization.name}</h2>
                  <p className="text-xs text-slate-500 font-medium">
                    {organization.legalName ? `${organization.legalName} · ` : ''}{organization.sector}
                  </p>
                </div>
              </div>

              {canManageOrg && (
                <button
                  onClick={onOpenEditOrgModal}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0B3B7B] bg-blue-50 hover:bg-blue-100 rounded-lg transition self-start"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Modifier les informations</span>
                </button>
              )}
            </div>

            {/* Grille des caractéristiques */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Dirigeant / Représentant légal
                </span>
                <p className="font-bold text-slate-900 text-sm">{organization.contactName || 'Non renseigné'}</p>
                <div className="flex items-center gap-1 text-slate-500 pt-0.5">
                  <Mail className="w-3 h-3 text-slate-400" />
                  <span>{organization.contactEmail}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Référent Sécurité / Correspondant GRC
                </span>
                <p className="font-bold text-slate-900 text-sm">{organization.securityOfficer || 'Non désigné'}</p>
                <div className="flex items-center gap-1 text-slate-500 pt-0.5">
                  <ShieldCheck className="w-3 h-3 text-[#0B3B7B]" />
                  <span>Point focal cybersécurité & SoA</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Taille & Effectif
                </span>
                <p className="font-bold text-slate-900">{organization.size || 'TPE / PME'}</p>
                <p className="text-slate-500 text-[11px]">{organization.sector}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Coordonnées & Siège
                </span>
                <div className="text-slate-800 font-medium flex items-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{organization.address || 'Non spécifiée'}</span>
                </div>
                {organization.phone && (
                  <div className="flex items-center gap-1 text-slate-500 text-[11px] pt-0.5">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{organization.phone}</span>
                  </div>
                )}
              </div>

            </div>

            {/* Périmètre GRC cible */}
            <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 space-y-1.5 text-xs">
              <span className="text-[11px] font-bold text-[#0B3B7B] uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-[#0B3B7B]" />
                <span>Périmètre d'Application GRC & Déclaration SoA (ISO/IEC 27001:2022)</span>
              </span>
              <p className="text-slate-800 leading-relaxed font-medium">
                {organization.grcScope || 'Système d’information, postes informatiques, facturation et données clients.'}
              </p>
            </div>

            {/* Contexte opérationnel & Enjeux */}
            <div className="space-y-1.5 text-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Contexte opérationnel & Objectifs de sécurité
              </span>
              <p className="text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 leading-relaxed">
                {organization.description || 'Démarche de gouvernance, gestion des risques et conformité pour sécuriser les activités de la structure.'}
              </p>
            </div>

            {/* Métadonnées techniques */}
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
              <div className="flex items-center gap-3">
                <span>ID Technique : <code className="font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">{organization.id}</code></span>
                <span>Statut : <span className="font-bold text-slate-700 uppercase">{organization.status}</span></span>
              </div>
              <span>Date de création : {organization.createdAt}</span>
            </div>

          </div>

          {/* Volet latéral récapitulatif */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Résumé de l'équipe locale */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#0B3B7B]" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Équipe GRC & Collaborateurs
                  </h3>
                </div>
                <span className="text-xs font-bold bg-blue-100 text-[#0B3B7B] px-2 py-0.5 rounded-full">
                  {orgCollabs.length}
                </span>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {orgCollabs.slice(0, 5).map(c => {
                  const role = roles.find(r => r.id === c.roleId);
                  return (
                    <div key={c.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate">{c.fullName}</p>
                        <p className="text-[10px] text-slate-500 truncate">{c.jobTitle}</p>
                      </div>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded text-white shrink-0 ${role?.color || 'bg-slate-500'}`}>
                        {role?.name.split('/')[0].trim() || 'Rôle'}
                      </span>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setActiveTab('collaborateurs')}
                className="w-full py-2 px-3 text-xs font-semibold text-[#0B3B7B] bg-blue-50 hover:bg-blue-100 rounded-lg transition text-center flex items-center justify-center gap-1.5"
              >
                <span>Gérer tous les collaborateurs ({orgCollabs.length})</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Note d'isolation multi-tenant */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white text-xs space-y-2 shadow-xs">
              <div className="flex items-center gap-1.5 text-blue-300 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Isolation Stricte des Données</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Toutes les entités de cette organisation (risques, actifs, mesures SoA ISO 27001, plans d'actions et collaborateurs) sont strictement cloisonnées. Aucun utilisateur externe ne peut accéder aux données de cet espace sans y avoir été formellement invité.
              </p>
            </div>

          </div>

        </div>
      )}

      {/* CONTENU DE L'ONGLET 2 : GESTION DES COLLABORATEURS ET PARTIES PRENANTES */}
      {activeTab === 'collaborateurs' && (
        <CollaboratorsList
          collaborators={collaborators}
          organization={organization}
          roles={roles}
          accounts={accounts}
          currentUser={currentUser}
          onOpenAddModal={onOpenAddCollaboratorModal}
          onOpenEditModal={onOpenEditCollaboratorModal}
          onDeleteCollaborator={onDeleteCollaborator}
          onToggleStatus={onToggleCollaboratorStatus}
          onResendInvitation={onResendInvitation}
        />
      )}

      {/* CONTENU DE L'ONGLET 3 : CADRAGE B14 & PARTIES PRENANTES OFFICIELLES */}
      {activeTab === 'cadrage' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#0B3B7B]" />
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Parties Prenantes Référentes du Projet B14
                </h2>
                <p className="text-xs text-slate-500">
                  Acteurs clés de la conception, du test tiers en PME et de l’évaluation académique
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              {stakeholdersB14.map((s, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-[#0B3B7B] uppercase tracking-wider bg-blue-100/70 px-2 py-0.5 rounded">
                      {s.role}
                    </span>
                  </div>
                  <p className="font-extrabold text-slate-900 text-sm">{s.name}</p>
                  <p className="text-slate-700 font-semibold">{s.title}</p>
                  <p className="text-[11px] text-slate-500 font-medium">{s.organization}</p>
                  <p className="text-[11px] text-slate-600 pt-2 border-t border-slate-200/70 mt-2 leading-relaxed">
                    {s.responsibilities}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-[#0B3B7B] space-y-2.5">
              <div className="flex items-center gap-1.5 font-bold">
                <Target className="w-4 h-4" />
                <span>Objectifs d’Autonomie & Sans Dépendance</span>
              </div>
              <p className="text-[11px] text-blue-900 leading-relaxed">
                L'application GRC-Goal a été pensée pour répondre aux contraintes réelles des structures de taille modeste : simplicité d'accès, aucun abonnement cloud requis, stockage local sécurisé et réplication immédiate des pratiques recommandées par l'ISO/IEC 27001:2022.
              </p>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
