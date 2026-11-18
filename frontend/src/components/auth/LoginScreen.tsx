import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  AlertTriangle,
  KeyRound,
  CheckCircle2,
  Building2,
  Briefcase,
  Users
} from 'lucide-react';
import { UserAccount, RoleDefinition, SecuritySettings } from '../../types/auth';
import { apiService } from '../../services/api';

interface LoginScreenProps {
  accounts: UserAccount[];
  roles: RoleDefinition[];
  securitySettings: SecuritySettings;
  onLoginSuccess: (response: UserAccount | { user: UserAccount; access: string; refresh: string }) => void;
  onRecordAudit: (eventType: any, severity: any, details: string, email: string) => void;
  onRegisterNewOrg?: (
    userData: { name: string; email: string; password: string; jobTitle: string; phone?: string },
    orgData: { name: string; sector: string; size: string; phone?: string; grcScope?: string }
  ) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  accounts,
  roles,
  securitySettings,
  onLoginSuccess,
  onRecordAudit,
  onRegisterNewOrg
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // État de connexion
  const [email, setEmail] = useState('direction@sirbacom.ne');
  const [password, setPassword] = useState('PmeSecure2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApiLoading, setIsApiLoading] = useState(false);

  // État d'inscription nouvelle organisation (Cas B)
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('PmeSecure2026!');
  const [regJobTitle, setRegJobTitle] = useState('Gérant / Administrateur');
  const [regOrgName, setRegOrgName] = useState('');
  const [regSector, setRegSector] = useState('Services numériques & Conseil');
  const [regSize, setRegSize] = useState('15 collaborateurs (TPE/PME)');
  const [regPhone, setRegPhone] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null);

  // Validation de la complexité du mot de passe
  const validatePassword = (pwd: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const minLength = securitySettings.password_min_length || 8;
    const requireUpper = securitySettings.password_require_uppercase !== false;
    const requireDigit = securitySettings.password_require_numbers !== false;
    const requireSpecial = securitySettings.password_require_symbols !== false;

    if (pwd.length < minLength) {
      errors.push(`Le mot de passe doit contenir au moins ${minLength} caractères.`);
    }
    if (requireUpper && !/[A-Z]/.test(pwd)) {
      errors.push('Le mot de passe doit contenir au moins une majuscule.');
    }
    if (requireDigit && !/[0-9]/.test(pwd)) {
      errors.push('Le mot de passe doit contenir au moins un chiffre.');
    }
    if (requireSpecial && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) {
      errors.push('Le mot de passe doit contenir au moins un caractère spécial.');
    }

    return { isValid: errors.length === 0, errors };
  };

