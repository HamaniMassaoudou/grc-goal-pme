import React, { useState, useEffect } from 'react';
import { 
  Users, 
  X, 
  Save, 
  AlertCircle, 
  ShieldCheck, 
  Mail, 
  Phone, 
  Briefcase, 
  Building, 
  KeyRound,
  UserCheck,
  Send,
  Lock
} from 'lucide-react';
import { Collaborator, CollaboratorInvitationStatus } from '../../types/grc';
import { RoleDefinition } from '../../types/auth';

interface CollaboratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    collabData: Omit<Collaborator, 'id' | 'createdAt'> & { id?: string },
    options?: {
      createPlatformAccount?: boolean;
      initialPassword?: string;
    }
  ) => void;
  initialData?: Collaborator | null;
  organizationId: string;
  roles: RoleDefinition[];
  isLastAdmin?: boolean;
}

const DEPARTMENTS = [
  'Direction Générale',
  'Systèmes d’Information & IT',
  'Sécurité de l’Information & GRC',
  'Administration & Finances',
  'Commercial & Marketing',
  'Exploitation & Support',
  'Ressources Humaines',
  'Juridique & Conformité',
  'Partenaire / Prestataire Externe'
];

const GRC_RESPONSIBILITIES_EXAMPLES = [
  'Propriétaire de risques métier & Validation des fiches de traitement',
  'Gestionnaire d’actifs critiques (bases de données, serveurs)',
  'Porteur d’actions correctives et remédiation technique',
  'Référent conformité SoA ISO/IEC 27001 & Revue documentaire',
  'Arbitrage budgétaire et orientation stratégique de sécurité',
  'Sensibilisation du personnel et application des chartes'
];

