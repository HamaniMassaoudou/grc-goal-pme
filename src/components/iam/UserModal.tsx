import React, { useState, useEffect } from 'react';
import { X, Shield, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';
import { UserAccount, RoleDefinition, UserStatus, SecuritySettings } from '../../types/auth';
import { validatePasswordStrength, generateSalt, hashPassword, generateMfaSecret } from '../../services/security';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: Partial<UserAccount>, plainPassword?: string) => void;
  initialUser?: UserAccount | null;
  roles: RoleDefinition[];
  securitySettings: SecuritySettings;
  currentUserId: string;
}

export const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialUser,
  roles,
  securitySettings,
  currentUserId
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [status, setStatus] = useState<UserStatus>('actif');
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [password, setPassword] = useState('');
  const [mustChangePassword, setMustChangePassword] = useState(false);

  useEffect(() => {
    if (initialUser) {
      setFirstName(initialUser.firstName);
      setLastName(initialUser.lastName);
      setEmail(initialUser.email);
      setPhone(initialUser.phone || '');
      setJobTitle(initialUser.jobTitle);
      setDepartment(initialUser.department || '');
      setSelectedRoleIds(initialUser.roleIds);
      setStatus(initialUser.status);
      setMfaEnabled(initialUser.mfaEnabled);
      setPassword('');
      setMustChangePassword(initialUser.mustChangePassword || false);
    } else {
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setJobTitle('');
      setDepartment('Sécurité & Conformité');
      setSelectedRoleIds(['role-viewer']);
      setStatus('actif');
      setMfaEnabled(false);
      setPassword('PmeSecure2026!');
      setMustChangePassword(true);
    }
  }, [initialUser]);

  if (!isOpen) return null;

  const isEditing = Boolean(initialUser);
  const isEditingSelf = initialUser?.id === currentUserId;

  const passwordValidation = password 
    ? validatePasswordStrength(password, securitySettings) 
    : { valid: true, errors: [], score: 0 };

  const handleRoleToggle = (roleId: string) => {
    // Empêcher l'utilisateur de révoquer ses propres droits d'administration
    if (isEditingSelf && roleId === 'role-super-admin') {
      alert("Mesure de sécurité : Vous ne pouvez pas retirer votre propre rôle Super Administrateur.");
      return;
    }

    if (selectedRoleIds.includes(roleId)) {
      if (selectedRoleIds.length === 1) {
        alert("Chaque compte doit conserver au minimum un rôle attribué.");
        return;
      }
      setSelectedRoleIds(selectedRoleIds.filter(id => id !== roleId));
    } else {
      setSelectedRoleIds([...selectedRoleIds, roleId]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim()) return;

    if (!isEditing && password) {
      if (!passwordValidation.valid) {
        alert(`Le mot de passe ne respecte pas la politique de sécurité :\n- ${passwordValidation.errors.join('\n- ')}`);
        return;
      }
    }

    onSave({
      id: initialUser?.id,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      name: `${firstName.trim()} ${lastName.trim()}`,
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      jobTitle: jobTitle.trim(),
      department: department.trim(),
      roleIds: selectedRoleIds,
      status,
      mfaEnabled,
      mustChangePassword
    }, password ? password : undefined);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {isEditing ? `Modifier l’utilisateur : ${initialUser?.name}` : 'Créer un nouvel utilisateur GRC-Goal'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Gestion fine des identités, des accès et des rôles organisationnels
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Prénom *</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nom de famille *</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Adresse e-mail professionnelle *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Numéro de téléphone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+227 90 00 00 00"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Fonction / Poste *</label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="Ex. Référent GRC, Responsable SI, Auditeur"
                required
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Département / Équipe</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Ex. Direction, Systèmes d’Information"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Statut du compte */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Statut opérationnel du compte</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['actif', 'suspendu', 'desactive', 'archive'] as UserStatus[]).map((st) => (
                <label 
                  key={st}
                  className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition capitalize ${
                    status === st ? 'bg-blue-50 border-blue-300 text-[#0B3B7B] font-bold' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    checked={status === st}
                    onChange={() => setStatus(st)}
                    className="text-[#0B3B7B] focus:ring-0"
                  />
                  <span>{st}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Rôles RBAC */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-900 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-[#0B3B7B]" />
                <span>Attribution des Rôles (RBAC) *</span>
              </label>
              <span className="text-[11px] text-slate-500">
                Principe du moindre privilège
              </span>
            </div>

            <div className="space-y-2 mt-2">
              {roles.map((r) => {
                const isChecked = selectedRoleIds.includes(r.id);
                return (
                  <label
                    key={r.id}
                    className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition ${
                      isChecked ? 'bg-white border-blue-300 shadow-xs' : 'bg-slate-100/50 border-slate-200 text-slate-500'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleRoleToggle(r.id)}
                      className="mt-0.5 rounded text-[#0B3B7B] focus:ring-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold text-white px-1.5 py-0.2 rounded ${r.color}`}>
                          {r.code}
                        </span>
                        <span className="font-bold text-slate-900">{r.name}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{r.description}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Mot de passe initial lors de la création */}
          {!isEditing && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <label className="font-bold text-slate-900 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-amber-600" />
                <span>Mot de passe d’initialisation</span>
              </label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={!isEditing}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-mono bg-white focus:outline-none"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Politique : min {securitySettings.passwordMinLength} car., majuscule, chiffre, symbole</span>
                {passwordValidation.valid ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Conforme
                  </span>
                ) : (
                  <span className="text-rose-600 font-medium">Non conforme</span>
                )}
              </div>
            </div>
          )}

          {/* Options de sécurité & MFA */}
          <div className="space-y-2 pt-1 border-t border-slate-200">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={mfaEnabled}
                onChange={(e) => setMfaEnabled(e.target.checked)}
                className="rounded text-[#0B3B7B] focus:ring-0"
              />
              <span className="font-semibold text-slate-800">
                Exiger l'authentification multifacteur (MFA / TOTP) pour ce compte
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={mustChangePassword}
                onChange={(e) => setMustChangePassword(e.target.checked)}
                className="rounded text-[#0B3B7B] focus:ring-0"
              />
              <span className="text-slate-600">
                Forcer le changement de mot de passe à la prochaine connexion
              </span>
            </label>
          </div>

          {/* Boutons d'action */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-bold text-white bg-[#0B3B7B] hover:bg-[#072a5a] rounded-lg transition shadow-xs"
            >
              {isEditing ? 'Enregistrer les modifications' : 'Créer l’utilisateur'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
