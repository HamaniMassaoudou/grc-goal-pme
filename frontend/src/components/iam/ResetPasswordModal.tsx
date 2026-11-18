import React, { useState } from 'react';
import { X, KeyRound, Copy, Check, ShieldAlert } from 'lucide-react';
import { UserAccount } from '../../types/auth';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAccount | null;
  onConfirmReset: (userId: string, newPassword: string, forceChange: boolean) => void;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  isOpen,
  onClose,
  user,
  onConfirmReset
}) => {
  const [tempPassword, setTempPassword] = useState('PmeTemp2026!@');
  const [forceChange, setForceChange] = useState(true);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !user) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(tempPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerate = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
    let res = 'Tmp';
    for (let i = 0; i < 9; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    res += '26!';
    setTempPassword(res);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmReset(user.id, tempPassword, forceChange);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md flex flex-col animate-in fade-in zoom-in-95">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-amber-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Réinitialisation de Mot de Passe
            </h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <p className="text-slate-600">
            Vous vous apprêtez à réinitialiser les identifiants d’accès pour l’utilisateur{' '}
            <strong className="text-slate-900">{user.name}</strong> ({user.email}).
          </p>

          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Avertissement de sécurité</span>
            </div>
            <p className="text-[11px]">
              Toutes les sessions actives existantes de cet utilisateur seront immédiatement révoquées et l'opération sera inscrite dans le journal d'audit.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700">Nouveau mot de passe temporaire</label>
              <button
                type="button"
                onClick={handleGenerate}
                className="text-[11px] text-[#0B3B7B] hover:underline font-medium"
              >
                Générer un autre
              </button>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tempPassword}
                onChange={(e) => setTempPassword(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-sm bg-slate-50 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-slate-700 flex items-center gap-1 shrink-0 transition"
                title="Copier le mot de passe temporaire"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copié' : 'Copier'}</span>
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={forceChange}
              onChange={(e) => setForceChange(e.target.checked)}
              className="rounded text-[#0B3B7B] focus:ring-0"
            />
            <span className="text-slate-700 font-medium">
              Obliger l'utilisateur à définir un nouveau mot de passe lors de sa reconnexion
            </span>
          </label>

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
              className="px-4 py-2 font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition shadow-xs"
            >
              Confirmer la réinitialisation
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