export const CollaboratorModal: React.FC<CollaboratorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  organizationId,
  roles,
  isLastAdmin = false
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Direction Générale');
  const [jobTitle, setJobTitle] = useState('');
  const [roleId, setRoleId] = useState('role-risk-owner');
  const [grcResponsibilities, setGrcResponsibilities] = useState('');
  const [invitationStatus, setInvitationStatus] = useState<CollaboratorInvitationStatus>('actif');
  const [createPlatformAccount, setCreatePlatformAccount] = useState(false);
  const [initialPassword, setInitialPassword] = useState('PmeSecure2026!');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFullName(initialData.fullName || '');
      setEmail(initialData.email || '');
      setPhone(initialData.phone || '');
      setDepartment(initialData.department || 'Direction Générale');
      setJobTitle(initialData.jobTitle || '');
      setRoleId(initialData.roleId || 'role-risk-owner');
      setGrcResponsibilities(initialData.grcResponsibilities || '');
      setInvitationStatus(initialData.invitationStatus || 'actif');
      setCreatePlatformAccount(Boolean(initialData.userId || initialData.isPlatformUser));
    } else {
      setFullName('');
      setEmail('');
      setPhone('');
      setDepartment('Systèmes d’Information & IT');
      setJobTitle('');
      setRoleId('role-risk-owner');
      setGrcResponsibilities('Propriétaire de risques métier & suivi des actifs assignés.');
      setInvitationStatus('actif');
      setCreatePlatformAccount(true);
      setInitialPassword('PmeSecure2026!');
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError('Le nom complet est obligatoire.');
      return;
    }

    if (createPlatformAccount && (!email.trim() || !email.includes('@'))) {
      setError('Un courriel valide est indispensable pour associer un compte utilisateur applicatif.');
      return;
    }

    // Protection dernier admin
    if (isLastAdmin && (roleId !== 'role-org-admin' || invitationStatus !== 'actif')) {
      setError('Règle de sécurité : Vous ne pouvez pas rétrograder ou désactiver le dernier administrateur actif de cette organisation.');
      return;
    }

    onSave(
      {
        id: initialData?.id,
        organizationId,
        userId: initialData?.userId,
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        department: department.trim(),
        jobTitle: jobTitle.trim() || 'Collaborateur',
        roleId,
        grcResponsibilities: grcResponsibilities.trim() || 'Partie prenante aux processus GRC.',
        isPlatformUser: createPlatformAccount,
        invitationStatus,
        joinedAt: initialData?.joinedAt || (invitationStatus === 'actif' ? new Date().toISOString().slice(0, 10) : undefined),
        invitedAt: initialData?.invitedAt || (invitationStatus === 'invite' ? new Date().toISOString().slice(0, 10) : undefined)
      },
      {
        createPlatformAccount,
        initialPassword
      }
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Entête */}
        <div className="bg-[#0B3B7B] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                {initialData ? 'Modifier le collaborateur' : 'Ajouter un collaborateur / partie prenante'}
              </h2>
              <p className="text-xs text-blue-100">
                Gérez les responsabilités GRC et les accès applicatifs de votre organisation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {isLastAdmin && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <span>
                <strong>Attention :</strong> Ce collaborateur est l'unique administrateur actif de l'organisation. Son rôle et son statut sont protégés contre toute rétrogradation accidentelle.
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nom complet (Prénom & Nom) *
              </label>
              <input
                type="text"
                required
                placeholder="Ex. Abdoul Salam Issifi"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-[#0B3B7B] focus:outline-none font-semibold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Courriel professionnel *
              </label>
              <input
                type="email"
                required={createPlatformAccount}
                placeholder="email@organisation.ne"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-[#0B3B7B] focus:outline-none text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Téléphone
              </label>
              <input
                type="tel"
                placeholder="+227 90 00 00 00"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-[#0B3B7B] focus:outline-none text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Département / Direction
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-[#0B3B7B] focus:outline-none text-slate-800 bg-white"
              >
                {DEPARTMENTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Intitulé de poste / Fonction
              </label>
              <input
                type="text"
                placeholder="Ex. Responsable SI ou Directeur"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-[#0B3B7B] focus:outline-none text-slate-800"
              />
            </div>
          </div>

          {/* Rôle RBAC & Statut */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Rôle RBAC attribué *
              </label>
              <select
                value={roleId}
                onChange={(e) => setRoleId(e.target.value)}
                disabled={isLastAdmin}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-[#0B3B7B] focus:outline-none text-slate-800 bg-white disabled:bg-slate-100 disabled:text-slate-500 font-medium"
              >
                {roles.filter(r => r.id !== 'role-super-admin').map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Statut de l'accès
              </label>
              <select
                value={invitationStatus}
                onChange={(e) => setInvitationStatus(e.target.value as CollaboratorInvitationStatus)}
                disabled={isLastAdmin}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-[#0B3B7B] focus:outline-none text-slate-800 bg-white disabled:bg-slate-100 disabled:text-slate-500"
              >
                <option value="actif">Actif (Opérationnel)</option>
                <option value="invite">Invité (En attente de connexion)</option>
                <option value="desactive">Désactivé (Accès révoqué)</option>
              </select>
            </div>
          </div>

          {/* Responsabilités GRC */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Périmètre & Responsabilités GRC
              </label>
              <span className="text-[10px] text-slate-400">Rôle opérationnel dans la démarche</span>
            </div>
            <textarea
              rows={2}
              placeholder="Ex. Propriétaire d'actifs critiques, validation des plans d'action et suivi des risques majeurs..."
              value={grcResponsibilities}
              onChange={(e) => setGrcResponsibilities(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-[#0B3B7B] focus:outline-none text-slate-800"
            />
          </div>

          {/* Option Création de Compte Applicatif */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={createPlatformAccount}
                onChange={(e) => setCreatePlatformAccount(e.target.checked)}
                className="w-4 h-4 text-[#0B3B7B] rounded border-slate-300 focus:ring-[#0B3B7B]"
              />
              <span className="text-xs font-bold text-slate-900">
                Accès plateforme utilisateur (Compte de connexion)
              </span>
            </label>
            <p className="text-[11px] text-slate-500 pl-6">
              Permet au collaborateur de s'authentifier dans GRC-Goal avec ses identifiants et d'accéder aux fonctionnalités autorisées par son rôle RBAC.
            </p>

            {createPlatformAccount && !initialData?.userId && (
              <div className="pl-6 pt-1 flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px] text-slate-600">
                  Mot de passe provisoire initial : <code className="bg-slate-200 px-1.5 py-0.5 rounded font-mono font-bold text-slate-800">PmeSecure2026!</code> (invitation à changer à la 1re connexion)
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
            >
              Annuler
            </button>

            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#0B3B7B] hover:bg-[#072a5a] rounded-lg transition shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{initialData ? 'Mettre à jour' : 'Enregistrer le collaborateur'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