  // Calcul de la force du mot de passe
  const calculatePasswordStrength = (pwd: string): 'weak' | 'medium' | 'strong' => {
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (pwd.length >= 12) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[!@#$%^&*]/.test(pwd)) score += 1;

    if (score <= 2) return 'weak';
    if (score <= 3) return 'medium';
    return 'strong';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);
    setIsApiLoading(true);

    try {
      // Authentification via API Django
      const loginResponse = await apiService.login(email.trim(), password);
      const user = loginResponse.user;

      // Vérification du statut du compte
      if (user.status === 'suspendu') {
        onRecordAudit('LOGIN_FAILED', 'warning', `Tentative d’accès sur compte suspendu : ${user.email}`, user.email);
        setErrorMessage('Ce compte est suspendu par mesure de sécurité. Contactez votre administrateur.');
        setIsSubmitting(false);
        setIsApiLoading(false);
        return;
      }

      if (user.status === 'desactive' || user.status === 'archive') {
        onRecordAudit('LOGIN_FAILED', 'warning', `Tentative d’accès sur compte inactif : ${user.email}`, user.email);
        setErrorMessage('Ce compte est inactif ou archivé.');
        setIsSubmitting(false);
        setIsApiLoading(false);
        return;
      }



      // Connexion directe réussie
      onRecordAudit('LOGIN_SUCCESS', 'info', `Connexion API réussie pour ${user.name}`, user.email);
      onLoginSuccess(loginResponse);

    } catch (err) {
      console.error('Authentication error:', err);
      let errorMsg = 'Une erreur technique est survenue.';
      
      if (err instanceof Error) {
        const message = err.message.toLowerCase();
        if (message.includes('401') || message.includes('identifiants') || message.includes('invalid')) {
          errorMsg = 'Identifiants invalides. Verifiez votre courriel et mot de passe.';
        } else if (message.includes('403') || message.includes('forbidden')) {
          errorMsg = 'Acces refuse. Votre compte n\'a pas les permissions requises.';
        } else if (message.includes('network') || message.includes('fetch')) {
          errorMsg = 'Erreur de connexion au serveur. Verifiez votre connexion internet.';
        } else {
          errorMsg = err.message;
        }
      }
      
      setErrorMessage(errorMsg);
    } finally {
      setIsSubmitting(false);
      setIsApiLoading(false);
    }
  };


  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!regName.trim() || !regEmail.trim() || !regOrgName.trim()) {
      setErrorMessage('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (!regEmail.includes('@')) {
      setErrorMessage('Veuillez saisir une adresse courriel valide.');
      return;
    }

    // Validation du mot de passe
    const passwordValidation = validatePassword(regPassword);
    if (!passwordValidation.isValid) {
      setErrorMessage(passwordValidation.errors[0]);
      return;
    }

    // Confirmation du mot de passe
    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Les mots de passe ne correspondent pas.');
      return;
    }

    if (onRegisterNewOrg) {
      onRegisterNewOrg(
        {
          name: regName.trim(),
          email: regEmail.trim().toLowerCase(),
          password: regPassword,
          jobTitle: regJobTitle.trim() || 'Dirigeant PME',
          phone: regPhone.trim()
        },
        {
          name: regOrgName.trim(),
          sector: regSector.trim(),
          size: regSize.trim(),
          phone: regPhone.trim(),
          grcScope: 'Système d’information, postes de travail, facturation et données clients'
        }
      );
    }
  };

  const handleQuickLoginAs = (userEmail: string) => {
    const user = accounts.find(u => u.email === userEmail);
    if (!user) return;

    if (user.status === 'suspendu') {
      setEmail(user.email);
      setPassword('PmeSecure2026!');
      setErrorMessage('Ce compte est actuellement suspendu dans le système.');
      return;
    }

    setEmail(user.email);
    setPassword('PmeSecure2026!');
    onRecordAudit('LOGIN_SUCCESS', 'info', `Accès rapide démonstration pour ${user.name}`, user.email);
    onLoginSuccess(user);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
      
      {/* Conteneur principal d'authentification */}
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        
        {/* En-tête avec Logo GRC-Goal */}
        <div className="bg-gradient-to-br from-[#0B3B7B] to-[#07244C] p-6 text-white text-center">
          <div className="w-16 h-16 bg-white rounded-2xl mx-auto flex items-center justify-center p-2 shadow-lg mb-3">
            <img 
              src="/assets/aistudio/Logo_GRC-Goal___croissance_et_conformit__dd12a5d7.png" 
              alt="GRC-Goal Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-xl font-black tracking-tight">
            GRC-<span className="text-[#F25C05]">Goal</span>
          </h1>
          <p className="text-xs text-blue-200 mt-0.5 font-medium">
            Gouvernance, Risques & Conformité · TPE & PME
          </p>
        </div>

        {/* Onglets : Connexion existante (Cas A) vs Créer une organisation (Cas B) */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold">
            <button
              onClick={() => { setActiveTab('login'); setErrorMessage(''); }}
              className={`flex-1 py-3 text-center transition flex items-center justify-center gap-1.5 ${
                activeTab === 'login'
                  ? 'bg-white text-[#0B3B7B] border-b-2 border-[#0B3B7B]'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Se Connecter</span>
            </button>
            <button
              onClick={() => { setActiveTab('register'); setErrorMessage(''); }}
              className={`flex-1 py-3 text-center transition flex items-center justify-center gap-1.5 ${
                activeTab === 'register'
                  ? 'bg-white text-[#0B3B7B] border-b-2 border-[#0B3B7B]'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-[#F25C05]" />
              <span>Créer une Organisation</span>
            </button>
          </div>

        {/* Corps du formulaire */}
        <div className="p-6">
          
          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-start gap-2 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* CAS A : Formulaire de connexion standard */}
          {activeTab === 'login' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Courriel professionnel
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nom@entreprise.ne"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-[#0B3B7B] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Mot de passe
                  </label>
                  <span className="text-[10px] text-slate-400">PmeSecure2026!</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-9 py-2 text-xs rounded-lg border border-slate-300 focus:border-[#0B3B7B] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-[#0B3B7B] hover:bg-[#072a5a] text-white font-bold text-xs rounded-lg transition shadow-md flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Vérification...' : 'Accéder à mon espace GRC'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {/* CAS B : Inscription & Création d'une nouvelle organisation */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div className="bg-blue-50/70 p-2.5 rounded-lg border border-blue-200/60 text-[11px] text-[#0B3B7B] mb-2 leading-relaxed">
                <strong>Parcours Nouvel Utilisateur (Cas B) :</strong> Créez votre compte et votre organisation en une seule étape. Vous deviendrez automatiquement Administrateur Organisation (PME).
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                    Votre Nom complet *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex. Moussa Dan Kori"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-[#0B3B7B] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                    Votre Fonction *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex. Gérant / Dirigeant"
                    value={regJobTitle}
                    onChange={(e) => setRegJobTitle(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-[#0B3B7B] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                    Courriel professionnel *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="directeur@maboutique.ne"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-[#0B3B7B] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                    Mot de passe *
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => {
                      setRegPassword(e.target.value);
                      setPasswordStrength(calculatePasswordStrength(e.target.value));
                    }}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-[#0B3B7B] focus:outline-none"
                  />
                  {passwordStrength && (
                    <div className="mt-1 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all ${
                            passwordStrength === 'weak' ? 'bg-rose-500 w-1/3' :
                            passwordStrength === 'medium' ? 'bg-amber-500 w-2/3' :
                            'bg-emerald-500 w-full'
                          }`}
                        />
                      </div>
                      <span className={`text-[9px] font-medium ${
                        passwordStrength === 'weak' ? 'text-rose-600' :
                        passwordStrength === 'medium' ? 'text-amber-600' :
                        'text-emerald-600'
                      }`}>
                        {passwordStrength === 'weak' ? 'Faible' :
                         passwordStrength === 'medium' ? 'Moyen' : 'Fort'}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                    Confirmer le mot de passe *
                  </label>
                  <input
                    type="password"
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-[#0B3B7B] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-1 border-t border-slate-100">
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                  Nom de l’Organisation (PME / TPE) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex. Sahel Tech Solutions ou Cabinet Alpha"
                  value={regOrgName}
                  onChange={(e) => setRegOrgName(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-[#0B3B7B] focus:outline-none font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                    Secteur d'activité
                  </label>
                  <select
                    value={regSector}
                    onChange={(e) => setRegSector(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-[#0B3B7B] focus:outline-none bg-white"
                  >
                    <option value="Services numériques & Conseil">Services numériques</option>
                    <option value="Commerce & Distribution">Commerce & Vente</option>
                    <option value="Santé & Pharmacie">Santé & Médical</option>
                    <option value="Finance & Comptabilité">Finance & Audit</option>
                    <option value="Industrie & Agroalimentaire">Industrie</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                    Effectif
                  </label>
                  <select
                    value={regSize}
                    onChange={(e) => setRegSize(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-[#0B3B7B] focus:outline-none bg-white"
                  >
                    <option value="1 à 5 collaborateurs (TPE)">1 à 5 collabs</option>
                    <option value="6 à 15 collaborateurs (TPE/PME)">6 à 15 collabs</option>
                    <option value="16 à 50 collaborateurs (PME)">16 à 50 collabs</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-[#F25C05] hover:bg-[#d95204] text-white font-bold text-xs rounded-lg transition shadow-md flex items-center justify-center gap-2 mt-3"
              >
                <Building2 className="w-4 h-4" />
                <span>Créer mon organisation et démarrer</span>
              </button>
            </form>
          )}

        </div>

        {/* Panneau de Sélection Rapide des Profils Démo (Cas A) */}
        {activeTab === 'login' && (
          <div className="bg-slate-50 p-4 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#F25C05]" />
                <span>Tester sous un profil démo (1 clic)</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              {accounts.slice(0, 4).map(u => {
                const roleName = roles.find(r => u.roleIds.includes(r.id))?.name || 'Rôle';
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleQuickLoginAs(u.email)}
                    className="p-2 rounded-lg border text-left transition flex items-center gap-2 hover:border-[#0B3B7B] bg-white border-slate-200"
                  >
                    <div className={`w-5 h-5 rounded ${u.avatarColor} text-white flex items-center justify-center text-[10px] font-bold shrink-0`}>
                      {u.firstName[0]}
                    </div>
                    <div className="truncate">
                      <div className="font-semibold text-slate-800 truncate">{u.name.split(' ')[0]}</div>
                      <div className="text-[9px] text-slate-500 truncate">{roleName.split(' ')[0]}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </div>

      <div className="mt-4 text-xs text-slate-400 text-center">
        <span>GRC-Goal · Programme d’Excellence en Cybersécurité · Niger 2026 · Sujet B14</span>
      </div>

    </div>
  );
};
