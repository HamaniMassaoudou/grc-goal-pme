import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Laptop, 
  Smartphone, 
  Clock, 
  LogOut, 
  Lock, 
  Save, 
  AlertTriangle,
  CheckCircle2,
  Sliders
} from 'lucide-react';
import { UserSession, SecuritySettings, UserAccount } from '../../types/auth';

interface SessionsListProps {
  sessions: UserSession[];
  currentSessionId: string | null;
  securitySettings: SecuritySettings;
  users: UserAccount[];
  canManageSettings: boolean;
  onRevokeSession: (sessionId: string) => void;
  onRevokeAllOtherSessions: () => void;
  onUpdateSecuritySettings: (newSettings: SecuritySettings) => void;
}

export const SessionsList: React.FC<SessionsListProps> = ({
  sessions,
  currentSessionId,
  securitySettings,
  users,
  canManageSettings,
  onRevokeSession,
  onRevokeAllOtherSessions,
  onUpdateSecuritySettings
}) => {
  const [settings, setSettings] = useState<SecuritySettings>(securitySettings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSecuritySettings(settings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Sessions Actives */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Laptop className="w-4 h-4 text-[#0B3B7B]" />
              <span>Sessions Utilisateurs Actives ({sessions.length})</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Surveillance et révocation immédiate des jetons d’accès en cas de compromission
            </p>
          </div>

          {sessions.length > 1 && (
            <button
              onClick={onRevokeAllOtherSessions}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Révoquer toutes les autres sessions</span>
            </button>
          )}
        </div>

        <div className="divide-y divide-slate-100">
          {sessions.map((sess) => {
            const user = users.find(u => u.id === sess.userId);
            const isCurrent = sess.id === currentSessionId || sess.isCurrent;

            return (
              <div key={sess.id} className="py-3.5 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`p-2 rounded-lg ${isCurrent ? 'bg-blue-50 text-[#0B3B7B]' : 'bg-slate-100 text-slate-600'}`}>
                    <Laptop className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 truncate">
                        {user?.name || 'Utilisateur inconnu'}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                          Session actuelle
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                      {sess.device} · IP : <span className="font-mono">{sess.ip}</span>
                    </p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1">
                      <span>Créée : {sess.createdAt.slice(0, 16).replace('T', ' ')}</span>
                      <span>·</span>
                      <span>Dernière activité : {sess.lastActivityAt.slice(0, 16).replace('T', ' ')}</span>
                    </div>
                  </div>
                </div>

                {!isCurrent && (
                  <button
                    onClick={() => onRevokeSession(sess.id)}
                    className="px-2.5 py-1 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition shrink-0"
                    title="Terminer cette session à distance"
                  >
                    Révoquer
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Paramètres de Sécurité & Politique de Mots de Passe */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-600" />
              <span>Politique Globale de Sécurité & Robustesse</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Configuration des exigences d’authentification, verrouillage anti force-brute et sessions
            </p>
          </div>

          {savedSuccess && (
            <span className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded font-semibold animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Politique enregistrée !</span>
            </span>
          )}
        </div>

        <form onSubmit={handleSettingsSubmit} className="space-y-4 text-xs">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Règles de robustesse */}
            <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-900 block text-xs border-b border-slate-200 pb-1">
                Exigences des mots de passe
              </span>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Longueur minimale des mots de passe
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="8"
                    max="32"
                    value={settings.passwordMinLength}
                    onChange={(e) => setSettings({ ...settings, passwordMinLength: parseInt(e.target.value, 10) || 8 })}
                    disabled={!canManageSettings}
                    className="w-24 px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-mono"
                  />
                  <span className="text-slate-500">caractères</span>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.passwordRequireUppercase}
                    onChange={(e) => setSettings({ ...settings, passwordRequireUppercase: e.target.checked })}
                    disabled={!canManageSettings}
                    className="rounded text-[#0B3B7B] focus:ring-0"
                  />
                  <span>Exiger au moins une lettre majuscule (A-Z)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.passwordRequireNumbers}
                    onChange={(e) => setSettings({ ...settings, passwordRequireNumbers: e.target.checked })}
                    disabled={!canManageSettings}
                    className="rounded text-[#0B3B7B] focus:ring-0"
                  />
                  <span>Exiger au moins un chiffre (0-9)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.passwordRequireSymbols}
                    onChange={(e) => setSettings({ ...settings, passwordRequireSymbols: e.target.checked })}
                    disabled={!canManageSettings}
                    className="rounded text-[#0B3B7B] focus:ring-0"
                  />
                  <span>Exiger au moins un caractère spécial (@, #, $, !, etc.)</span>
                </label>
              </div>
            </div>

            {/* Protection force brute & sessions */}
            <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-900 block text-xs border-b border-slate-200 pb-1">
                Protection Anti-Brute Force & Sessions
              </span>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Nombre maximum de tentatives de connexion échouées
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="3"
                    max="10"
                    value={settings.maxFailedAttempts}
                    onChange={(e) => setSettings({ ...settings, maxFailedAttempts: parseInt(e.target.value, 10) || 5 })}
                    disabled={!canManageSettings}
                    className="w-24 px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-mono"
                  />
                  <span className="text-slate-500">tentatives avant verrouillage temporaire</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Durée de verrouillage du compte après échecs répétés
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="5"
                    max="60"
                    value={settings.lockoutDurationMinutes}
                    onChange={(e) => setSettings({ ...settings, lockoutDurationMinutes: parseInt(e.target.value, 10) || 15 })}
                    disabled={!canManageSettings}
                    className="w-24 px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-mono"
                  />
                  <span className="text-slate-500">minutes de temporisation</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Délai d’expiration d'inactivité de session
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="15"
                    max="480"
                    value={settings.sessionTimeoutMinutes}
                    onChange={(e) => setSettings({ ...settings, sessionTimeoutMinutes: parseInt(e.target.value, 10) || 120 })}
                    disabled={!canManageSettings}
                    className="w-24 px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-mono"
                  />
                  <span className="text-slate-500">minutes avant déconnexion automatique</span>
                </div>
              </div>
            </div>

          </div>

          {canManageSettings && (
            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 font-bold text-white bg-[#0B3B7B] hover:bg-[#072a5a] rounded-lg transition shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Enregistrer la politique de sécurité</span>
              </button>
            </div>
          )}
        </form>
      </div>

    </div>
  );
};
